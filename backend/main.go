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

	// Seed initial policies if missing
	hasDoctorPolicy, _ := enforcer.HasPolicy(string(models.RoleDoctor), "/api/v1/profile", "(GET)")
	if !hasDoctorPolicy {
		log.Println("Seeding missing Doctor/Patient Casbin policies into DB...")
		enforcer.AddPolicy(string(models.RoleAdmin), "/api/v1/*", ".*")

		enforcer.AddPolicy(string(models.RoleDoctor), "/api/v1/profile", "(GET)")
		enforcer.AddPolicy(string(models.RoleDoctor), "/api/v1/patients", "(GET)")
		enforcer.AddPolicy(string(models.RoleDoctor), "/api/v1/patients/:id/history", "(GET)")
		enforcer.AddPolicy(string(models.RoleDoctor), "/api/v1/appointments", "(GET)|(POST)")
		enforcer.AddPolicy(string(models.RoleDoctor), "/api/v1/appointments/:id/complete", "(PUT)")
		enforcer.AddPolicy(string(models.RoleDoctor), "/api/v1/appointments/:id/cancel", "(PUT)")
		enforcer.AddPolicy(string(models.RoleDoctor), "/api/v1/prescriptions", "(GET)")
		enforcer.AddPolicy(string(models.RoleDoctor), "/api/v1/prescriptions/:id", "(PUT)")

		enforcer.AddPolicy(string(models.RolePatient), "/api/v1/profile", "(GET)")
		enforcer.AddPolicy(string(models.RolePatient), "/api/v1/appointments", "(GET)|(POST)")
		enforcer.AddPolicy(string(models.RolePatient), "/api/v1/appointments/:id/cancel", "(PUT)")
		enforcer.AddPolicy(string(models.RolePatient), "/api/v1/prescriptions", "(GET)")
		enforcer.AddPolicy(string(models.RolePatient), "/api/v1/doctors", "(GET)")
		enforcer.AddPolicy(string(models.RolePatient), "/api/v1/doctors/:id/availability", "(GET)")
		enforcer.AddPolicy(string(models.RolePatient), "/api/v1/departments", "(GET)")

		enforcer.AddPolicy(string(models.RoleDoctor), "/api/v1/doctors/:id/availability", "(GET)")

		enforcer.SavePolicy()
	}

	// 5. Seed Departments if empty
	depts, _ := medicalRepo.GetAllDepartments()
	if len(depts) == 0 {
		log.Println("Seeding default departments...")
		medicalRepo.CreateDepartment(&models.Department{Name: "General Medicine", Description: "Primary care unit"})
		medicalRepo.CreateDepartment(&models.Department{Name: "Cardiology", Description: "Heart & cardiovascular care"})
		medicalRepo.CreateDepartment(&models.Department{Name: "Neurology", Description: "Brain & nervous system specialized unit"})
		medicalRepo.CreateDepartment(&models.Department{Name: "Pediatrics", Description: "Child healthcare department"})
	}

	// 6. Setup Router
	r := routes.SetupRouter(enforcer, userService, medicalService)

	// 6. Start server
	log.Printf("Server executing on :%s", config.AppConfig.Port)
	if err := r.Run(":" + config.AppConfig.Port); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
