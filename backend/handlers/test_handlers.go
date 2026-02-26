package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type TestHandler interface {
	GetPatients(c *gin.Context)
	GetAppointments(c *gin.Context)
	CreateAppointment(c *gin.Context)
}

type testHandler struct{}

func NewTestHandler() TestHandler {
	return &testHandler{}
}

func (h *testHandler) GetPatients(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Access to patient data granted.",
		"user_id": c.GetUint("user_id"),
		"role":    c.GetString("user_role"),
	})
}

func (h *testHandler) GetAppointments(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"data": "Access to appointments granted."})
}

func (h *testHandler) CreateAppointment(c *gin.Context) {
	c.JSON(http.StatusCreated, gin.H{"data": "Appointment created successfully."})
}
