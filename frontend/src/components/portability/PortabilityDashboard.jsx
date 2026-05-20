import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileText, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function PortabilityDashboard() {
    const { user } = useAuth();
    const token = user?.token;
    const [loading, setLoading] = useState(true);
    const [disclaimerAccepted, setDisclaimerAccepted] = useState(true); // default true to prevent flash
    const [showModal, setShowModal] = useState(false);
    const [accepting, setAccepting] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/portability/status`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setDisclaimerAccepted(data.disclaimer_accepted);
                    if (!data.disclaimer_accepted) {
                        setShowModal(true);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch portability status", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchStatus();
        } else {
            setLoading(false);
        }
    }, [token]);

    const handleAccept = async () => {
        setAccepting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/portability/accept-disclaimer`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                setDisclaimerAccepted(true);
                setShowModal(false);
            }
        } catch (err) {
            console.error("Failed to accept disclaimer", err);
        } finally {
            setAccepting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-accent"></div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-8 relative">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--text-auth-primary)' }}>Portability Dashboard</h1>
                    <p className="opacity-80" style={{ color: 'var(--text-auth-muted)' }}>Manage your insurance portability requests</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Placeholder content for the dashboard */}
                <div className="p-6 rounded-3xl border flex flex-col items-center justify-center text-center col-span-1 md:col-span-3 min-h-[300px]" style={{ backgroundColor: 'var(--bg-auth-card)', borderColor: 'var(--border-auth-card)' }}>
                    <Shield className="w-16 h-16 text-blue-500 mb-4 opacity-50" />
                    <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-auth-primary)' }}>Ready to Port?</h2>
                    <p className="max-w-md opacity-80 mb-6" style={{ color: 'var(--text-auth-muted)' }}>
                        Start your journey to better coverage. Upload your existing policy details and our AI will guide you through the seamless transition process.
                    </p>
                    <button className="px-6 py-3 rounded-xl bg-brand-accent text-white font-bold flex items-center gap-2 hover:scale-105 transition-all">
                        Start Portability Request
                    </button>
                </div>
            </div>

            {/* Disclaimer Modal */}
            <AnimatePresence>
                {showModal && !disclaimerAccepted && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg p-8 rounded-3xl border shadow-2xl flex flex-col"
                            style={{ backgroundColor: 'var(--bg-auth-card)', borderColor: 'var(--border-auth-card)' }}
                        >
                            <div className="flex items-start mb-6">
                                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500 mr-4 flex-shrink-0">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black mb-1" style={{ color: 'var(--text-auth-primary)' }}>Terms & Disclaimer</h3>
                                    <p className="text-sm opacity-80 leading-relaxed" style={{ color: 'var(--text-auth-muted)' }}>
                                        Before initiating a portability request, please acknowledge that you have read and understood our process and terms.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="bg-black/10 rounded-xl p-4 mb-6 border border-white/5 max-h-32 overflow-y-auto text-sm opacity-80" style={{ color: 'var(--text-auth-primary)' }}>
                                <p className="mb-2">Your data will be used strictly for evaluating and processing your portability request in accordance with IRDAI guidelines.</p>
                                <p>Approval of portability is subject to the underwriting rules of the new insurance provider.</p>
                            </div>

                            <Link to="/portability/disclaimer" target="_blank" className="text-brand-accent text-sm font-bold hover:underline mb-8 flex items-center gap-1 self-start">
                                Read Full Disclaimer Document
                            </Link>

                            <button 
                                onClick={handleAccept}
                                disabled={accepting}
                                className="w-full py-4 rounded-xl bg-brand-accent text-white font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-50"
                            >
                                {accepting ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        I Accept and Agree
                                    </>
                                )}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
