import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Search, Building2 } from 'lucide-react';

export default function CompanySelector() {
    const { type } = useParams();
    const navigate = useNavigate();

    const companies = [
        { id: 'hdfc', name: 'HDFC ERGO', logo: '🛡️' },
        { id: 'icici', name: 'ICICI Lombard', logo: '🏦' },
        { id: 'sbi', name: 'SBI General', logo: '💰' },
        { id: 'maxlife', name: 'Max Life', logo: '🌟' },
        { id: 'tataaig', name: 'Tata AIG', logo: '🏗️' },
        { id: 'niva', name: 'Niva Bupa', logo: '🏥' },
        { id: 'star', name: 'Star Health', logo: '✨' },
        { id: 'care', name: 'Care Insurance', logo: '💙' }
    ];

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate('/wallet/add-policy')}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold">Back to Policy Type</span>
            </motion.button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8 md:mb-12"
            >
                <h2 className="text-2xl md:text-5xl font-black mb-4" style={{ color: 'var(--text-auth-primary)' }}>Choose Company</h2>
                <p className="uppercase text-[10px] tracking-widest font-black" style={{ color: 'var(--text-auth-muted)' }}>
                    Provider for your <span className="text-brand-accent">{type}</span> policy
                </p>
            </motion.div>

            {/* Search - Visual only for now */}
            <div className="relative mb-8 max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search for an insurer..."
                    className="w-full border rounded-2xl py-4 pl-12 pr-4 transition-all font-medium"
                    style={{
                        backgroundColor: 'var(--bg-auth-input)',
                        borderColor: 'var(--border-auth-card)',
                        color: 'var(--text-auth-primary)'
                    }}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {companies.map((company, idx) => (
                    <motion.button
                        key={company.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/wallet/add-policy/${type}/${company.id}/details`)}
                        className="p-4 md:p-6 rounded-2xl md:rounded-3xl border transition-all flex items-center gap-4 md:gap-6 group"
                        style={{
                            backgroundColor: 'var(--bg-auth-surface)',
                            borderColor: 'var(--border-auth-card)'
                        }}
                    >
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center text-2xl md:text-3xl group-hover:bg-brand-accent/10 transition-colors">
                            {company.logo}
                        </div>
                        <div className="text-left min-w-0">
                            <h3 className="text-lg md:text-xl font-black truncate" style={{ color: 'var(--text-auth-primary)' }}>{company.name}</h3>
                            <p className="text-[8px] md:text-[10px] uppercase tracking-widest font-black" style={{ color: 'var(--text-auth-muted)' }}>Available Plans: 12+</p>
                        </div>
                        <Building2 className="w-4 h-4 md:w-5 md:h-5 text-slate-700 ml-auto group-hover:text-brand-accent transition-colors" />
                    </motion.button>
                ))}
            </div>

            <div className="mt-12 text-center p-8 rounded-3xl border border-white/5 bg-white/2">
                <p className="text-sm text-slate-500 font-bold italic mb-0">Can't find your insurer? We're adding more every day.</p>
            </div>
        </div>
    );
}
