# 💎 Med-Monitor Frontend | Glassmorphism Clinical Interface

The frontend of Med-Monitor is a state-of-the-art Single Page Application (SPA) designed for high-density clinical data visualization and seamless user orchestration. Built with **React 19** and **TypeScript**, it features a premium, custom-engineered **Glassmorphism UI** system.

---

## 🎨 Visual Identity

- **Glassmorphism System**: Custom CSS engine implementing translucent surfaces, vibrant mesh gradients, and strategic blurs.
- **Dynamic Theming**: Seamless transition between sophisticated Dark Mode and high-contrast Light Mode.
- **Responsive Nexus**: Fluid layouts optimized for both specialist desktops and portable clinical tablets.
- **Lucide Iconography**: High-clarity vector icons for intuitive navigation.

---

## 🛠️ Technology Stack

- **Core**: [React 19](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
- **Build Engine**: [Vite 7](https://vitejs.dev/) (Sub-second HMR)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **State & Data**: [Axios](https://axios-http.com/) with sophisticated Context-based interceptors.
- **Identity**: [Google OAuth 2.0](https://developers.google.com/identity/gsi/web) for secure enterprise login.
- **Styling**: Pure **Vanilla CSS** with CSS Variables (Custom Design System).

---

## 🏗️ Architecture

The codebase is organized by functional domains:

- **`/src/api`**: Centralized Axios instance with automatic JWT injection and 401 handling.
- **`/src/components`**: Reusable design system components (Layout, Loaders, Modals).
- **`/src/context`**: Global providers for Authentication and Theme synchronization.
- **`/src/pages`**: Domain-specific views:
  - `Dashboard`: Personalized clinical/overview timeline.
  - `Appointments`: Smart scheduler with role-based logic.
  - `Patients`: Electronic Medical Record (EMR) management.
  - `Prescriptions`: Digital pharmacy directive tracking.
  - `AdminUsers`: RBAC governance console.

---

## 🚀 Getting Started

### 1. Requirements

- Node.js 20+
- npm 10+

### 2. Configuration

Create a `.env` file in the root of this directory:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_API_URL=http://localhost:8080
```

### 3. Installation

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

---

## 🔐 Authentication Flow

1. **Google Login**: User authenticates with Google.
2. **JWT Capture**: Token is verified by the backend.
3. **Role Sync**: The UI dynamically updates its state and navigation paths based on the role assigned in the backend Database (synced via `/api/v1/profile`).

---
© 2026 Med-Monitor Systems
