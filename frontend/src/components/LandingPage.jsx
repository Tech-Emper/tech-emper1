import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Zap, Target } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-5xl mx-auto px-4 text-center">
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold text-xs mb-8 tracking-widest uppercase">
                    <Zap className="w-4 h-4" />
                    The Future of Insurance
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6" style={{ color: 'var(--text-auth-primary)' }}>
                    Know your exact needs.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
                        Before you buy.
                    </span>
                </h1>
                
                <p className="text-lg md:text-xl font-medium mb-12 leading-relaxed opacity-80" style={{ color: 'var(--text-auth-muted)' }}>
                    Emper.ai doesn't just sell insurance. Our advanced AI mathematically calculates your precise life and health coverage requirements, identifies your true protection gaps, and strictly recommends only what you actually need.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/details" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-brand-accent text-white font-black text-lg shadow-lg shadow-brand-accent/20 hover:scale-105 transition-all flex items-center justify-center gap-2">
                        <Target className="w-5 h-5" />
                        Analyze your Coverage
                    </Link>
                    <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-2xl border-2 font-bold text-lg hover:bg-white/5 transition-all" style={{ borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }}>
                        Login
                    </Link>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl"
            >
                {[
                    { title: "Pure Math, No Bias", desc: "Calculations based strictly on your life stage, income, and liabilities." },
                    { title: "Identify Hidden Gaps", desc: "Upload existing policies to instantly see what you're missing." },
                    { title: "AI-Matched Protection", desc: "Get real-world product recommendations that perfectly fit your data." }
                ].map((feature, i) => (
                    <div key={i} className="p-6 rounded-3xl border text-left" style={{ backgroundColor: 'var(--bg-auth-card)', borderColor: 'var(--border-auth-card)' }}>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 text-emerald-500">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h3 className="font-black text-lg mb-2" style={{ color: 'var(--text-auth-primary)' }}>{feature.title}</h3>
                        <p className="text-sm font-medium opacity-80" style={{ color: 'var(--text-auth-muted)' }}>{feature.desc}</p>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
