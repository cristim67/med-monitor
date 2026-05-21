import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import type { ReactNode } from "react";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Appointments from "./pages/Appointments.tsx";
import Patients from "./pages/Patients.tsx";
import Prescriptions from "./pages/Prescriptions.tsx";
import AdminUsers from "./pages/AdminUsers.tsx";
import Layout from "./components/Layout.tsx";

import { ThemeProvider } from "./context/ThemeContext";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = !!localStorage.getItem("token");
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="patients" element={<Patients />} />
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="admin/users" element={<AdminUsers />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}

export default App;
