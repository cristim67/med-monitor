# Med-Monitor

A complex web application for monitoring patients within a medical facility, encompassing scheduling, consultations, diagnostics, and treatment tracking.

## 🏗️ Structure

- **frontend/**: React + TypeScript + Vite. Premium Dark-Mode Glassmorphism UI for Admin, Doctor, and Patient.
- **backend/**: Go (Golang) + Gin application, modular architecture (Repositories, Services, Handlers).
- **docs/**: Conceptual and functional modeling defining the system's actors and features.

## 🛠️ Tech Stack

- **Backend**: Go 1.22, Gin Gonic, Casbin (RBAC), GORM.
- **Frontend**: React 18, Vite, TypeScript, Vanilla CSS (Premium UI), Axios with Interceptors.
- **Database**: PostgreSQL (Production-ready, compatible with Neon/Cloud providers).
- **Auth**: Google OAuth 2.0 (Identity validation on backend).
- **Orchestration**: Docker Compose.

---

## 🚀 Getting Started

### 1. Prerequisites

- **Docker & Docker Compose**: Ensure the Docker daemon is running on your machine.
- **Google Cloud Console**: Create a project and obtain a **Google Client ID**.
- **PostgreSQL**: A running instance (e.g., [Neon.tech](https://neon.tech)) or any Postgres URI.

### 2. Configuration (`.env`)

#### **Backend** (`backend/.env`)

Create a file at `backend/.env` with:

```env
DATABASE_URL=your_postgresql_connection_string
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
ENVIRONMENT=production
PORT=8080
```

#### **Frontend** (`frontend/.env`)

Create a file at `frontend/.env` with:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_API_URL=http://localhost:8080
```

### 3. Running the System

Execute the following command in the root directory:

```bash
docker-compose up --build
```

*Note: The `version` attribute in docker-compose.yml is obsolete for recent Docker versions but kept for legacy support.*

### 4. Database Migrations

The backend uses `golang-migrate`. Migrations run automatically on startup.

- **Initial Schema**: Handled via `backend/migrations/000001_init_schema.up.sql`.
- **Soft Delete**: All tables support soft deletion via GORM's `DeletedAt`.

---

## 🔐 Authorization & Access Control

The app uses **Casbin** for Role-Based Access Control (RBAC).
Configure roles and permissions in:

- `backend/casbin/model.conf`: The permission model logic.
- `backend/casbin/policy.csv`: Defined access rules for `admin`, `doctor`, and `patient`.

### Accessing the App

- **Frontend UI**: [http://localhost:5173](http://localhost:5173)
- **Backend Health Check**: [http://localhost:8080/ping](http://localhost:8080/ping)

### Authentication

Login is exclusive through **Google OAuth 2.0**.

To test the API directly using `curl`, you must include a valid Google ID Token:

```bash
curl -H "Authorization: Bearer <GOOGLE_ID_TOKEN>" http://localhost:8080/api/v1/patients
```
