import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Shield, ChevronRight, Heart, HeartPulse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { walletService } from '../../services/walletService';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_BASE_URL = rawBaseUrl.startsWith('http') ? rawBaseUrl : `https://${rawBaseUrl}`;

export default function WalletDashboard() {
    const [policies, setPolicies] = useState([]);
    const [recommendation, setRecommendation] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                setPolicies(walletService.getPolicies());

                if (token) {
                    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await response.json();
                    if (data.recommendations && data.recommendations.length > 0) {
                        setRecommendation(data.recommendations[0]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch wallet data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const policyTypes = [
        { id: 'health', label: 'Health', icon: '🏥' },
        { id: 'group', label: 'Group cover', icon: '🏢' },
        { id: 'life', label: 'Life', icon: '🧬' },
        { id: 'parental', label: 'Parental', icon: '👴' },
        { id: 'topup', label: 'Top up', icon: '🆙' },
        { id: 'car', label: 'Car', icon: '🚗' },
        { id: 'bike', label: 'Bike', icon: '🏍️' },
        { id: 'travel', label: 'Travel', icon: '✈️' }
    ];

    const parseToLakhs = (str) => {
        if (!str || str === "None" || str === "") return 0;

        // Handle numerical values directly
        if (typeof str === 'number') {
            return str > 10000 ? str / 100000 : str;
        }

        const cleanStr = String(str).replace(/[₹,]/g, '').trim();
        const parts = cleanStr.split(' ');
        const num = parseFloat(parts[0]);

        if (isNaN(num)) return 0;

        const lowerStr = cleanStr.toLowerCase();
        if (lowerStr.includes('crore')) return num * 100;
        if (lowerStr.includes('lakh')) return num;

        // If it's a raw number string like "5000000" without units
        if (num > 10000) return num / 100000;

        return num;
    };

    const formatLakhs = (lakhs) => {
        if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(1)} Crore`;
        return `₹${Math.round(lakhs)} Lakhs`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-accent mb-4"></div>
                <p style={{ color: 'var(--text-auth-muted)' }}>Loading Wallet...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
            >
                <div>
                    <h2 className="text-2xl md:text-3xl font-black" style={{ color: 'var(--text-auth-primary)' }}>My Wallet</h2>
                    <p style={{ color: 'var(--text-auth-muted)' }} className="text-sm md:text-base">Manage all your insurance policies in one place.</p>
                </div>
                {policies.length > 0 && (
                    <button
                        onClick={() => navigate('/wallet/add-policy')}
                        className="flex items-center gap-2 bg-brand-accent hover:bg-brand-accent/90 text-white px-4 py-2 rounded-xl font-bold transition-all w-full sm:w-auto justify-center"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add New</span>
                    </button>
                )}
            </motion.div>

            {policies.length === 0 ? (
                <div className="space-y-12">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] border border-dashed backdrop-blur-md"
                        style={{
                            backgroundColor: 'var(--bg-auth-surface)',
                            borderColor: 'var(--border-auth-card)'
                        }}
                    >
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Shield className="w-8 h-8 md:w-10 md:h-10 text-brand-accent" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black mb-2" style={{ color: 'var(--text-auth-primary)' }}>No Policies Added Yet</h3>
                        <p className="mb-8 max-w-sm mx-auto text-sm md:text-base" style={{ color: 'var(--text-auth-muted)' }}>Start building your digital insurance wallet to track all your covers effortlessly.</p>
                        <button
                            onClick={() => navigate('/wallet/add-policy')}
                            className="bg-brand-accent hover:bg-brand-accent/90 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-brand-accent/20 w-full sm:w-auto"
                        >
                            Add Your First Policy
                        </button>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {policyTypes.map((type) => (
                            <motion.button
                                key={type.id}
                                whileHover={{ y: -5, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate(`/wallet/add-policy/${type.id}`)}
                                className="p-4 md:p-6 rounded-2xl md:rounded-3xl border transition-all text-center group"
                                style={{
                                    backgroundColor: 'var(--bg-auth-input)',
                                    borderColor: 'var(--border-auth-card)'
                                }}
                            >
                                <div className="text-3xl md:text-4xl mb-3 group-hover:scale-110 transition-transform">{type.icon}</div>
                                <span className="text-xs md:text-sm font-bold transition-colors" style={{ color: 'var(--text-auth-muted)' }}>{type.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {policies.map((policy, idx) => {
                        const isLife = policy.type?.toLowerCase() === 'life';
                        const isHealth = policy.type?.toLowerCase() === 'health';

                        let idealCover = 0;
                        let idealLabel = "AI Ideal";

                        if (isLife && recommendation) {
                            idealCover = parseToLakhs(recommendation.life_cover);
                            idealLabel = "AI Ideal Life";
                        } else if (isHealth && recommendation) {
                            idealCover = parseToLakhs(recommendation.health_cover);
                            idealLabel = "AI Ideal Health";
                        }

                        const currentCover = parseToLakhs(policy.sumInsured);
                        const gap = Math.max(0, idealCover - currentCover);
                        const displayIdeal = isLife ? recommendation?.life_cover : recommendation?.health_cover;

                        return (
                            <motion.div
                                key={policy.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => navigate(`/wallet/policy/${policy.id}`)}
                                className="group cursor-pointer border rounded-3xl p-6 relative overflow-hidden transition-all hover:shadow-xl"
                                style={{
                                    backgroundColor: 'var(--bg-auth-card)',
                                    borderColor: 'var(--border-auth-card)'
                                }}
                            >
                                <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                                    <div className="flex gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-2xl min-w-[3.5rem]">
                                            {policyTypes.find(t => t.id === policy.type)?.icon || '📄'}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1 overflow-hidden">
                                                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-brand-accent px-2 py-0.5 rounded-full bg-brand-accent/10 whitespace-nowrap">
                                                    {policy.type}
                                                </span>
                                                <span className="font-bold text-[10px] md:text-xs opacity-50 truncate" style={{ color: 'var(--text-auth-muted)' }}>#{policy.policyNumber}</span>
                                            </div>
                                            <h4 className="text-xl font-black truncate" style={{ color: 'var(--text-auth-primary)' }}>{policy.company}</h4>
                                            <p className="text-sm truncate opacity-80" style={{ color: 'var(--text-auth-muted)' }}>{policy.planName}</p>
                                        </div>
                                    </div>

                                    {(isLife || isHealth) && recommendation && (
                                        <div className="text-right flex flex-col justify-center">
                                            <span className={`text-2xl font-black ${gap > 0 ? (isLife ? 'text-orange-500' : 'text-blue-500') : 'text-emerald-500'}`}>
                                                {gap > 0 ? `+${formatLakhs(gap)}` : 'Fully Protected'}
                                            </span>
                                            <div className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-auth-placeholder)' }}>Gap Amount</div>
                                        </div>
                                    )}
                                </div>

                                {(isLife || isHealth) && recommendation ? (
                                    <div className="space-y-3">
                                        <div className="h-3 rounded-full overflow-hidden flex border" style={{
                                            backgroundColor: 'var(--bg-auth-input)',
                                            borderColor: 'var(--border-auth-card)'
                                        }}>
                                            <div
                                                className={`h-full ${isLife ? 'bg-orange-500' : 'bg-blue-500'} border-r border-black/10 transition-all duration-1000`}
                                                style={{ width: `${Math.min(100, (currentCover / Math.max(1, idealCover)) * 100)}%` }}
                                            />
                                            {gap > 0 && (
                                                <div
                                                    className={`h-full ${isLife ? 'bg-orange-500/20' : 'bg-blue-500/20'} animate-pulse transition-all duration-1000`}
                                                    style={{ width: `${Math.min(100, (gap / idealCover) * 100)}%` }}
                                                />
                                            )}
                                        </div>
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                            <span style={{ color: 'var(--text-auth-muted)' }}>Current: {policy.sumInsured}</span>
                                            <span style={{ color: 'var(--text-auth-primary)' }}>{idealLabel}: {displayIdeal}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between mt-4 md:mt-0">
                                        <div className="text-left">
                                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-auth-muted)' }}>Cover Amount</p>
                                            <p className="text-lg font-black" style={{ color: 'var(--text-auth-primary)' }}>{policy.sumInsured}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-auth-muted)' }}>Premium</p>
                                            <p className="text-lg font-black" style={{ color: 'var(--text-auth-primary)' }}>₹{policy.premium?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="absolute top-1/2 right-4 -translate-y-1/2 p-2 rounded-full bg-white/5 group-hover:bg-brand-accent group-hover:text-white transition-all transform group-hover:translate-x-1 opacity-0 group-hover:opacity-100 hidden md:flex" style={{ color: 'var(--text-auth-muted)' }}>
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </motion.div>
                        );
                    })}

                    <button
                        onClick={() => navigate('/wallet/add-policy')}
                        className="w-full p-8 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center gap-2 group"
                        style={{
                            borderColor: 'var(--border-auth-card)',
                            backgroundColor: 'transparent'
                        }}
                    >
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-accent group-hover:text-white transition-all" style={{ color: 'var(--text-auth-muted)' }}>
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-base group-hover:text-brand-accent transition-colors" style={{ color: 'var(--text-auth-muted)' }}>Add Another Policy</span>
                    </button>
                </div>
            )}
        </div>
    );
}
