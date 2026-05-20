import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function PortabilityLanding() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-5xl mx-auto px-4 text-center">
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 font-bold text-xs mb-8 tracking-widest uppercase">
                    <Shield className="w-4 h-4" />
                    Seamless Transition
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6" style={{ color: 'var(--text-auth-primary)' }}>
                    Better coverage.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                        Zero hassle.
                    </span>
                </h1>
                
                <p className="text-lg md:text-xl font-medium mb-12 leading-relaxed opacity-80" style={{ color: 'var(--text-auth-muted)' }}>
                    Port your existing health insurance to comprehensive new plans while preserving your waiting periods and accumulated benefits. Fast, digital, and completely transparent.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/login?redirect=portability" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 text-white font-black text-lg shadow-lg shadow-blue-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2">
                        Get Started
                        <ArrowRight className="w-5 h-5" />
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
                    { title: "Preserve Benefits", desc: "Keep your pre-existing disease waiting periods and no-claim bonuses." },
                    { title: "Digital Process", desc: "Upload your documents and track your portability status entirely online." },
                    { title: "Expert Advisory", desc: "Get unbiased recommendations on which plans suit your family best." }
                ].map((feature, i) => (
                    <div key={i} className="p-6 rounded-3xl border text-left" style={{ backgroundColor: 'var(--bg-auth-card)', borderColor: 'var(--border-auth-card)' }}>
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 text-blue-500">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <h3 className="font-black text-lg mb-2" style={{ color: 'var(--text-auth-primary)' }}>{feature.title}</h3>
                        <p className="text-sm font-medium opacity-80" style={{ color: 'var(--text-auth-muted)' }}>{feature.desc}</p>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
