import StepWrapper from './StepWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Shield, Briefcase, Plus, Users } from 'lucide-react';

export default function Step06_ExistingCoverage({ formData, updateField }) {

    const formatCurrency = (val) => {
        if (!val) return "None";
        if (val >= 100) return `₹${(val / 100).toFixed(1)} Crore`;
        return `₹${val} Lakhs`;
    };

    // Helper for slider to Lakhs conversion
    // 0-100: 0-100 Lakhs
    // 100-500: 1-5 Crore
    const parseSliderValue = (val) => {
        if (val <= 100) return val; // 1-100 Lakhs
        return Math.round(val); // Just return the value, format handles conversion
    };

    return (
        <StepWrapper className="space-y-6 md:space-y-10">
            <div className="text-center space-y-2">
                <div className="inline-block bg-brand-accent/20 border border-brand-accent/30 px-3 py-1 rounded-full mb-1">
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-brand-accent">Phase 2: Gap Analysis</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black leading-tight" style={{ color: 'var(--text-auth-primary)' }}>Let's map your <span className="text-brand-accent text-italic">existing</span> safety net</h2>
                <p className="text-xs md:text-sm max-w-md mx-auto" style={{ color: 'var(--text-auth-muted)' }}>
                    We'll identify gaps without duplicating what you already have.
                </p>
            </div>

            <div className="space-y-6 md:space-y-12">
                {/* Life Insurance Section */}
                <div className="space-y-4 md:space-y-6">
                    <div className="flex items-center gap-2 md:gap-3 pb-1 md:pb-2 border-b" style={{ borderBottomColor: 'var(--border-auth-card)' }}>
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                            <Heart className="w-3.5 h-3.5 md:w-4 md:h-4 text-pink-400" />
                        </div>
                        <h3 className="text-base md:text-lg font-bold uppercase tracking-tight" style={{ color: 'var(--text-auth-primary)' }}>Life Insurance</h3>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                        <label className="text-xs font-semibold ml-1" style={{ color: 'var(--text-auth-label)' }}>Do you have existing Life Insurance?</label>
                        <div className="grid grid-cols-2 gap-2 md:gap-3">
                            {[true, false].map(val => (
                                <button
                                    key={val ? 'yes' : 'no'}
                                    onClick={() => {
                                        updateField('has_life_insurance', val);
                                        if (!val) {
                                            updateField('existing_life_cover', "");
                                            updateField('existing_life_cover_val', 0);
                                            updateField('life_provider', "");
                                            updateField('life_policy_name', "");
                                            updateField('life_provider_custom', "");
                                            updateField('life_policy_name_custom', "");
                                        }
                                    }}
                                    className={`py-3 md:py-4 rounded-xl md:rounded-2xl border transition-all duration-200 font-bold text-sm ${formData.has_life_insurance === val
                                        ? 'bg-pink-500/20 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                                        : 'hover:bg-opacity-10'
                                        }`}
                                    style={formData.has_life_insurance !== val ? {
                                        backgroundColor: 'var(--bg-auth-input)',
                                        borderColor: 'var(--border-auth-card)',
                                        color: 'var(--text-auth-placeholder)'
                                    } : {
                                        color: 'var(--text-auth-primary)'
                                    }}
                                >
                                    {val ? 'Yes' : 'No'}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence>
                            {formData.has_life_insurance && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-3 md:space-y-4 pt-1 overflow-hidden"
                                >
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] md:text-xs font-bold uppercase" style={{ color: 'var(--text-auth-placeholder)' }}>Coverage Amount</span>
                                        <div className="flex flex-col items-end">
                                            <span className="text-lg md:text-xl font-black" style={{ color: formData.existing_life_cover_val > 0 ? 'var(--text-auth-primary)' : '#ef4444' }}>
                                                {formatCurrency((formData.existing_life_cover_val || 0) / 100000)}
                                            </span>
                                            {formData.existing_life_cover_val === 0 && (
                                                <span className="text-[9px] font-bold text-red-500 uppercase tracking-tighter">Please select an amount</span>
                                            )}
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="500"
                                        step="5"
                                        value={(formData.existing_life_cover_val || 0) / 100000}
                                        onChange={(e) => {
                                            const sliderVal = parseInt(e.target.value);
                                            const absoluteVal = sliderVal * 100000;
                                            updateField('existing_life_cover_val', absoluteVal);
                                            updateField('existing_life_cover', formatCurrency(sliderVal));
                                        }}
                                        className="w-full accent-pink-500 h-2 rounded-lg cursor-pointer slider-custom"
                                        style={{
                                            background: 'linear-gradient(to right, #94a3b8 0%, #94a3b8 100%)',
                                            WebkitAppearance: 'none',
                                            appearance: 'none'
                                        }}
                                    />
                                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-tighter" style={{ color: 'var(--text-auth-placeholder)' }}>
                                        <span>0</span>
                                        <span>1 Cr</span>
                                        <span>2 Cr</span>
                                        <span>3 Cr</span>
                                        <span>4 Cr</span>
                                        <span>5 Cr</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Health Insurance Section */}
                <div className="space-y-4 md:space-y-6">
                    <div className="flex items-center gap-2 md:gap-3 pb-1 md:pb-2 border-b" style={{ borderBottomColor: 'var(--border-auth-card)' }}>
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400" />
                        </div>
                        <h3 className="text-base md:text-lg font-bold uppercase tracking-tight" style={{ color: 'var(--text-auth-primary)' }}>Health Insurance</h3>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                        <label className="text-xs font-semibold ml-1" style={{ color: 'var(--text-auth-label)' }}>Do you have existing health insurance?</label>
                        <div className="grid grid-cols-2 gap-2 md:gap-3">
                            {[true, false].map(val => (
                                <button
                                    key={val ? 'yes' : 'no'}
                                    onClick={() => {
                                        updateField('has_health_insurance', val);
                                        if (!val) {
                                            updateField('existing_health_cover', "");
                                            updateField('existing_health_cover_val', 0);
                                            updateField('health_source', "");
                                            updateField('parents_covered', false);
                                            updateField('health_provider', "");
                                            updateField('health_policy_name', "");
                                            updateField('health_provider_custom', "");
                                            updateField('health_policy_name_custom', "");
                                        }
                                    }}
                                    className={`py-3 md:py-4 rounded-xl md:rounded-2xl border transition-all duration-200 font-bold text-sm ${formData.has_health_insurance === val
                                        ? 'bg-blue-500/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                                        : 'hover:bg-opacity-10'
                                        }`}
                                    style={formData.has_health_insurance !== val ? {
                                        backgroundColor: 'var(--bg-auth-input)',
                                        borderColor: 'var(--border-auth-card)',
                                        color: 'var(--text-auth-placeholder)'
                                    } : {
                                        color: 'var(--text-auth-primary)'
                                    }}
                                >
                                    {val ? 'Yes' : 'No'}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence>
                            {formData.has_health_insurance && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4 md:space-y-6 pt-1 overflow-hidden"
                                >
                                    {/* Source */}
                                    <div className="space-y-2 md:space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-auth-placeholder)' }}>
                                            <Briefcase className="w-2.5 h-2.5" /> Source
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['Employer', 'Personal', 'Both'].map(src => (
                                                <button
                                                    key={src}
                                                    onClick={() => updateField('health_source', src)}
                                                    className={`py-2 rounded-xl border text-[9px] md:text-[11px] font-black uppercase tracking-tighter transition-all ${formData.health_source === src
                                                        ? 'bg-blue-500/20 border-blue-500'
                                                        : 'hover:bg-opacity-10'
                                                        }`}
                                                    style={formData.health_source !== src ? {
                                                        backgroundColor: 'var(--bg-auth-input)',
                                                        borderColor: 'var(--border-auth-card)',
                                                        color: 'var(--text-auth-placeholder)'
                                                    } : {
                                                        color: 'var(--text-auth-primary)'
                                                    }}
                                                >
                                                    {src}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Health Cover Amount */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-auth-placeholder)' }}>
                                                <Shield className="w-3 h-3" /> Cover Amount
                                            </span>
                                            <div className="flex flex-col items-end">
                                                <span className="text-xl font-black" style={{ color: formData.existing_health_cover_val > 0 ? 'var(--text-auth-primary)' : '#ef4444' }}>
                                                    {formatCurrency((formData.existing_health_cover_val || 0) / 100000)}
                                                </span>
                                                {formData.existing_health_cover_val === 0 && (
                                                    <span className="text-[9px] font-bold text-red-500 uppercase tracking-tighter">Please select an amount</span>
                                                )}
                                            </div>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="200"
                                            step="1"
                                            value={(formData.existing_health_cover_val || 0) / 100000}
                                            onChange={(e) => {
                                                const sliderVal = parseInt(e.target.value);
                                                const absoluteVal = sliderVal * 100000;
                                                updateField('existing_health_cover_val', absoluteVal);
                                                updateField('existing_health_cover', formatCurrency(sliderVal));
                                            }}
                                            className="w-full accent-blue-500 h-2 rounded-lg cursor-pointer slider-custom"
                                            style={{
                                                background: 'linear-gradient(to right, #94a3b8 0%, #94a3b8 100%)',
                                                WebkitAppearance: 'none',
                                                appearance: 'none'
                                            }}
                                        />
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter" style={{ color: 'var(--text-auth-placeholder)' }}>
                                            <span>0</span>
                                            <span>50 L</span>
                                            <span>1 Cr</span>
                                            <span>1.5 Cr</span>
                                            <span>2 Cr</span>
                                        </div>
                                    </div>

                                    {/* Parents Coverage */}
                                    <div className="space-y-4">
                                        <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-auth-placeholder)' }}>
                                            <Users className="w-3 h-3" /> Have you taken health insurance for your parents?
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[true, false].map(val => (
                                                <button
                                                    key={val ? 'yes-parents' : 'no-parents'}
                                                    onClick={() => {
                                                        updateField('parents_covered', val);
                                                        if (!val) {
                                                            updateField('parents_health_cover', "");
                                                            updateField('parents_health_cover_val', 0);
                                                        }
                                                    }}
                                                    className={`py-3 rounded-xl border font-bold transition-all ${formData.parents_covered === val
                                                        ? 'bg-emerald-500/20 border-emerald-500'
                                                        : 'hover:bg-opacity-10'
                                                        }`}
                                                    style={formData.parents_covered !== val ? {
                                                        backgroundColor: 'var(--bg-auth-input)',
                                                        borderColor: 'var(--border-auth-card)',
                                                        color: 'var(--text-auth-placeholder)'
                                                    } : {
                                                        color: 'var(--text-auth-primary)'
                                                    }}
                                                >
                                                    {val ? 'Yes' : 'No'}
                                                </button>
                                            ))}
                                        </div>

                                        <AnimatePresence>
                                            {formData.parents_covered && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="space-y-4 pt-2 overflow-hidden"
                                                >
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-auth-placeholder)' }}>Parents' Cover Amount</span>
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-xl font-black" style={{ color: formData.parents_health_cover_val > 0 ? 'var(--text-auth-primary)' : '#ef4444' }}>
                                                                {formatCurrency((formData.parents_health_cover_val || 0) / 100000)}
                                                            </span>
                                                            {formData.parents_health_cover_val === 0 && (
                                                                <span className="text-[9px] font-bold text-red-500 uppercase tracking-tighter">Please select an amount</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="200"
                                                        step="1"
                                                        value={(formData.parents_health_cover_val || 0) / 100000}
                                                        onChange={(e) => {
                                                            const sliderVal = parseInt(e.target.value);
                                                            const absoluteVal = sliderVal * 100000;
                                                            updateField('parents_health_cover_val', absoluteVal);
                                                            updateField('parents_health_cover', formatCurrency(sliderVal));
                                                        }}
                                                        className="w-full accent-emerald-500 h-2 rounded-lg cursor-pointer slider-custom"
                                                        style={{
                                                            background: 'linear-gradient(to right, #94a3b8 0%, #94a3b8 100%)',
                                                            WebkitAppearance: 'none',
                                                            appearance: 'none'
                                                        }}
                                                    />
                                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter" style={{ color: 'var(--text-auth-placeholder)' }}>
                                                        <span>0</span>
                                                        <span>50 L</span>
                                                        <span>1 Cr</span>
                                                        <span>1.5 Cr</span>
                                                        <span>2 Cr</span>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

        </StepWrapper>
    );
}
