import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Heart, Users, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import StepWrapper from './StepWrapper';

export default function Step07_GapAnalysis({ formData, result, onNext }) {
    const [expandedReasoning, setExpandedReasoning] = useState(false);

    if (!result) return null;

    const { life_cover, health_cover, icon, reasoning, details, summary } = result;
    const { num_children, dependents, first_name, existing_life_cover, existing_health_cover } = formData;

    // Filter active dependents
    const activeDependents = Object.entries(dependents || {})
        .filter(([_, isActive]) => isActive)
        .map(([name]) => name === 'Children' ? `${num_children} Children` : name);

    // Gap Analysis Helpers
    const parseToLakhs = (str) => {
        if (!str || str === "None" || str === "") return 0;
        const cleanStr = str.replace(/[₹,]/g, '').trim();
        const parts = cleanStr.split(' ');
        const num = parseFloat(parts[0]);
        const lowerStr = str.toLowerCase();
        if (lowerStr.includes('crore') || lowerStr.includes('cr')) return num * 100;
        return num;
    };

    const idealLife = parseToLakhs(life_cover);
    const existingLifeNum = (formData.existing_life_cover_val || 0) / 100000;
    const lifeGap = Math.max(0, idealLife - existingLifeNum);

    const idealHealth = parseToLakhs(health_cover);
    const existingHealthNum = (formData.existing_health_cover_val || 0) / 100000;
    const healthGap = Math.max(0, idealHealth - existingHealthNum);

    const formatLakhs = (lakhs) => {
        if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(1)} Crore`;
        return `₹${Math.round(lakhs)} Lakhs`;
    };

    return (
        <StepWrapper className="space-y-6 md:space-y-8">
            <div className="text-center">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-2 italic" style={{ color: 'var(--text-auth-primary)' }}>Protection Dashboard</h2>
                <p className="text-sm md:text-base" style={{ color: 'var(--text-auth-muted)' }}>
                    Comparing your <span className="text-brand-accent">Ideal Shield</span> with your <span style={{ color: 'var(--text-auth-primary)' }}>Existing Net</span>.
                </p>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
            >
                {/* Gap Analysis Dashboard */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Profile Context */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 rounded-2xl border" style={{
                            color: 'var(--text-auth-label)',
                            backgroundColor: 'var(--bg-auth-input)',
                            borderColor: 'var(--border-auth-card)'
                        }}>
                            <Users className="w-4 h-4 text-brand-accent" />
                            <span className="text-xs uppercase font-black tracking-widest">Family: <strong style={{ color: 'var(--text-auth-primary)' }}>{activeDependents.join(', ') || 'Self Only'}</strong></span>
                        </div>
                    </div>

                    {/* Life Insurance Gap */}
                    <div className="border rounded-3xl p-6 relative overflow-hidden group" style={{
                        backgroundColor: 'var(--bg-auth-input)',
                        borderColor: 'var(--border-auth-card)'
                    }}>
                        <div className="flex flex-col justify-between items-start mb-4 sm:flex-row">
                            <div>
                                <h4 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-auth-primary)' }}>
                                    <Heart className="w-5 h-5 text-orange-500" /> Life Insurance
                                </h4>
                                <p className="text-xs mt-1 uppercase tracking-wider" style={{ color: 'var(--text-auth-muted)' }}>Additional protection Suggested</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-2xl font-black ${lifeGap > 0 ? 'text-orange-500' : 'text-emerald-500'}`}>
                                    {lifeGap > 0 ? `+${formatLakhs(lifeGap)}` : 'Fully Protected'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="h-3 rounded-full overflow-hidden flex border" style={{
                                backgroundColor: 'var(--bg-auth-input)',
                                borderColor: 'var(--border-auth-card)'
                            }}>
                                <div
                                    className="h-full bg-orange-500 border-r border-orange-500/50 transition-all duration-1000"
                                    style={{ width: `${Math.min(100, (existingLifeNum / Math.max(1, idealLife)) * 100)}%` }}
                                />
                                {lifeGap > 0 && (
                                    <div
                                        className="h-full bg-orange-500/20 animate-pulse transition-all duration-1000"
                                        style={{ width: `${Math.min(100, (lifeGap / idealLife) * 100)}%` }}
                                    />
                                )}
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span style={{ color: 'var(--text-auth-muted)' }}>Current: {existing_life_cover || "None"}</span>
                                <span style={{ color: 'var(--text-auth-primary)' }}>AI Ideal: {life_cover}</span>
                            </div>
                        </div>
                    </div>

                    {/* Health Insurance Gap */}
                    <div className="border rounded-3xl p-6 relative overflow-hidden group" style={{
                        backgroundColor: 'var(--bg-auth-input)',
                        borderColor: 'var(--border-auth-card)'
                    }}>
                        <div className="flex flex-col justify-between items-start mb-4 sm:flex-row">
                            <div>
                                <h4 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-auth-primary)' }}>
                                    <Shield className="w-5 h-5 text-blue-500" /> Health Insurance
                                </h4>
                                <p className="text-xs mt-1 uppercase tracking-wider" style={{ color: 'var(--text-auth-muted)' }}>Suggested Medical Buffer</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-2xl font-black ${healthGap > 0 ? 'text-blue-500' : 'text-emerald-500'}`}>
                                    {healthGap > 0 ? `+${formatLakhs(healthGap)}` : 'Fully Protected'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="h-3 rounded-full overflow-hidden flex border" style={{
                                backgroundColor: 'var(--bg-auth-input)',
                                borderColor: 'var(--border-auth-card)'
                            }}>
                                <div
                                    className="h-full bg-blue-500 border-r border-blue-500/50 transition-all duration-1000"
                                    style={{ width: `${Math.min(100, (existingHealthNum / Math.max(1, idealHealth)) * 100)}%` }}
                                />
                                {healthGap > 0 && (
                                    <div
                                        className="h-full bg-blue-500/20 animate-pulse transition-all duration-1000"
                                        style={{ width: `${Math.min(100, (healthGap / idealHealth) * 100)}%` }}
                                    />
                                )}
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span style={{ color: 'var(--text-auth-muted)' }}>Current: {existing_health_cover || "None"}</span>
                                <span style={{ color: 'var(--text-auth-primary)' }}>AI Ideal: {health_cover}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Strategic Reasoning */}
                <div
                    className="p-6 md:p-8 bg-brand-accent/10 border border-brand-accent/20 rounded-3xl relative overflow-hidden group cursor-pointer transition-all hover:bg-brand-accent/15"
                    onClick={() => setExpandedReasoning(!expandedReasoning)}
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Sparkles className="w-12 h-12 text-brand-accent" />
                    </div>
                    <div className="flex items-start gap-4">
                        <span className="text-3xl">{icon || "🛡️"}</span>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="font-bold" style={{ color: 'var(--text-auth-primary)' }}>Our AI's Strategic Reasoning</h4>
                                {expandedReasoning ? <ChevronUp className="w-5 h-5 text-brand-accent" /> : <ChevronDown className="w-5 h-5 text-brand-accent" />}
                            </div>

                            <AnimatePresence>
                                {expandedReasoning && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="leading-relaxed italic text-sm font-medium mb-2 mt-2" style={{ color: 'var(--text-auth-label)' }}>"{summary || reasoning || details}"</p>
                                        {(summary && reasoning) && (
                                            <p className="leading-relaxed text-xs opacity-80 border-t pt-2" style={{
                                                color: 'var(--text-auth-muted)',
                                                borderTopColor: 'var(--border-auth-card)'
                                            }}>
                                                {reasoning}
                                            </p>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {!expandedReasoning && (
                                <p className="text-xs italic truncate max-w-md opacity-70" style={{ color: 'var(--text-auth-muted)' }}>
                                    "{summary || reasoning || details}"
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Action */}
                <div className="pt-4">
                    <button
                        onClick={onNext}
                        className="w-full py-4 rounded-xl font-black text-base md:text-lg bg-brand-accent text-white flex items-center justify-center gap-2 hover:bg-brand-accent/90 transition-all" style={{ color: 'white' }}
                    >
                        Get Suggestion ✨
                    </button>
                </div>
            </motion.div>
        </StepWrapper>
    );
}
