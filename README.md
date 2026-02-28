# 🏥 Med-Monitor | Enterprise Medical Facility Orchestrator

[![Go Version](https://img.shields.io/badge/Go-1.22+-00ADD8?style=for-the-badge&logo=go)](https://go.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Casbin](https://img.shields.io/badge/Casbin-RBAC-orange?style=for-the-badge)](https://casbin.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

A high-performance, enterprise-grade medical monitoring system designed to bridge the gap between patients and specialized clinical care. Featuring a state-of-the-art **Glassmorphism UI** and a robust **Go-engineered backend**, Med-Monitor handles the entire clinical lifecycle—from automated scheduling to digital prescription management.

---

## 🌐 Live Deployment

| Service | Public URL |
| :--- | :--- |
| **Frontend Nexus** | [https://med-monitor-frontend.app.genez.io](https://med-monitor-frontend.app.genez.io) |
| **Backend Engine** | [https://1c95d8e6-7e30-45b8-83ac-1083bb8e503b.eu-central-1.cloud.genez.io/ping](https://1c95d8e6-7e30-45b8-83ac-1083bb8e503b.eu-central-1.cloud.genez.io/ping) |

---

## 🌟 Key Features

### 👨‍⚕️ Specialist Dashboard

- **Clinical Encounter Management**: Real-time processing of patient visits with diagnostic logging.
- **Digital RX System**: Automated prescription issuance with dosage tracking and pharmacy-ready data.
- **Patient EMR Access**: Full medical history visualization including past consultations and active medications.

### 👤 Patient Experience

- **Smart Slot Booking**: Interactive calendar component for selecting specialist availability windows.
- **Personal Health Record**: Secure access to issued prescriptions and upcoming clinical appointments.
- **Identity Sync**: Zero-friction onboarding via Google OAuth 2.0.

### 🛡️ Administrative Control

- **RBAC Governance**: Granular permissions system powered by Casbin.
- **Operational Unit Management**: Dynamic medical department creation and specialist assignment.
- **Audit Ready**: Centralized user role management and clinical record oversight.

---

## 🏗️ Technical Architecture

### 🚄 Backend (Go Engine)

- **Gin Web Framework**: High-throughput RESTful API layer.
- **Modular Design**: Clean separation between **Handlers**, **Services**, and **Repositories**.
- **Data Integrity**: GORM-powered persistence with PostgreSQL, implementing strict `snake_case` JSON standardization.
- **Security**: Stateless JWT verification with Google ID Token validation.

### 💎 Frontend (React Nexus)

- **Vite Ecosystem**: Optimized build pipeline for sub-second hot reloading.
- **Glassmorphism UI**: Premium visual language built with pure CSS—no generic component libraries.
- **Smart Interceptors**: Sophisticated Axios middleware for seamless auth token injection and 401 recovery.
- **Dynamic Routing**: Role-restricted navigation paths for secure access control.

---

## 🚀 Deployment Guide

### 📦 Containerized Setup (Recommended)

Ensure Docker is installed, then run:

```bash
docker-compose up --build
```

### ⚙️ Environment Configuration

#### Backend (`backend/.env`)

```env
DATABASE_URL=postgres://user:pass@host:port/db
GOOGLE_CLIENT_ID=your-google-client-id
PORT=8080
```

#### Frontend (`frontend/.env`)

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_API_URL=http://localhost:8080
```

---

## 🔐 Security Framework (Casbin RBAC)

Access control is enforced at the middleware layer using a logic-based policy model (`backend/casbin/policy.csv`):

| Role | Permissions |
| :--- | :--- |
| **Admin** | Full system orchestration (`*`) |
| **Doctor** | Patient Records, Appointments (Process), Prescriptions (Issue) |
| **Patient** | Personal Profile, Appointment Booking, Prescription View |

---
