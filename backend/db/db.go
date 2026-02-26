package db

import (
	"log"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB(dsn string) {
	if dsn == "" {
		log.Fatal("Database DSN is empty")
	}

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger:                                   logger.Default.LogMode(logger.Silent),
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		log.Fatalf("Failed to connect to database using GORM: %v", err)
	}

	log.Println("GORM Database connection established")

	// Run Golang-Migrate using the same DSN URL format (since postgres accepts URL format for migrations)
	runMigrations(dsn)
}

func runMigrations(dsn string) {
	m, err := migrate.New("file://migrations", dsn)
	if err != nil {
		log.Fatalf("Failed to create migration instance: %v", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatalf("Warning/Error while running migrations: %v", err)
	} else if err == migrate.ErrNoChange {
		log.Println("Migrations up-to-date")
	} else {
		log.Println("Database schemas migrated successfully")
	}
}
