import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

import Sidebar from './components/Layout/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Batches from './pages/Batches';
import BatchDetail from './pages/BatchDetail';
import Alerts from './pages/Alerts';
import AuditLog from './pages/AuditLog';

const queryClient = new QueryClient();

const ProtectedLayout = () => {
    const { user, loading } = useAuth();
    
    if (loading) return (
        <div className="h-screen bg-navy-900 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
                <p className="text-teal-500 font-black tracking-widest text-[10px] uppercase animate-pulse">Initializing Nodes...</p>
            </div>
        </div>
    );
    
    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--background)]">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <Outlet />
            </div>
        </div>
    );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
        <Toaster position="top-right" />
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
                        </Route>
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </SocketProvider>
        </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
