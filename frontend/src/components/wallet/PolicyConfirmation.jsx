import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Shield, Calendar, CreditCard, Building2, IndianRupee } from 'lucide-react';
import { walletService } from '../../services/walletService';
import { useEffect, useState } from 'react';

export default function PolicyConfirmation() {
    const { type, company } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);

    useEffect(() => {
        const pending = sessionStorage.getItem('pending_policy');
        if (pending) {
            setData(JSON.parse(pending));
        } else {
            navigate('/wallet/add-policy');
        }
    }, [navigate]);

    const handleConfirm = () => {
        if (data) {
            if (data.id) {
                walletService.updatePolicy(data.id, data);
            } else {
                walletService.addPolicy(data);
            }
            sessionStorage.removeItem('pending_policy');
            navigate('/wallet');
        }
    };

    if (!data) return null;

    const isEdit = !!data.id;

    const detailItem = (icon, label, value) => (
        <div className="flex items-center justify-between p-4 md:p-5 rounded-2xl border"
            style={{
                backgroundColor: 'var(--bg-auth-surface)',
                borderColor: 'var(--border-auth-card)'
            }}>
            <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2 rounded-xl bg-white/5 text-slate-500">
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-auth-muted)' }}>{label}</p>
                    <p className="font-black text-sm md:text-base" style={{ color: 'var(--text-auth-primary)' }}>{value || 'Not Specified'}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-2xl mx-auto px-4 py-8">
            <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate(`/wallet/add-policy/${type}/${company}/details`)}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold">Edit Details</span>
            </motion.button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8 md:mb-10"
            >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 md:w-10 h-8 md:h-10 text-emerald-500" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black mb-2" style={{ color: 'var(--text-auth-primary)' }}>{isEdit ? 'Review & Update' : 'Review & Confirm'}</h2>
                <p className="text-sm md:text-base font-medium" style={{ color: 'var(--text-auth-muted)' }}>{isEdit ? 'Confirm your changes before updating the policy' : 'Double check before we add this to your wallet'}</p>
            </motion.div>

            <div className="space-y-3 mb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {detailItem(<Shield className="w-4 h-4" />, "Policy Type", data.type)}
                    {detailItem(<Building2 className="w-4 h-4" />, "Insurer", data.company)}
                </div>
                {detailItem(<CreditCard className="w-5 h-5" />, "Policy Number", data.policyNumber)}
                {detailItem(<CreditCard className="w-5 h-5" />, "Plan Name", data.planName)}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {detailItem(<IndianRupee className="w-4 h-4" />, "Sum Insured", `₹${data.sumInsured?.toLocaleString()}`)}
                    {detailItem(<IndianRupee className="w-4 h-4" />, "Annual Premium", `₹${data.premium?.toLocaleString()}`)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {detailItem(<Calendar className="w-4 h-4" />, "Policy Term", `${data.term} Year(s)`)}
                    {detailItem(<Calendar className="w-4 h-4" />, "Renewal Date", data.timeline)}
                </div>
            </div>

            <button
                onClick={handleConfirm}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white p-5 md:p-6 rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 group"
            >
                <CheckCircle2 className="w-6 h-6" />
                <span className="text-lg">{isEdit ? 'Confirm & Update Policy' : 'Confirm & Add Policy'}</span>
            </button>

            <p className="text-center text-xs mt-6 font-bold uppercase tracking-tight" style={{ color: 'var(--text-auth-placeholder)' }}>Your data is stored locally and securely</p>
        </div>
    );
}
