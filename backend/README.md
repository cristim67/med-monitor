# 🚄 Med-Monitor Backend | Go-Powered API Engine

This directory contains the core API service for the Med-Monitor system. Engineered with **Go**, it provides a high-performance, stateless RESTful interface for medical facility management.

---

## 🛠️ Technology Stack

- **Framework**: [Gin Gonic](https://gin-gonic.com/) (High-performance HTTP web framework)
- **ORM**: [GORM](https://gorm.io/) (Fantastic ORM library for Golang)
- **Authorization**: [Casbin](https://casbin.org/) (RBAC/ABAC permission engine)
- **Database**: PostgreSQL
- **migrations**: [golang-migrate](https://github.com/golang-migrate/migrate)
- **Authentication**: JWT & Google OAuth 2.0
- **Deployment**: [Genezio](https://genez.io/) (Serverless Containers)

---

## 🏗️ Architecture Overview

The backend follows a modular **Repository-Service-Handler** pattern:

- **`/models`**: Data structures and GORM entities.
- **`/repository`**: Database interaction layer (CRUD operations).
- **`/services`**: Business logic orchestration.
- **`/handlers`**: HTTP request processing and response formatting.
- **`/middleware`**: Auth, Logger, CORS, and Casbin enforcer.
- **`/migrations`**: SQL schema version control.

---

## 🚀 Local Development

### Prerequisites

- Go 1.22+
- Docker (for PostgreSQL)

### Setup

1. Create a `.env` file based on `.env.example`:

   ```env
   DATABASE_URL=postgres://user:pass@localhost:5432/medmonitor
   GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
   PORT=8080
   ```

2. Download dependencies:

   ```bash
   go mod download
   ```

3. Run the application:

   ```bash
   go run main.go
   ```

---

## ☁️ Deployment (Genezio)

This project is configured for persistent container deployment on **Genezio**.

### Automated Deploy

```bash
genezio deploy
```

### Manual Configuration

Ensure the following are set in the Genezio Dashboard:

- **Persistent Storage**: Enabled in `genezio.yaml`.
- **Environment Variables**: `DATABASE_URL` (PostgreSQL connection string).

---

## 🛡️ API Security

All `/api/v1/*` routes except `/ping` are protected by:

1. **JWT Verification**: Validates the Google ID Token.
2. **Casbin RBAC**: Enforces permissions defined in `casbin/policy.csv`.

### Health Check

`GET https://<your-deploy-url>/ping` -> `{"message":"pong"}`

---
© 2026 Med-Monitor Systems
