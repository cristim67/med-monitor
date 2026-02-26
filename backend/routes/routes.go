package routes

import (
	"net/http"

	"github.com/casbin/casbin/v3"
	"github.com/cristim67/med-monitor/backend/handlers"
	"github.com/cristim67/med-monitor/backend/middleware"
	"github.com/cristim67/med-monitor/backend/services"
	"github.com/gin-gonic/gin"
)

func SetupRouter(enforcer *casbin.Enforcer, userService services.UserService, medicalService services.MedicalService) *gin.Engine {
	r := gin.New()
	r.Use(middleware.LoggerMiddleware())
	r.Use(gin.Recovery())
	r.Use(middleware.CORSMiddleware())

	// Unprotected route
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong"})
	})

	// Handlers
	medHandler := handlers.NewMedicalHandler(medicalService)
	userHandler := handlers.NewUserHandler(userService)

	// Protected routes group
	v1 := r.Group("/api/v1")
	v1.Use(middleware.AuthMiddleware(enforcer, userService))
	{
		v1.GET("/profile", userHandler.GetProfile)

		// Admin only: User management
		v1.GET("/users", userHandler.ListUsers)
		v1.PUT("/users/:id/role", userHandler.UpdateUserRole)
		// Departments & Catalog
		v1.GET("/departments", medHandler.GetDepartments)
		v1.POST("/departments", medHandler.CreateDepartment)
		v1.PUT("/departments/:id", medHandler.UpdateDepartment)
		v1.DELETE("/departments/:id", medHandler.DeleteDepartment)

		v1.GET("/doctors", medHandler.GetDoctors)
		// ... potentially more later

		// Patients
		v1.GET("/patients", medHandler.GetPatients)
		v1.GET("/patients/:id/history", medHandler.GetPatientHistory)

		// Appointments
		v1.GET("/appointments", medHandler.GetMyAppointments)
		v1.POST("/appointments", medHandler.CreateAppointment)
		v1.PUT("/appointments/:id/complete", medHandler.CompleteAppointment)
		v1.PUT("/appointments/:id/cancel", medHandler.CancelAppointment)
		v1.DELETE("/appointments/:id", medHandler.DeleteAppointment)

		// Prescriptions
		v1.GET("/prescriptions", medHandler.GetMyPrescriptions)
		v1.PUT("/prescriptions/:id", medHandler.UpdatePrescription)
	}

	return r
}
