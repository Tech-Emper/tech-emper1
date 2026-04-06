import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, LogOut, LayoutDashboard, User, ShieldCheck, Building, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar({ onHome }) {
    const { isAuthenticated, logout, user } = useAuth();
    const { theme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const navLinks = [
        { name: 'For Employees', path: '#' },
        { name: 'For HR Leaders', path: '#' },
        { name: 'Communities', path: '#' },
        { name: 'Why Emper.ai', path: '#' },
    ];

    const isHome = location.pathname === '/';

    const handleHomeClick = () => {
        if (onHome) onHome();
        navigate('/');
        setIsMenuOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMenuOpen(false);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--nav-bg)] backdrop-blur-md border-b border-slate-200 dark:border-white/10 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 md:px-8 h-12 md:h-16 flex items-center justify-between">
                {/* Logo */}
                <button
                    onClick={handleHomeClick}
                    className="flex items-center gap-2 group bg-transparent border-none p-0"
                >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-110 transition-transform">
                        e
                    </div>
                    <span
                        className="text-xl font-black tracking-tight"
                        style={{ color: theme === 'light' ? '#141d2e' : '#ffffff' }}
                    >
                        emper<span className="text-emerald-500">.ai</span>
                    </span>
                </button>

                {/* Desktop Nav Links */}
                {/* <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.path}
                            className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                        >
                            {link.name}
                        </a>
                    ))}
                </div> */}

                {/* Right Actions */}
                <div className="hidden md:flex items-center gap-4 text-sm font-bold">
                    {/* <a href="#" className="text-slate-500 hover:text-emerald-500 transition-colors">
                        Contact
                    </a> */}

                    {/* <ThemeToggle /> */}

                    {isAuthenticated ? (
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-white/10">
                            <button
                                onClick={handleHomeClick}
                                className={`p-2 rounded-xl border transition-all ${isHome
                                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10'
                                    }`}
                                title="Home"
                            >
                                <Home className="w-5 h-5" />
                            </button>
                            {user?.role === 'superadmin' && (
                                <button
                                    onClick={() => navigate('/superadmin')}
                                    className={`p-2 rounded-xl border transition-all ${location.pathname === '/superadmin'
                                        ? 'bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/20'
                                        : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 hover:text-purple-500 hover:bg-purple-500/10'
                                        }`}
                                    title="Super Admin"
                                >
                                    <Building className="w-5 h-5" />
                                </button>
                            )}
                            <button
                                onClick={() => navigate('/profile')}
                                className={`p-2 rounded-xl border transition-all ${location.pathname === '/profile'
                                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10'
                                    }`}
                                title="Profile"
                            >
                                <User className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => navigate('/wallet')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${location.pathname.startsWith('/wallet')
                                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                                    }`}
                            >
                                <ShieldCheck className="w-4 h-4" />
                                <span>Wallet</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="px-6 py-2 rounded-xl border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all font-black text-xs uppercase tracking-widest text-center"
                        >
                            Login
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex md:hidden items-center gap-3">
                    {/* <ThemeToggle /> */}
                    {isAuthenticated && (
                        <button
                            onClick={handleHomeClick}
                            className={`p-2 rounded-lg border transition-all ${isHome
                                ? 'bg-emerald-500 text-white border-emerald-500'
                                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 hover:text-emerald-500'
                                }`}
                            title="Home"
                        >
                            <Home className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`p-2 rounded-lg border transition-all ${isMenuOpen
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-500'
                            }`}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
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
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[51] md:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className={`fixed top-0 right-0 h-screen w-72 border-l border-slate-200 dark:border-white/10 p-6 z-[52] md:hidden flex flex-col gap-6 shadow-2xl overflow-y-auto ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-800'
                                }`}
                        >
                            {/* Mobile Menu Header */}
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Menu</p>
                                <div className="flex items-center gap-3">
                                    {/* <ThemeToggle /> */}
                                    {isAuthenticated && (
                                        <button
                                            onClick={handleHomeClick}
                                            className="p-2 rounded-xl bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-all"
                                            title="Home"
                                        >
                                            <Home className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsMenuOpen(false)}
                                        className="p-2 rounded-xl bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-all"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 border-t border-slate-300 dark:border-white/10">
                                {isAuthenticated ? (
                                    <>
                                        {user?.role === 'superadmin' && (
                                            <button
                                                onClick={() => { navigate('/superadmin'); setIsMenuOpen(false); }}
                                                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${location.pathname === '/superadmin'
                                                    ? 'bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/20'
                                                    : 'bg-white/5 border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 font-bold hover:bg-white/10'
                                                    }`}
                                            >
                                                <Building className="w-5 h-5" />
                                                <span>Super Admin</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}
                                            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${location.pathname === '/profile'
                                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                                                : 'bg-white/5 border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 font-bold hover:bg-white/10'
                                                }`}
                                        >
                                            <User className="w-5 h-5" />
                                            <span>My Profile</span>
                                        </button>
                                        <button
                                            onClick={() => { navigate('/wallet'); setIsMenuOpen(false); }}
                                            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${location.pathname.startsWith('/wallet')
                                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                                                : 'bg-white/5 border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 font-bold hover:bg-white/10'
                                                }`}
                                        >
                                            <ShieldCheck className="w-5 h-5" />
                                            <span>Insurance Wallet</span>
                                        </button>
                                        <button
                                            onClick={handleHomeClick}
                                            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${isHome
                                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                                                : 'bg-white/5 border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 font-bold hover:bg-white/10'
                                                }`}
                                        >
                                            <LayoutDashboard className="w-5 h-5" />
                                            <span>Analytics Dashboard</span>
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold mt-4"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            <span>Sign Out</span>
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        to="/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="w-full flex items-center justify-center p-4 rounded-2xl bg-emerald-500 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/20"
                                    >
                                        Sign In
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
}
