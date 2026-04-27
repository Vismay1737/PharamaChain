import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeProvider } from './contexts/ThemeContext';

import Sidebar from './components/Layout/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Batches from './pages/Batches';
import BatchDetail from './pages/BatchDetail';
import Alerts from './pages/Alerts';
import AuditLog from './pages/AuditLog';
import AiChat from './pages/AiChat';
import VerifyDrug from './pages/VerifyDrug';

const queryClient = new QueryClient();

const ProtectedLayout = () => {
    const { user, loading } = useAuth();
    
    if (loading) return (
        <div className="h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
            <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-3 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}></div>
                <p className="font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--accent)' }}>Loading...</p>
            </div>
        </div>
    );
    
    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <Outlet />
            </div>
        </div>
    );
};

const App = () => {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
          <Toaster position="top-right" toastOptions={{ style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '12px' } }} />
          <AuthProvider>
              <SocketProvider>
                  <Router>
                      <Routes>
                          <Route path="/login" element={<Login />} />
                          <Route element={<ProtectedLayout />}>
                              <Route path="/" element={<Dashboard />} />
                              <Route path="/batches" element={<Batches />} />
                              <Route path="/batches/:id" element={<BatchDetail />} />
                              <Route path="/alerts" element={<Alerts />} />
                              <Route path="/audit" element={<AuditLog />} />
                              <Route path="/chat" element={<AiChat />} />
                              <Route path="/verify" element={<VerifyDrug />} />
                          </Route>
                          <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                  </Router>
              </SocketProvider>
          </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
