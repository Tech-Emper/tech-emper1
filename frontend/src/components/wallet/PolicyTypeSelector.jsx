import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PolicyTypeSelector() {
    const navigate = useNavigate();
    const types = [
        { id: 'health', label: 'Health', icon: '🏥', desc: 'Medical & hospitalization cover' },
        { id: 'group', label: 'Group cover', icon: '🏢', desc: 'Employee benefits from office' },
        { id: 'life', label: 'Life', icon: '🧬', desc: 'Term life or savings plans' },
        { id: 'parental', label: 'Parental', icon: '👴', desc: 'Special cover for elders' },
        { id: 'topup', label: 'Top up', icon: '🆙', desc: 'Extra layer over basic health' },
        { id: 'car', label: 'Car', icon: '🚗', desc: 'Four wheeler insurance' },
        { id: 'bike', label: 'Bike', icon: '🏍️', desc: 'Two wheeler insurance' },
        { id: 'travel', label: 'Travel', icon: '✈️', desc: 'Domestic & overseas trips' }
    ];

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate('/wallet')}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold">Back to Wallet</span>
            </motion.button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8 md:mb-12"
            >
                <div className="inline-flex items-center gap-2 bg-brand-accent/10 border border-brand-accent/20 px-4 py-2 rounded-full mb-4">
                    <ShieldCheck className="w-4 h-4 text-brand-accent" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent">Add New Policy</span>
                </div>
                <h2 className="text-2xl md:text-5xl font-black mb-4" style={{ color: 'var(--text-auth-primary)' }}>Select Policy Type</h2>
                <p className="max-w-lg mx-auto text-sm md:text-base" style={{ color: 'var(--text-auth-muted)' }}>What kind of insurance would you like to add today?</p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {types.map((type, idx) => (
                    <motion.button
                        key={type.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/wallet/add-policy/${type.id}`)}
                        className="p-5 md:p-8 rounded-2xl md:rounded-[2rem] border transition-all text-left flex flex-col group relative overflow-hidden"
                        style={{
                            backgroundColor: 'var(--bg-auth-surface)',
                            borderColor: 'var(--border-auth-card)'
                        }}
                    >
                        <div className="text-4xl md:text-5xl mb-4 md:mb-6 group-hover:scale-110 transition-transform origin-left">{type.icon}</div>
                        <h3 className="text-lg md:text-xl font-black mb-2" style={{ color: 'var(--text-auth-primary)' }}>{type.label}</h3>
                        <p className="text-[10px] md:text-xs leading-relaxed" style={{ color: 'var(--text-auth-muted)' }}>{type.desc}</p>

                        <div className="absolute top-4 right-4 p-2 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="w-3 h-3 md:w-4 md:h-4 text-brand-accent" />
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}

const Plus = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);
