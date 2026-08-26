import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Components & Layout
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthRoute, AdminRoute } from './components/AuthRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { WaterAnalysisPage } from './pages/WaterAnalysisPage';
import { VisualizationPage } from './pages/VisualizationPage';
import { PredictionHistoryPage } from './pages/PredictionHistoryPage';
import { DetailedReportPage } from './pages/DetailedReportPage';
import { LiveMonitoringPage } from './pages/LiveMonitoringPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ApiDocsPage } from './pages/ApiDocsPage';
import { ChatAssistantPage } from './pages/ChatAssistantPage';

const PortalLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { token } = useAuth();
  const location = useLocation();

  // Pages that do NOT show the portal sidebar/navbar layout
  const isPublicPage = ['/', '/login', '/register'].includes(location.pathname);

  if (isPublicPage || !token) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-1 relative">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 lg:pl-72 pt-4 bg-slate-50/50 dark:bg-slate-900/10 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppContent = () => {
  return (
    <PortalLayout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Portal Routes */}
        <Route path="/dashboard" element={<AuthRoute><DashboardPage /></AuthRoute>} />
        <Route path="/analysis" element={<AuthRoute><WaterAnalysisPage /></AuthRoute>} />
        <Route path="/visualization" element={<AuthRoute><VisualizationPage /></AuthRoute>} />
        <Route path="/history" element={<AuthRoute><PredictionHistoryPage /></AuthRoute>} />
        <Route path="/report/:fileId" element={<AuthRoute><DetailedReportPage /></AuthRoute>} />
        <Route path="/monitoring" element={<AuthRoute><LiveMonitoringPage /></AuthRoute>} />
        <Route path="/chat" element={<AuthRoute><ChatAssistantPage /></AuthRoute>} />
        <Route path="/profile" element={<AuthRoute><ProfilePage /></AuthRoute>} />
        <Route path="/docs" element={<AuthRoute><ApiDocsPage /></AuthRoute>} />

        {/* Admin Only Routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
      </Routes>
    </PortalLayout>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
