import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ToastContainer from './components/ToastContainer';
import { verificationRequestsInitial } from './data/mockData';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import VerificationsPage from './pages/VerificationsPage';
import EmployeesPage from './pages/EmployeesPage';
import InternsPage from './pages/InternsPage';
import HistoryPage from './pages/HistoryPage';
import CompanyProfilePage from './pages/CompanyProfilePage';

// ── Protected shell with shared requests state ────────────────────────────────
function ProtectedShell() {
  const { isAuthenticated, logout } = useApp();
  const [requests, setRequests] = useState(verificationRequestsInitial);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="shell">
      <Sidebar pendingCount={pendingCount} />
      <div className="shell-main">
        <Routes>
          <Route path="/dashboard" element={<DashboardPage requests={requests} />} />
          <Route path="/verifications" element={<VerificationsPage requests={requests} onUpdate={setRequests} />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/interns" element={<InternsPage />} />
          <Route path="/history" element={<HistoryPage requests={requests} />} />
          <Route path="/company" element={<CompanyProfilePage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useApp();
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/*" element={<ProtectedShell />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer />
      </BrowserRouter>
    </AppProvider>
  );
}
