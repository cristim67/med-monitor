import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Appointments from './pages/Appointments.tsx';
import Patients from './pages/Patients.tsx';
import Prescriptions from './pages/Prescriptions.tsx';
import AdminUsers from './pages/AdminUsers.tsx';
import Layout from './components/Layout.tsx';

import { ThemeProvider } from './context/ThemeContext';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
            <Route index element={<Dashboard />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="patients" element={<Patients />} />
            <Route path="prescriptions" element={<Prescriptions />} />
            <Route path="admin/users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
