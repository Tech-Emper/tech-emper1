import { useState } from 'react';
import StepWrapper from './StepWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Shield, Code, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

export default function Step05_Results({ result, formData, onNext }) {
    const [showPrompt, setShowPrompt] = useState(false);
    const [expandedReason, setExpandedReason] = useState(false);
    const [expandedFeatureList, setExpandedFeatureList] = useState(false);
    const [expandedFeatures, setExpandedFeatures] = useState({});

    const toggleFeature = (idx) => {
        setExpandedFeatures(prev => ({
            ...prev,
            [idx]: !prev[idx]
        }));
    };
    if (!result) return null;

    const lifeCover = result.life_cover;
    const healthCover = result.health_cover;
    const features = result.recommended_features || result.features || [];

    console.log("DEBUG: Result Covers", {
        life_str: result.life_cover,
        life_val: result.life_cover_val,
        health_str: result.health_cover,
        health_val: result.health_cover_val
    });
    console.log("DEBUG: Form Data existing", {
        existing_life: formData?.existing_life_cover_val,
        existing_health: formData?.existing_health_cover_val
    });

    // Ideal Calculations (derived from result)
    const idealLifeVal = result.life_cover_val || 0;
    const idealHealthVal = result.health_cover_val || 0;

    const formatINR = (val) => {
        if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
        if (val >= 100000) return `₹${(val / 100000).toFixed(0)} Lakh`;
        return `₹${val.toLocaleString('en-IN')}`;
    };

    return (
        <StepWrapper className="text-center space-y-4 md:space-y-6">
            {/* {result.mode === 'AI' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center mb-2"
                >
                    <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-blue-400">AI Powered Recommendation</span>
                    </div>
                </motion.div>
            )} */}

            <div className="flex justify-center">

                <div className="max-w-md mx-auto mt-2">
                    <h2 className="text-2xl md:text-3xl font-extrabold mb-2" style={{ color: 'var(--text-auth-primary)' }}>Your insurance target</h2>
                    <p className="text-xs md:text-sm leading-relaxed px-4 font-medium italic" style={{ color: 'var(--text-auth-muted)' }}>
                        {"Your ideal coverage based on life stage, career and health"}
                    </p>
                </div>

                <div className="inline-block relative">
                    <div className="text-5xl md:text-7xl animate-bounce">{"🎯"}</div>
                    <Sparkles className="absolute -top-4 -right-4 text-yellow-400 w-6 h-6 md:w-8 md:h-8 animate-pulse" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-brand-accent/10 p-4 min-[600px]:p-6 rounded-2xl border border-brand-accent/20 backdrop-blur-sm relative overflow-hidden flex flex-col h-full"
                >
                    <div className="flex flex-col min-[600px]:flex-row min-[600px]:items-center justify-between w-full h-full gap-4">
                        <div className="flex flex-col items-center min-[600px]:items-start min-[600px]:w-1/2">
                            <div className="flex items-center justify-center min-[600px]:justify-start gap-2 mb-2 min-[600px]:mb-3">
                                <Shield className="w-6 h-6 min-[600px]:w-8 min-[600px]:h-8 text-brand-accent" />
                                <h3 className="text-sm min-[600px]:text-base uppercase tracking-widest text-emerald-600 font-extrabold">Health Cover</h3>
                            </div>
                            <p className="text-2xl min-[600px]:text-3xl font-black mb-2 min-[600px]:mb-0" style={{ color: 'var(--text-auth-primary)' }}>{healthCover || "Calculated below"}</p>
                        </div>

                        <div className="flex-grow min-[600px]:w-1/2 border-t border-emerald-500/20 min-[600px]:border-t-0 min-[600px]:border-l pt-4 min-[600px]:pt-0 min-[600px]:pl-6">
                            <p className="text-xs min-[600px]:text-sm font-bold mb-2 opacity-70 text-left" style={{ color: 'var(--text-auth-primary)' }}>Recommended Features:</p>
                            <ul className="text-left text-xs min-[600px]:text-sm space-y-2 opacity-90 mx-auto w-full" style={{ color: 'var(--text-auth-primary)' }}>
                                <li className="flex items-start gap-2"><span className="text-brand-accent mt-0.5">•</span> Cashless hospitalization across major hospitals</li>
                                <li className="flex items-start gap-2"><span className="text-brand-accent mt-0.5">•</span> Pre &amp; post hospitalization expenses (30–60 days)</li>
                                <li className="flex items-start gap-2"><span className="text-brand-accent mt-0.5">•</span> No-claim bonus (increases cover every year)</li>
                            </ul>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-blue-500/10 p-4 min-[600px]:p-6 rounded-2xl border border-blue-500/20 backdrop-blur-sm relative overflow-hidden flex flex-col h-full"
                >
                    <div className="flex flex-col min-[600px]:flex-row min-[600px]:items-center justify-between w-full h-full gap-4">
                        <div className="flex flex-col items-center min-[600px]:items-start min-[600px]:w-1/2">
                            <div className="flex items-center justify-center min-[600px]:justify-start gap-2 mb-2 min-[600px]:mb-3">
                                <Heart className="w-6 h-6 min-[600px]:w-8 min-[600px]:h-8 text-blue-400" />
                                <h3 className="text-sm min-[600px]:text-base uppercase tracking-widest text-blue-600 font-extrabold">Life Cover</h3>
                            </div>
                            <p className="text-2xl min-[600px]:text-3xl font-black mb-2 min-[600px]:mb-0" style={{ color: 'var(--text-auth-primary)' }}>{lifeCover || "Calculated below"}</p>
                        </div>

                        <div className="flex-grow min-[600px]:w-1/2 border-t border-blue-500/20 min-[600px]:border-t-0 min-[600px]:border-l pt-4 min-[600px]:pt-0 min-[600px]:pl-6">
                            <p className="text-xs min-[600px]:text-sm font-bold mb-2 opacity-70 text-left" style={{ color: 'var(--text-auth-primary)' }}>Recommended Features:</p>
                            <ul className="text-left text-xs min-[600px]:text-sm space-y-2 opacity-90 mx-auto w-full" style={{ color: 'var(--text-auth-primary)' }}>
                                <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">•</span> Comprehensive life cover up to 99 years</li>
                                <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">•</span> Waiver of premium on critical illness</li>
                                <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">•</span> Fixed premium for the entire policy term</li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>

            {result.reasoning && (
                <div
                    className="text-left border rounded-2xl overflow-hidden cursor-pointer transition-all group"
                    style={{
                        backgroundColor: 'var(--bg-auth-input)',
                        borderColor: 'var(--border-auth-card)'
                    }}
                    onClick={() => setExpandedReason(!expandedReason)}
                >
                    <div className="p-5 md:p-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold tracking-wider flex items-center gap-2" style={{ color: 'var(--text-auth-primary)' }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
                                Why this coverage?
                            </h3>
                            {expandedReason ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--text-auth-placeholder)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-auth-placeholder)' }} />}
                        </div>
                        <p className="text-sm font-medium leading-relaxed italic" style={{ color: 'var(--text-auth-primary)' }}>"{result.summary || result.tagline}"</p>

                        <AnimatePresence>
                            {(expandedReason || !result.summary) && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <p className="text-xs leading-relaxed italic border-t pt-3 mt-1" style={{
                                        color: 'var(--text-auth-muted)',
                                        borderTopColor: 'var(--border-auth-card)'
                                    }}>
                                        {result.reasoning}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}



            {/* Debug Section (Collapsible) */}
            {result.show_debug && result.prompt_sent && (
                <div className="mt-8 border-t pt-8" style={{ borderTopColor: 'var(--border-auth-card)' }}>
                    <button
                        onClick={() => setShowPrompt(!showPrompt)}
                        className="flex items-center gap-2 mx-auto text-[10px] font-black uppercase tracking-widest transition-colors group"
                        style={{ color: 'var(--text-auth-placeholder)' }}
                    >
                        <Code className="w-3 h-3 transition-transform group-hover:scale-110" />
                        {showPrompt ? 'Hide Debug Prompt' : 'Show Debug Prompt'}
                        {showPrompt ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    <AnimatePresence>
                        {showPrompt && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-4 text-left bg-black/40 border p-4 rounded-xl font-mono text-[10px] max-w-full overflow-x-auto leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto custom-scrollbar" style={{
                                    borderColor: 'var(--border-auth-card)',
                                    color: 'var(--text-auth-muted)'
                                }}>
                                    <div className="flex items-center justify-between mb-2 pb-2 border-b" style={{ borderBottomColor: 'var(--border-auth-card)' }}>
                                        <span className="text-blue-400 font-bold">RAW PROMPT SENT TO LLM</span>
                                        <span className="text-[8px] bg-slate-800 px-2 py-0.5 rounded uppercase" style={{ color: 'var(--text-auth-placeholder)' }}>ReadOnly</span>
                                    </div>
                                    {result.prompt_sent}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* CTA to proceed to Policy Entry */}
            <div className="pt-2 pb-2">
                <button
                    onClick={onNext}
                    className="w-full bg-brand-accent sm:w-auto mx-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    style={{
                        // backgroundColor: 'var(--btn-primary-bg)',
                        color: 'var(--btn-primary-text)'
                    }}
                >
                    <span>Tell us about your existing policies</span>
                    <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-auth-muted)' }}>
                    Already have coverage? Let us factor it in.
                </p>
            </div>

        </StepWrapper>
    );
}
