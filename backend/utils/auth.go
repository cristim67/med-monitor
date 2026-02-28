package utils

import (
	"context"
	"errors"
	"strings"

	"github.com/cristim67/med-monitor/backend/config"
	"google.golang.org/api/idtoken"
)

type GoogleClaims struct {
	Email    string
	GoogleID string
	Name     string
	Picture  string
}

func ValidateAndExtractClaims(authHeader string) (*GoogleClaims, error) {
	if authHeader == "" {
		return nil, errors.New("unauthorized, provide Bearer token in Authorization header")
	}

	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		return nil, errors.New("authorization header format must be Bearer {token}")
	}

	tokenStr := parts[1]

	// Validate with Google
	payload, err := idtoken.Validate(context.Background(), tokenStr, config.AppConfig.GoogleClientID)
	if err != nil {
		return nil, errors.New("invalid Google Token: " + err.Error())
	}

	if payload.Claims["email"] == nil {
		return nil, errors.New("email not found in token")
	}

	claims := &GoogleClaims{
		Email:    payload.Claims["email"].(string),
		GoogleID: payload.Subject,
	}

	if name, ok := payload.Claims["name"].(string); ok {
		claims.Name = name
	}
	if pic, ok := payload.Claims["picture"].(string); ok {
		claims.Picture = pic
	}

	return claims, nil
}
