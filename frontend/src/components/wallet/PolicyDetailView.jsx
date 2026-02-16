import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Building2, Calendar, CreditCard, Clock, IndianRupee, Trash2, ExternalLink, Edit2 } from 'lucide-react';
import { walletService } from '../../services/walletService';
import { useState, useEffect } from 'react';

export default function PolicyDetailView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [policy, setPolicy] = useState(null);

    useEffect(() => {
        const p = walletService.getPolicyById(id);
        if (p) {
            setPolicy(p);
        } else {
            navigate('/wallet');
        }
    }, [id, navigate]);

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to remove this policy from your wallet?')) {
            walletService.deletePolicy(id);
            navigate('/wallet');
        }
    };

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

    const getIcon = () => {
        return policyTypes.find(t => t.id === policy.type)?.icon || '🛡️';
    };

    if (!policy) return null;

    const DetailRow = ({ icon, label, value }) => (
        <div className="flex flex-col gap-1 p-5 md:p-6 rounded-3xl border"
            style={{
                backgroundColor: 'var(--bg-auth-surface)',
                borderColor: 'var(--border-auth-card)'
            }}>
            <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--text-auth-muted)' }}>
                {icon}
                <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-lg md:text-xl font-bold" style={{ color: 'var(--text-auth-primary)' }}>{value || '—'}</p>
        </div>
    );

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-10">
                <button
                    onClick={() => navigate('/wallet')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-lg">Back to Wallet</span>
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => navigate(`/wallet/policy/${id}/edit`)}
                        className="flex-1 sm:flex-none flex items-center gap-2 px-4 py-3 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 text-brand-accent hover:bg-brand-accent hover:text-white transition-all shadow-xl font-bold"
                    >
                        <Edit2 className="w-4 h-4" />
                        <span>Edit Policy</span>
                    </button>
                    <button
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-xl flex justify-center"
                        title="External Portal"
                    >
                        <ExternalLink className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-3 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border border-red-500/20 shadow-xl flex justify-center"
                        title="Delete Policy"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
                {/* Left Column - Main Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border relative overflow-hidden group shadow-2xl"
                        style={{
                            backgroundColor: 'var(--bg-auth-card)',
                            borderColor: 'var(--border-auth-card)'
                        }}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700" />

                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-3xl md:text-4xl mb-6 md:mb-8 relative z-10">
                            {getIcon()}
                        </div>

                        <div className="relative z-10">
                            <span className="inline-block px-3 py-1 rounded-full bg-brand-accent/10 text-brand-accent text-[10px] font-black uppercase tracking-widest mb-4 border border-brand-accent/20">
                                {policy.type} Insurance
                            </span>
                            <h1 className="text-2xl md:text-3xl font-black mb-2 leading-tight" style={{ color: 'var(--text-auth-primary)' }}>{policy.company}</h1>
                            <p className="font-medium mb-6 md:mb-8" style={{ color: 'var(--text-auth-muted)' }}>{policy.planName}</p>

                            <div className="pt-6 md:pt-8 border-t" style={{ borderColor: 'var(--border-auth-card)' }}>
                                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-auth-muted)' }}>Policy Number</p>
                                <code className="text-lg md:text-xl font-black text-brand-accent tracking-wider">{policy.policyNumber}</code>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 md:p-8 rounded-[2rem] border shadow-lg"
                        style={{
                            backgroundColor: 'rgba(99, 102, 241, 0.05)',
                            borderColor: 'var(--border-auth-card)'
                        }}>
                        <div className="flex items-center gap-3 text-indigo-400 mb-4">
                            <Shield className="w-6 h-6" />
                            <span className="font-black text-xs uppercase tracking-widest">Protection Status</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-auth-primary)' }}>
                            This policy provides cover for <span className="text-indigo-500 font-bold">₹{policy.sumInsured?.toLocaleString() || '0'}</span> and is active until <span className="text-indigo-500 font-bold">{policy.timeline}</span>.
                        </p>
                    </div>
                </div>

                {/* Right Column - Grid Details */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <DetailRow icon={<Building2 className="w-4 h-4" />} label="Insurer Provider" value={policy.company} />
                    <DetailRow icon={<CreditCard className="w-4 h-4" />} label="Product Name" value={policy.planName} />
                    <DetailRow icon={<IndianRupee className="w-4 h-4" />} label="Annual Premium" value={`₹${policy.premium?.toLocaleString()}`} />
                    <DetailRow icon={<Shield className="w-4 h-4" />} label="Sum Insured" value={`₹${policy.sumInsured?.toLocaleString()}`} />
                    <DetailRow icon={<Clock className="w-4 h-4" />} label="Policy Term" value={`${policy.term} Year(s)`} />
                    <DetailRow icon={<Calendar className="w-4 h-4" />} label="Next Renewal" value={policy.timeline} />

                    <div className="sm:col-span-2 mt-2 md:mt-4 p-6 md:p-8 rounded-[2rem] border shadow-md flex items-center gap-4 md:gap-6"
                        style={{
                            backgroundColor: 'var(--bg-auth-surface)',
                            borderColor: 'var(--border-auth-card)'
                        }}>
                        <div className="p-3 md:p-4 rounded-2xl bg-white/5 text-slate-500">
                            <Shield className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div>
                            <h4 className="font-black text-base md:text-lg mb-1" style={{ color: 'var(--text-auth-primary)' }}>Stay Protected</h4>
                            <p className="text-[10px] md:text-xs font-medium" style={{ color: 'var(--text-auth-muted)' }}>Remember to pay your premium before <span className="font-bold underline">{policy.timeline}</span> to avoid policy lapse.</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
