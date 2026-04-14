import { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Wizard from './components/Wizard';
import LandingPage from './components/LandingPage';
import DashboardWrapped from './components/DashboardWrapped';
import Background from './components/Background';
import Login from './components/Login';
import ThemeToggle from './components/ThemeToggle';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Power, LayoutDashboard, Wallet as WalletIcon, Menu, X, LogOut, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/common/Navbar';
import Profile from './components/Profile';
import SuperAdmin from './components/SuperAdmin';
import AIAgentsDashboard from './components/ai_agents/AIAgentsDashboard';

// Lazy load wallet components
const WalletDashboard = lazy(() => import('./components/wallet/WalletDashboard'));
const PolicyTypeSelector = lazy(() => import('./components/wallet/PolicyTypeSelector'));
const CompanySelector = lazy(() => import('./components/wallet/CompanySelector'));
const PolicyDetailsForm = lazy(() => import('./components/wallet/PolicyDetailsForm'));
const PolicyConfirmation = lazy(() => import('./components/wallet/PolicyConfirmation'));
const PolicyDetailView = lazy(() => import('./components/wallet/PolicyDetailView'));


function MainApp() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center pt-16 md:pt-24 p-4 md:p-8 relative overflow-x-hidden">
      <Background />
      <Navbar onHome={() => window.location.href = '/'} />

      {/* <div className="text-center mb-8 md:mb-12 z-10 w-full px-2">
        <h1 className="text-3xl md:text-6xl font-black mb-2 md:mb-4 tracking-tight" style={{ color: 'var(--text-auth-primary)' }}>
          Insurance <span className="text-brand-accent">Simplified</span>
        </h1>
        <p className="text-xs md:text-lg font-medium opacity-80" style={{ color: 'var(--text-auth-muted)' }}>No jargon. Just answers. (MVP v0.3)</p>
      </div> */}

      <div className="z-10 w-full max-w-7xl flex-1 flex flex-col items-center">
        <Routes>
          {/* Public / Semi-Public Routes */}
          <Route path="/" element={!isAuthenticated ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
          <Route path="/details" element={
            <div className="w-full flex justify-center">
              <Wizard onBack={() => window.location.href = '/'} />
            </div>
          } />

          {/* Protected Routes */}
          {isAuthenticated && (
            <>
              <Route path="/dashboard" element={
                (user && user.current_step < 9) ? <Navigate to="/details" replace /> : <DashboardWrapped />
              } />

              <Route path="/profile" element={<Profile />} />
              <Route path="/superadmin" element={<SuperAdmin />} />
              <Route path="/ai-suggestions" element={<AIAgentsDashboard />} />

              <Route path="/wallet" element={
                <Suspense fallback={<div className="text-white">Loading Wallet...</div>}>
                  <WalletDashboard />
                </Suspense>
              } />
              <Route path="/wallet/add-policy" element={
                <Suspense fallback={<div>Loading...</div>}>
                  <PolicyTypeSelector />
                </Suspense>
              } />
              <Route path="/wallet/add-policy/:type" element={
                <Suspense fallback={<div>Loading...</div>}>
                  <CompanySelector />
                </Suspense>
              } />
              <Route path="/wallet/add-policy/:type/:company/details" element={
                <Suspense fallback={<div>Loading...</div>}>
                  <PolicyDetailsForm />
                </Suspense>
              } />
              <Route path="/wallet/add-policy/:type/:company/confirm" element={
                <Suspense fallback={<div>Loading...</div>}>
                  <PolicyConfirmation />
                </Suspense>
              } />
              <Route path="/wallet/policy/:id" element={
                <Suspense fallback={<div>Loading...</div>}>
                  <PolicyDetailView />
                </Suspense>
              } />
              <Route path="/wallet/policy/:id/edit" element={
                <Suspense fallback={<div>Loading...</div>}>
                  <PolicyDetailsForm />
                </Suspense>
              } />
              {/* Redirect any other wallet routes to main wallet page */}
              <Route path="/wallet/*" element={<Navigate to="/wallet" replace />} />
            </>
          )}

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
