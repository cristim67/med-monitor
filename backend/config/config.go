package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL    string
	GoogleClientID string
	Environment    string
	Port           string
}

// AppConfig holds the global configs parsed from .env
var AppConfig Config

func LoadConfig() {
	// ignoring godotenv errors to allow parsing env vars passed directly in deployment
	_ = godotenv.Load(".env")

	AppConfig = Config{
		DatabaseURL:    os.Getenv("DATABASE_URL"),
		GoogleClientID: os.Getenv("GOOGLE_CLIENT_ID"),
		Environment:    os.Getenv("ENVIRONMENT"),
		Port:           os.Getenv("PORT"),
	}

	if AppConfig.Port == "" {
		AppConfig.Port = "8080"
	}
	if AppConfig.Environment == "" {
		AppConfig.Environment = "development"
	}

	if AppConfig.DatabaseURL == "" {
		log.Println("WARNING: DATABASE_URL is not set!")
	}
}
