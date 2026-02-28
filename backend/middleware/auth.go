package middleware

import (
	"log"
	"net/http"

	"github.com/casbin/casbin/v3"
	"github.com/cristim67/med-monitor/backend/services"
	"github.com/cristim67/med-monitor/backend/utils"
	"github.com/gin-gonic/gin"
)

// AuthMiddleware validates the Google Bearer token and enforcing RBAC
func AuthMiddleware(e *casbin.Enforcer, userService services.UserService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")

		claims, err := utils.ValidateAndExtractClaims(authHeader)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		user, err := userService.GetOrCreateUserByClaims(claims)
		if err != nil {
			log.Printf("Error authing user %s: %v", claims.Email, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process user"})
			c.Abort()
			return
		}

		// Inject info into request scope
		c.Set("user_id", user.ID)
		c.Set("user_role", string(user.Role))
		c.Set("user_email", user.Email)
		c.Set("user_picture", user.Picture)
		c.Set("user_name", user.Name)

		// Check RBAC permission for the role
		obj := c.Request.URL.Path
		act := c.Request.Method
		roleStr := string(user.Role)
		ok, err := e.Enforce(roleStr, obj, act)
		if err != nil {
			log.Printf("RBAC Enforce error for user %d (role %s): %v", user.ID, user.Role, err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Error occurred when authorizing user",
				"details": err.Error(),
				"role":    string(user.Role),
			})
			c.Abort()
			return
		}

		if ok {
			c.Next()
		} else {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Forbidden: role '" + string(user.Role) + "' does not have access to " + obj + " [" + act + "]",
			})
			c.Abort()
		}
	}
}
