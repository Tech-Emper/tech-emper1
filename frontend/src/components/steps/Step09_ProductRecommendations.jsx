import { useState, useEffect } from 'react';
import StepWrapper from './StepWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, ShieldCheck, HeartPulse, Info, Loader2, Code, ChevronUp, ChevronDown, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../../config';

export default function Step09_ProductRecommendations({ formData, gapResult, onComplete }) {
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [expandedOverall, setExpandedOverall] = useState(true);
    const [expandedLife, setExpandedLife] = useState({ 0: true }); // Only first expanded by default
    const [expandedHealth, setExpandedHealth] = useState({ 0: true }); // Only first expanded by default
    const [showLifeResults, setShowLifeResults] = useState(true);
    const [showHealthResults, setShowHealthResults] = useState(true);
    const [expandedBenefits, setExpandedBenefits] = useState({ 'life-0': true, 'health-0': true }); // Only first ones expanded

    const toggleLife = (idx) => setExpandedLife(prev => ({ ...prev, [idx]: !prev[idx] }));
    const toggleHealth = (idx) => setExpandedHealth(prev => ({ ...prev, [idx]: !prev[idx] }));

    useEffect(() => {
        const fetchProductRecs = async () => {
            try {
                const token = localStorage.getItem('auth_token');

                // Calculate age from DOB
                let calculatedAge = 30;
                if (formData.dob) {
                    const birthDate = new Date(formData.dob);
                    const today = new Date();
                    calculatedAge = today.getFullYear() - birthDate.getFullYear();
                    const m = today.getMonth() - birthDate.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                        calculatedAge--;
                    }
                }

                console.log("DEBUG: Fetching products for gapResult:", gapResult);
                const response = await fetch(`${API_BASE_URL}/api/policy-recommendations`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        recommended_life_cover: gapResult.life_cover,
                        recommended_life_cover_val: gapResult.life_cover_val,
                        recommended_health_cover: gapResult.health_cover,
                        recommended_health_cover_val: gapResult.health_cover_val,
                        recommended_features: (gapResult.recommended_features || []).map(f => f.name),
                        has_life_insurance: formData.has_life_insurance,
                        existing_life_cover_val: formData.existing_life_cover_val,
                        life_provider: formData.life_provider === "Other" ? formData.life_provider_custom : formData.life_provider,
                        life_policy_name: formData.life_policy_name === "Other" ? formData.life_policy_name_custom : formData.life_policy_name,
                        has_health_insurance: formData.has_health_insurance,
                        existing_health_cover_val: formData.existing_health_cover_val,
                        health_provider: formData.health_provider === "Other" ? formData.health_provider_custom : formData.health_provider,
                        health_policy_name: formData.health_policy_name === "Other" ? formData.health_policy_name_custom : formData.health_policy_name,
                        health_source: formData.health_source,
                        first_name: formData.first_name,
                        age: calculatedAge,
                        income_level: formData.income_level,
                        city: formData.city
                    })
                });

                if (!response.ok) throw new Error("Failed to fetch products");
                const data = await response.json();
                console.log("DEBUG: Received recommendations:", data);
                setRecommendations(data);
            } catch (err) {
                console.error(err);
                setError("Unable to fetch specific plans. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (gapResult) fetchProductRecs();
    }, [formData, gapResult]);

    if (loading) {
        return (
            <StepWrapper className="text-center py-20">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-brand-accent animate-spin" />
                    <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-auth-primary)' }}>I'm scanning the market for you...</h2>
                    <p className="text-sm italic" style={{ color: 'var(--text-auth-muted)' }}>Matching your needs with thousands of Indian insurance plans.</p>
                </div>
            </StepWrapper>
        );
    }

    if (error || !recommendations) {
        return (
            <StepWrapper className="text-center py-20">
                <p className="text-red-400">{error || "Something went wrong."}</p>
            </StepWrapper>
        );
    }

    const { life_recommendations = [], health_recommendations = [], overall_narrative } = recommendations;

    return (
        <StepWrapper className="space-y-4 md:space-y-6">
            <div className="text-center">
                {/* <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full inline-flex items-center gap-2 backdrop-blur-md mb-2 md:mb-4">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">AI Product Matching Engine</span>
                </div> */}
                <h2 className="text-2xl md:text-3xl font-black mb-2 italic" style={{ color: 'var(--text-auth-primary)' }}>"My Final Handpicked Selection"</h2>

                <div
                    className="max-w-xl mx-auto cursor-pointer group"
                    onClick={() => setExpandedOverall(!expandedOverall)}
                >
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-slate-300" style={{ color: 'var(--text-auth-placeholder)' }}>Analysis Summary</span>
                        {expandedOverall ? <ChevronUp className="w-3 h-3" style={{ color: 'var(--text-auth-placeholder)' }} /> : <ChevronDown className="w-3 h-3" style={{ color: 'var(--text-auth-placeholder)' }} />}
                    </div>
                    <AnimatePresence>
                        {expandedOverall && (
                            <motion.p
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="text-xs md:text-sm leading-relaxed overflow-hidden"
                                style={{ color: 'var(--text-auth-muted)' }}
                            >
                                {overall_narrative}
                            </motion.p>
                        )}
                    </AnimatePresence>
                    {!expandedOverall && (
                        <p className="text-xs italic truncate px-4 opacity-50" style={{ color: 'var(--text-auth-placeholder)' }}>
                            {overall_narrative}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Health Insurance Recommendations */}
                <div className="space-y-3">
                    <div
                        className="flex items-center justify-center md:justify-start gap-2 cursor-pointer group mb-2"
                        onClick={() => setShowHealthResults(!showHealthResults)}
                    >
                        <h3 className="text-xl font-black italic group-hover:text-blue-400 transition-colors" style={{ color: 'var(--text-auth-primary)' }}>Health Insurance</h3>
                        {showHealthResults ? <ChevronUp className="w-5 h-5 group-hover:text-blue-400" style={{ color: 'var(--text-auth-placeholder)' }} /> : <ChevronDown className="w-5 h-5 group-hover:text-blue-400" style={{ color: 'var(--text-auth-placeholder)' }} />}
                    </div>

                    <AnimatePresence>
                        {showHealthResults && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="space-y-3 overflow-hidden"
                            >
                                {health_recommendations.length > 0 ? (
                                    health_recommendations.map((rec, idx) => (
                                        <motion.div
                                            key={`health-${idx}`}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="rounded-2xl p-4 relative group overflow-hidden"
                                            style={{
                                                backgroundColor: 'var(--bg-auth-card)',
                                                borderWidth: '1px',
                                                borderStyle: 'solid',
                                                borderColor: 'var(--border-auth-card)'
                                            }}
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -z-10" />
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                                    <ShieldCheck className="w-6 h-6 text-blue-500" />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-lg" style={{ color: 'var(--text-auth-primary)' }}>
                                                        {idx === 0 ? "Top Health Match" : `Health Option #${idx + 1}`}
                                                    </h3>
                                                    <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest">Optimizing your medical safety net</p>
                                                </div>
                                            </div>

                                            <div className="mb-6">
                                                <div className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-1">Recommended Policy</div>
                                                <h4 className="font-black text-xl mb-1" style={{ color: 'var(--text-auth-primary)' }}>{rec.product_name}</h4>
                                                <p className="font-bold text-sm mb-4" style={{ color: 'var(--text-auth-muted)' }}>By {rec.provider}</p>

                                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-4">
                                                    <div className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-1">Recommended Sum Insured</div>
                                                    <div className="text-2xl font-black" style={{ color: 'var(--text-auth-primary)' }}>{rec.recommended_cover}</div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div
                                                    className="bg-brand-accent/5 rounded-2xl p-4 border border-brand-accent/10 cursor-pointer hover:bg-brand-accent/10 transition-colors"
                                                    onClick={() => toggleHealth(idx)}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
                                                            <span className="text-[10px] font-black uppercase text-brand-accent tracking-widest">Gap & Feature Analysis</span>
                                                        </div>
                                                        {expandedHealth[idx] ? <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--text-auth-placeholder)' }} /> : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-auth-placeholder)' }} />}
                                                    </div>

                                                    <AnimatePresence initial={false}>
                                                        {expandedHealth[idx] ? (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <p className="text-xs font-medium leading-relaxed mb-3" style={{ color: 'var(--text-auth-muted)' }}>
                                                                    {rec.gap_filled}
                                                                </p>
                                                                <p className="text-[11px] italic mb-4" style={{ color: 'var(--text-auth-muted)' }}>
                                                                    {rec.feature_match_analysis}
                                                                </p>

                                                                <div className="rounded-xl p-3" style={{
                                                                    backgroundColor: 'var(--bg-auth-input)',
                                                                    borderWidth: '1px',
                                                                    borderStyle: 'solid',
                                                                    borderColor: 'var(--border-auth-card)'
                                                                }}>
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <Info className="w-3 h-3" style={{ color: 'var(--text-auth-placeholder)' }} />
                                                                        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-auth-placeholder)' }}>Strategic Reasoning</span>
                                                                    </div>
                                                                    <p className="text-[11px] italic leading-relaxed" style={{ color: 'var(--text-auth-muted)' }}>"{rec.why_this}"</p>
                                                                </div>
                                                            </motion.div>
                                                        ) : (
                                                            <p className="text-xs text-slate-500 truncate italic">
                                                                {rec.why_this}
                                                            </p>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                <div className="space-y-2 mt-2">
                                                    <div
                                                        className="flex items-center justify-between cursor-pointer group"
                                                        onClick={() => setExpandedBenefits(prev => ({ ...prev, [`health-${idx}`]: !prev[`health-${idx}`] }))}
                                                    >
                                                        <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-slate-300" style={{ color: 'var(--text-auth-placeholder)' }}>Key Benefits</span>
                                                        {expandedBenefits[`health-${idx}`] ? <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--text-auth-placeholder)' }} /> : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-auth-placeholder)' }} />}
                                                    </div>

                                                    <AnimatePresence>
                                                        {expandedBenefits[`health-${idx}`] && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                {(rec.key_benefits || []).map((benefit, i) => (
                                                                    <div key={i} className="flex items-start gap-2 mb-2">
                                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5" />
                                                                        <span className="text-xs font-medium" style={{ color: 'var(--text-auth-muted)' }}>{benefit}</span>
                                                                    </div>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="rounded-2xl p-6 flex flex-col items-center justify-center text-center opacity-60 h-full min-h-[200px]"
                                        style={{
                                            backgroundColor: 'var(--bg-auth-input)',
                                            borderWidth: '1px',
                                            borderStyle: 'dashed',
                                            borderColor: 'var(--border-auth-card)'
                                        }}
                                    >
                                        <CheckCircle2 className="w-12 h-12 mb-4" style={{ color: 'var(--text-auth-placeholder)' }} />
                                        <h3 className="font-bold mb-2" style={{ color: 'var(--text-auth-primary)' }}>Health Cover is Robust</h3>
                                        <p className="text-xs max-w-[200px]" style={{ color: 'var(--text-auth-muted)' }}>Your existing Health Insurance with {formData.health_provider} covers both amount and essential features. You are well projected.</p>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                {/* Life Insurance Recommendations */}
                <div className="space-y-3">
                    <div
                        className="flex items-center justify-center md:justify-start gap-2 cursor-pointer group mb-2"
                        onClick={() => setShowLifeResults(!showLifeResults)}
                    >
                        <h3 className="text-xl font-black italic group-hover:text-pink-400 transition-colors" style={{ color: 'var(--text-auth-primary)' }}>Life Insurance</h3>
                        {showLifeResults ? <ChevronUp className="w-5 h-5 group-hover:text-pink-400" style={{ color: 'var(--text-auth-placeholder)' }} /> : <ChevronDown className="w-5 h-5 group-hover:text-pink-400" style={{ color: 'var(--text-auth-placeholder)' }} />}
                    </div>

                    <AnimatePresence>
                        {showLifeResults && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="space-y-3 overflow-hidden"
                            >
                                {life_recommendations.length > 0 ? (
                                    life_recommendations.map((rec, idx) => (
                                        <motion.div
                                            key={`life-${idx}`}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="rounded-2xl p-4 relative group overflow-hidden"
                                            style={{
                                                backgroundColor: 'var(--bg-auth-card)',
                                                borderWidth: '1px',
                                                borderStyle: 'solid',
                                                borderColor: 'var(--border-auth-card)'
                                            }}
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-3xl -z-10" />
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                                                    <HeartPulse className="w-6 h-6 text-pink-500" />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-lg" style={{ color: 'var(--text-auth-primary)' }}>
                                                        {idx === 0 ? "Top Life Choice" : `Life Option #${idx + 1}`}
                                                    </h3>
                                                    <p className="text-[10px] text-pink-400 uppercase font-black tracking-widest">Bridging your coverage gap</p>
                                                </div>
                                            </div>

                                            <div className="mb-6">
                                                <div className="text-[10px] font-black uppercase text-pink-400 tracking-widest mb-1">Recommended Policy</div>
                                                <h4 className="font-black text-xl mb-1" style={{ color: 'var(--text-auth-primary)' }}>{rec.product_name}</h4>
                                                <p className="font-bold text-sm mb-4" style={{ color: 'var(--text-auth-muted)' }}>By {rec.provider}</p>

                                                <div className="bg-pink-500/10 border border-pink-500/20 rounded-2xl p-4 mb-4">
                                                    <div className="text-[10px] font-black uppercase text-pink-500 tracking-widest mb-1">Recommended Sum Assured</div>
                                                    <div className="text-2xl font-black" style={{ color: 'var(--text-auth-primary)' }}>{rec.recommended_cover}</div>
                                                </div>
                                            </div>

                                            <div className="space-y-4 mb-6">
                                                <div
                                                    className="rounded-2xl p-4 cursor-pointer hover:bg-white/10 transition-colors"
                                                    style={{
                                                        backgroundColor: 'var(--bg-auth-input)',
                                                        borderWidth: '1px',
                                                        borderStyle: 'solid',
                                                        borderColor: 'var(--border-auth-card)'
                                                    }}
                                                    onClick={() => toggleLife(idx)}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-auth-placeholder)' }}>Gap Analysis & Strategy</span>
                                                        </div>
                                                        {expandedLife[idx] ? <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--text-auth-placeholder)' }} /> : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-auth-placeholder)' }} />}
                                                    </div>

                                                    <AnimatePresence initial={false}>
                                                        {expandedLife[idx] ? (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <p className="text-xs leading-relaxed font-medium mb-4" style={{ color: 'var(--text-auth-muted)' }}>
                                                                    {rec.gap_filled}
                                                                </p>
                                                                <div className="rounded-xl p-3 mb-4" style={{
                                                                    backgroundColor: 'var(--bg-auth-input)',
                                                                    borderWidth: '1px',
                                                                    borderStyle: 'solid',
                                                                    borderColor: 'var(--border-auth-card)'
                                                                }}>
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <Info className="w-3 h-3" style={{ color: 'var(--text-auth-placeholder)' }} />
                                                                        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-auth-placeholder)' }}>Why I chose this</span>
                                                                    </div>
                                                                    <p className="text-[11px] italic leading-relaxed" style={{ color: 'var(--text-auth-muted)' }}>"{rec.why_this}"</p>
                                                                </div>
                                                            </motion.div>
                                                        ) : (
                                                            <p className="text-xs text-slate-500 truncate italic">
                                                                {rec.why_this}
                                                            </p>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                <div className="space-y-2">
                                                    <div
                                                        className="flex items-center justify-between cursor-pointer group"
                                                        onClick={() => setExpandedBenefits(prev => ({ ...prev, [`life-${idx}`]: !prev[`life-${idx}`] }))}
                                                    >
                                                        <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-slate-300" style={{ color: 'var(--text-auth-placeholder)' }}>Key Benefits</span>
                                                        {expandedBenefits[`life-${idx}`] ? <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--text-auth-placeholder)' }} /> : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-auth-placeholder)' }} />}
                                                    </div>

                                                    <AnimatePresence>
                                                        {expandedBenefits[`life-${idx}`] && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                {(rec.key_benefits || []).map((benefit, i) => (
                                                                    <div key={i} className="flex items-start gap-2 mb-2">
                                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5" />
                                                                        <span className="text-xs font-medium" style={{ color: 'var(--text-auth-muted)' }}>{benefit}</span>
                                                                    </div>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="rounded-2xl p-6 flex flex-col items-center justify-center text-center opacity-60 h-full min-h-[200px]"
                                        style={{
                                            backgroundColor: 'var(--bg-auth-input)',
                                            borderWidth: '1px',
                                            borderStyle: 'dashed',
                                            borderColor: 'var(--border-auth-card)'
                                        }}
                                    >
                                        <ShieldCheck className="w-12 h-12 mb-4" style={{ color: 'var(--text-auth-placeholder)' }} />
                                        <h3 className="font-bold mb-2" style={{ color: 'var(--text-auth-primary)' }}>Life Cover is Solid</h3>
                                        <p className="text-xs max-w-[200px]" style={{ color: 'var(--text-auth-muted)' }}>Your existing Life Insurance of {formData.existing_life_cover} meets your current needs. No new policy required.</p>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex flex-col items-center gap-4 pt-6">
                <button
                    onClick={() => onComplete(recommendations)}
                    className="group relative bg-white text-brand-dark px-6 py-3 md:px-10 md:py-4 rounded-xl md:rounded-2xl font-black text-base md:text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] transition-all hover:scale-105 active:scale-95 overflow-hidden"
                >
                    <span className="relative z-10 flex items-center gap-2 md:gap-3">
                        Finish
                        <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>
                <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-auth-placeholder)' }}>Secure. Personalized. Digital.</p>
            </div>

            {/* Debug Section (Collapsible) */}
            {
                recommendations.show_debug && recommendations.prompt_sent && (
                    <div className="mt-8 pt-8" style={{ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'var(--border-auth-card)' }}>
                        <button
                            onClick={() => setShowPrompt(!showPrompt)}
                            className="flex items-center gap-2 mx-auto text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors group"
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
                                    <div className="mt-4 text-left font-mono text-[10px] max-w-full overflow-x-auto leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto custom-scrollbar p-4 rounded-xl"
                                        style={{
                                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                            borderWidth: '1px',
                                            borderStyle: 'solid',
                                            borderColor: 'var(--border-auth-card)',
                                            color: 'var(--text-auth-muted)'
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-2 pb-2" style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--border-auth-card)' }}>
                                            <span className="text-blue-400 font-bold">RAW PROMPT SENT TO LLM</span>
                                            <span className="text-[8px] px-2 py-0.5 rounded uppercase" style={{ backgroundColor: '#1e293b', color: 'var(--text-auth-placeholder)' }}>ReadOnly</span>
                                        </div>
                                        {recommendations.prompt_sent}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )
            }
        </StepWrapper >
    );
}
