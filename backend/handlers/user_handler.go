package handlers

import (
	"net/http"
	"strconv"

	"github.com/cristim67/med-monitor/backend/models"
	"github.com/cristim67/med-monitor/backend/services"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	service services.UserService
}

func NewUserHandler(service services.UserService) *UserHandler {
	return &UserHandler{service: service}
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	// ... (rest remains similar)
	id := c.GetUint("user_id")
	email := c.GetString("user_email")
	role := c.GetString("user_role")
	name := c.GetString("user_name")
	picture := c.GetString("user_picture")

	c.JSON(http.StatusOK, models.User{
		ID:      id,
		Email:   email,
		Role:    role,
		Name:    name,
		Picture: picture,
	})
}

func (h *UserHandler) ListUsers(c *gin.Context) {
	users, err := h.service.GetAllUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}

func (h *UserHandler) UpdateUserRole(c *gin.Context) {
	userIDStr := c.Param("id")
	var body struct {
		Role string `json:"role"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	idVal, _ := strconv.ParseUint(userIDStr, 10, 32)
	if err := h.service.UpdateUserRole(uint(idVal), body.Role); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User role updated"})
}
