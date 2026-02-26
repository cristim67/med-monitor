package main

import (
	"log"

	"github.com/casbin/casbin/v3"
	gormadapter "github.com/casbin/gorm-adapter/v3"
	"github.com/cristim67/med-monitor/backend/config"
	"github.com/cristim67/med-monitor/backend/db"
	"github.com/cristim67/med-monitor/backend/models"
	"github.com/cristim67/med-monitor/backend/repository"
	"github.com/cristim67/med-monitor/backend/routes"
	"github.com/cristim67/med-monitor/backend/services"
)

func main() {
	// 1. Load configuration
	config.LoadConfig()

	// 2. Initialize Database and run migrations
	db.InitDB(config.AppConfig.DatabaseURL)

	// 3. Initialize Repositories and Services
	userRepo := repository.NewUserRepository(db.DB)
	medicalRepo := repository.NewMedicalRepository(db.DB)

	userService := services.NewUserService(userRepo, medicalRepo)
	medicalService := services.NewMedicalService(medicalRepo)

	// 4. Initialize Enforcer with GORM adapter
	adapter, err := gormadapter.NewAdapterByDB(db.DB)
	if err != nil {
		log.Fatalf("Failed to initialize Casbin adapter: %v", err)
	}

	enforcer, err := casbin.NewEnforcer("casbin/model.conf", adapter)
	if err != nil {
		log.Fatalf("Failed to initialize Casbin enforcer: %v", err)
	}

	// Load policies from DB
	if err := enforcer.LoadPolicy(); err != nil {
		log.Fatalf("Failed to load policies: %v", err)
	}

	// Seed initial policies if DB is empty
	allPolicies, _ := enforcer.GetPolicy()
	if len(allPolicies) == 0 {
		log.Println("Seeding initial Casbin policies into DB...")
		enforcer.AddPolicy("admin", "/api/v1/*", ".*")
		enforcer.AddPolicy("admin", "/api/v1/users", "(GET)|(PUT)")
		enforcer.AddPolicy("admin", "/api/v1/users/:id/role", "(PUT)")

		enforcer.AddPolicy("doctor", "/api/v1/profile", "(GET)")
		enforcer.AddPolicy("doctor", "/api/v1/patients", "(GET)")
		enforcer.AddPolicy("doctor", "/api/v1/patients/:id/history", "(GET)")
		enforcer.AddPolicy("doctor", "/api/v1/appointments", "(GET)")
		enforcer.AddPolicy("doctor", "/api/v1/appointments/:id/complete", "(PUT)")
		enforcer.AddPolicy("doctor", "/api/v1/appointments/:id/cancel", "(PUT)")

		enforcer.AddPolicy("patient", "/api/v1/profile", "(GET)")
		enforcer.AddPolicy("patient", "/api/v1/appointments", "(GET)|(POST)")
		enforcer.AddPolicy("patient", "/api/v1/appointments/:id/cancel", "(PUT)")
		enforcer.AddPolicy("patient", "/api/v1/prescriptions", "(GET)")
		enforcer.AddPolicy("patient", "/api/v1/doctors", "(GET)")
		enforcer.AddPolicy("patient", "/api/v1/departments", "(GET)")

		enforcer.SavePolicy()
	}

	// 5. Setup Router
	r := routes.SetupRouter(enforcer, userService, medicalService)

	// -- DEV ONLY: Ensure specific user is Admin --
	db.DB.Model(&models.User{}).Where("email = ?", "cristi@genez.io").Update("role", "admin")
	// ---------------------------------------------

	// -- DEV ONLY: Seed Departments and Doctors --
	var count int64
	db.DB.Model(&models.Department{}).Count(&count)
	if count == 0 {
		log.Println("Seeding departments...")
		cardiology := models.Department{Name: "Cardiology", Description: "Heart and blood vessels"}
		neurology := models.Department{Name: "Neurology", Description: "Nervous system"}
		db.DB.Create(&cardiology)
		db.DB.Create(&neurology)

		// Create a mock doctor if one doesn't exist
		var docCount int64
		db.DB.Model(&models.Doctor{}).Count(&docCount)
		if docCount == 0 {
			// Find an admin or create a specific user for this
			var admin models.User
			if err := db.DB.Where("role = ?", "admin").First(&admin).Error; err == nil {
				db.DB.Create(&models.Doctor{
					ID:             admin.ID,
					DepartmentID:   cardiology.ID,
					Specialization: "Senior Cardiologist",
				})
			}
		}
	}
	// ---------------------------------------------

	// 6. Start server
	log.Printf("Server executing on :%s", config.AppConfig.Port)
	if err := r.Run(":" + config.AppConfig.Port); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
