import { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Wizard from './components/Wizard';
import FeatureSelector from './components/FeatureSelector';
import ReverseGapFlow from './components/ReverseGapFlow';
import Background from './components/Background';
import Login from './components/Login';
import ThemeToggle from './components/ThemeToggle';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Power, LayoutDashboard, Wallet as WalletIcon, Menu, X, LogOut, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load wallet components
const WalletDashboard = lazy(() => import('./components/wallet/WalletDashboard'));
const PolicyTypeSelector = lazy(() => import('./components/wallet/PolicyTypeSelector'));
const CompanySelector = lazy(() => import('./components/wallet/CompanySelector'));
const PolicyDetailsForm = lazy(() => import('./components/wallet/PolicyDetailsForm'));
const PolicyConfirmation = lazy(() => import('./components/wallet/PolicyConfirmation'));
const PolicyDetailView = lazy(() => import('./components/wallet/PolicyDetailView'));

function AppHeader() {
  const { isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    window.location.reload();
  };

  if (!isAuthenticated) return (
    <div className="fixed top-4 right-4 nav:top-8 nav:right-8 z-50">
      <ThemeToggle />
    </div>
  );

  const isHome = location.pathname === '/';

  return (
    <div className="fixed top-4 left-4 nav:left-auto nav:right-8 nav:top-8 z-50 flex items-center gap-3">
      {/* Desktop Navigation */}
      <div className="hidden nav:flex items-center gap-3">
        <ThemeToggle />
        {!isHome && (
          <button
            onClick={() => navigate('/')}
            className="p-3 rounded-full border bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-xl backdrop-blur-md"
            title="Go to Dashboard"
          >
            <LayoutDashboard className="w-6 h-6" />
          </button>
        )}
        <button
          onClick={handleLogout}
          className="p-3 rounded-full border bg-white/5 border-white/10 text-slate-400 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/50 transition-all shadow-xl backdrop-blur-md"
          title="Logout"
        >
          <Power className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className="nav:hidden flex items-center">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-2 rounded-full border transition-all duration-300 shadow-xl backdrop-blur-md z-50 ${isMenuOpen
            ? 'bg-brand-accent border-brand-accent text-white'
            : 'bg-white/5 border-white/10 text-slate-400'
            }`}
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 nav:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-screen w-64 bg-slate-900 border-r border-white/10 p-8 pt-24 z-40 nav:hidden flex flex-col gap-6 shadow-2xl"
            >
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Navigation</p>
                <button
                  onClick={() => { navigate('/'); setIsMenuOpen(false); }}
                  className={`flex items-center gap-3 p-4 rounded-2xl transition-all border ${isHome
                    ? 'bg-brand-accent/20 border-brand-accent/30 text-brand-accent'
                    : 'bg-white/5 border-white/10 text-slate-300'
                    }`}
                >
                  <Home className="w-5 h-5" />
                  <span className="font-bold">Dashboard</span>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Settings</p>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-sm font-bold text-slate-300">Appearance</span>
                  <ThemeToggle />
                </div>
              </div>

              <div className="mt-auto">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase tracking-widest text-xs hover:bg-red-500/20 transition-all font-bold"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function MainApp() {
  const { isAuthenticated, loading } = useAuth();
  const [selectedFeature, setSelectedFeature] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 relative overflow-x-hidden">
      <Background />
      <AppHeader />

      <div className="text-center mb-8 md:mb-12 z-10 w-full px-2 mt-14 md:mt-2">
        <h1 className="text-3xl md:text-6xl font-black mb-2 md:mb-4 tracking-tight" style={{ color: 'var(--text-auth-primary)' }}>
          Insurance <span className="text-brand-accent">Simplified</span>
        </h1>
        <p className="text-xs md:text-lg font-medium opacity-80" style={{ color: 'var(--text-auth-muted)' }}>No jargon. Just answers. (MVP v0.3)</p>
      </div>

      <div className="z-10 w-full max-w-7xl flex-1 flex flex-col items-center">
        <Routes>
          {!isAuthenticated ? (
            <Route path="*" element={<Login />} />
          ) : (
            <>
              <Route path="/" element={
                <div className="w-full flex justify-center">
                  {!selectedFeature ? (
                    <FeatureSelector onSelectFeature={setSelectedFeature} />
                  ) : selectedFeature === 'wizard' ? (
                    <Wizard onBack={() => setSelectedFeature(null)} />
                  ) : (
                    <ReverseGapFlow onBack={() => setSelectedFeature(null)} />
                  )
                  }
                </div>
              } />

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
