import StepWrapper from './StepWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Heart, ChevronDown } from 'lucide-react';

const PROVIDERS = {
    life: [
        "LIC",
        "HDFC Life",
        "SBI Life",
        "ICICI Prudential",
        "Max Life"
    ],
    health: [
        "Star Health",
        "HDFC Ergo",
        "Niva Bupa",
        "Care Health",
        "ICICI Lombard"
    ]
};

const POLICIES = {
    "LIC": ["Jeevan Anand", "Jeevan Umang", "Jeevan Lakshya", "Jeevan Labh", "Bima Jyoti", "New Endowment", "Tech Term", "Jeevan Akshay", "Saral Pension", "Jeevan Shanti"],
    "HDFC Life": ["Click 2 Protect", "Sanchay Plus", "Sanchay Par Advantage", "Life Long Advantage", "Sampoorna Samridhi", "Pension Guaranteed Plan", "Simple Home Insurance", "Group Term Insurance", "Smart Woman Plan", "Click 2 Invest"],
    "SBI Life": ["eShield Next", "Smart Shield", "Smart Platina", "Smart Future Choice", "Smart Samriddhi", "Saral Insure", "Retire Smart", "Shubh Nivesh", "Smart Privilige", "Smart Women Advantage"],
    "ICICI Prudential": ["iProtect Smart", "iCare II", "GIFT Pro", "Savings Suraksha", "Guaranteed Income Plan", "Loan Protect", "Precious Life", "Cash Advantage", "Elite Wealth", "Signature"],
    "Max Life": ["Smart Secure Plus", "Smart Wealth Plan", "Savings Advantage", "Guaranteed Benefit Plan", "Smart Term Plan", "Smart Fixed-return Plan", "Smart Wealth Advantage", "Insta-Confirm", "Critical Illness", "Accidental Death"],
    "Star Health": ["Family Health Optima", "Star Comprehensive", "Senior Citizens Red Carpet", "Star Micro Rural", "Medi Classic", "Star Health Gain", "Star Cardiac Care", "Star Cancer Care", "Star Diabetes Safe", "Star Outpatient Care"],
    "HDFC Ergo": ["Optima Restore", "my:health Suraksha", "Energy", "Critical Illness", "Stay Active", "Selfie", "Health Wallet", "Health Medisure", "Health Suraksha Plus", "Global Health Care"],
    "Niva Bupa": ["ReAssure", "Health Companion", "Health Premia", "GoActive", "Heartbeat", "Health Assurance", "MoneySaver", "Criticare", "AccidentCare", "Travel Assure"],
    "Care Health": ["Care Classic", "Care Supreme", "Care Advantage", "Care Freedom", "Care Heart", "Care Senior", "Care Plus", "Care Secure", "Care Explore", "Care Joy"],
    "ICICI Lombard": ["Health Elite", "Health Shield", "Health Booster", "Personal Protect", "Critical Care", "iHealth", "BeFit", "Health Plus", "Wellness Solution", "Complete Health Insurance"]
};

export default function Step07_ExistingPolicyDetails({ formData, updateField }) {

    const handleLifeProviderChange = (e) => {
        const val = e.target.value;
        updateField('life_provider', val);
        if (val === 'Other') {
            updateField('life_policy_name', 'Other');
        } else {
            updateField('life_policy_name', '');
        }
    };

    const handleHealthProviderChange = (e) => {
        const val = e.target.value;
        updateField('health_provider', val);
        if (val === 'Other') {
            updateField('health_policy_name', 'Other');
        } else {
            updateField('health_policy_name', '');
        }
    };

    return (
        <StepWrapper className="space-y-6 md:space-y-10">
            <div className="text-center space-y-2">

                <h2 className="text-2xl md:text-3xl font-black leading-tight" style={{ color: 'var(--text-auth-primary)' }}>Share your <span className="text-brand-accent text-italic">policy</span> details</h2>
                <p className="text-xs md:text-sm max-w-md mx-auto" style={{ color: 'var(--text-auth-muted)' }}>
                    Knowing your provider and policy helps us analyze benefits more accurately.
                </p>
            </div>

            <div className="space-y-12">
                {/* Life Insurance Details */}
                <AnimatePresence>
                    {formData.has_life_insurance && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-3 pb-2 border-b" style={{ borderBottomColor: 'var(--border-auth-card)' }}>
                                <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                                    <Heart className="w-4 h-4 text-pink-400" />
                                </div>
                                <h3 className="text-lg font-bold uppercase tracking-tight" style={{ color: 'var(--text-auth-primary)' }}>Life Insurance Details</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-auth-placeholder)' }}>Insurance Provider</label>
                                    <div className="relative">
                                        <select
                                            value={formData.life_provider || ""}
                                            onChange={handleLifeProviderChange}
                                            className={`w-full border rounded-xl px-4 py-3 appearance-none focus:outline-none transition-colors ${formData.has_life_insurance && !formData.life_provider ? 'border-red-500' : 'focus:border-brand-accent'
                                                }`}
                                            style={{
                                                backgroundColor: 'var(--bg-auth-input)',
                                                borderColor: formData.has_life_insurance && !formData.life_provider ? '#ef4444' : 'var(--border-auth-card)',
                                                color: 'var(--text-auth-primary)'
                                            }}
                                        >
                                            <option value="" style={{ backgroundColor: 'var(--bg-auth-main)' }}>Select Provider</option>
                                            {PROVIDERS.life.map(p => <option key={p} value={p} style={{ backgroundColor: 'var(--bg-auth-main)' }}>{p}</option>)}
                                            <option value="Other" style={{ backgroundColor: 'var(--bg-auth-main)' }}>Other</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-auth-placeholder)' }} />
                                    </div>
                                    {formData.life_provider === 'Other' && (
                                        <div className="space-y-1">
                                            <input
                                                type="text"
                                                placeholder="Type Provider Name"
                                                value={formData.life_provider_custom || ""}
                                                onChange={(e) => updateField('life_provider_custom', e.target.value)}
                                                className={`w-full border rounded-xl px-4 py-3 focus:outline-none transition-colors mt-2 ${!formData.life_provider_custom?.trim() ? 'border-red-500' : 'focus:border-brand-accent'
                                                    }`}
                                                style={{
                                                    backgroundColor: 'var(--bg-auth-input)',
                                                    borderColor: !formData.life_provider_custom?.trim() ? '#ef4444' : 'var(--border-auth-card)',
                                                    color: 'var(--text-auth-primary)'
                                                }}
                                            />
                                            {!formData.life_provider_custom?.trim() && <p className="text-[10px] text-red-500 font-bold uppercase px-1">Provider name is required</p>}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-auth-placeholder)' }}>Policy Name</label>
                                    <div className="relative">
                                        <select
                                            value={formData.life_policy_name || ""}
                                            onChange={(e) => updateField('life_policy_name', e.target.value)}
                                            disabled={formData.life_provider === 'Other'}
                                            className={`w-full border rounded-xl px-4 py-3 appearance-none focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${formData.has_life_insurance && formData.life_provider && !formData.life_policy_name ? 'border-red-500' : 'focus:border-brand-accent'
                                                }`}
                                            style={{
                                                backgroundColor: 'var(--bg-auth-input)',
                                                borderColor: (formData.has_life_insurance && formData.life_provider && !formData.life_policy_name) ? '#ef4444' : 'var(--border-auth-card)',
                                                color: 'var(--text-auth-primary)'
                                            }}
                                        >
                                            <option value="" style={{ backgroundColor: 'var(--bg-auth-main)' }}>Select Policy</option>
                                            {formData.life_provider && formData.life_provider !== 'Other' && POLICIES[formData.life_provider]?.map(p => (
                                                <option key={p} value={p} style={{ backgroundColor: 'var(--bg-auth-main)' }}>{p}</option>
                                            ))}
                                            <option value="Other" style={{ backgroundColor: 'var(--bg-auth-main)' }}>Other</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-auth-placeholder)' }} />
                                    </div>
                                    {formData.life_policy_name === 'Other' && (
                                        <div className="space-y-1">
                                            <input
                                                type="text"
                                                placeholder="Type Policy Name"
                                                value={formData.life_policy_name_custom || ""}
                                                onChange={(e) => updateField('life_policy_name_custom', e.target.value)}
                                                className={`w-full border rounded-xl px-4 py-3 focus:outline-none transition-colors mt-2 ${!formData.life_policy_name_custom?.trim() ? 'border-red-500' : 'focus:border-brand-accent'
                                                    }`}
                                                style={{
                                                    backgroundColor: 'var(--bg-auth-input)',
                                                    borderColor: !formData.life_policy_name_custom?.trim() ? '#ef4444' : 'var(--border-auth-card)',
                                                    color: 'var(--text-auth-primary)'
                                                }}
                                            />
                                            {!formData.life_policy_name_custom?.trim() && <p className="text-[10px] text-red-500 font-bold uppercase px-1">Policy name is required</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Health Insurance Details */}
                <AnimatePresence>
                    {formData.has_health_insurance && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-3 pb-2 border-b" style={{ borderBottomColor: 'var(--border-auth-card)' }}>
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-blue-400" />
                                </div>
                                <h3 className="text-lg font-bold uppercase tracking-tight" style={{ color: 'var(--text-auth-primary)' }}>Health Insurance Details</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-auth-placeholder)' }}>Insurance Provider</label>
                                    <div className="relative">
                                        <select
                                            value={formData.health_provider || ""}
                                            onChange={handleHealthProviderChange}
                                            className={`w-full border rounded-xl px-4 py-3 appearance-none focus:outline-none transition-colors ${formData.has_health_insurance && !formData.health_provider ? 'border-red-500' : 'focus:border-brand-accent'
                                                }`}
                                            style={{
                                                backgroundColor: 'var(--bg-auth-input)',
                                                borderColor: formData.has_health_insurance && !formData.health_provider ? '#ef4444' : 'var(--border-auth-card)',
                                                color: 'var(--text-auth-primary)'
                                            }}
                                        >
                                            <option value="" style={{ backgroundColor: 'var(--bg-auth-main)' }}>Select Provider</option>
                                            {PROVIDERS.health.map(p => <option key={p} value={p} style={{ backgroundColor: 'var(--bg-auth-main)' }}>{p}</option>)}
                                            <option value="Other" style={{ backgroundColor: 'var(--bg-auth-main)' }}>Other</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-auth-placeholder)' }} />
                                    </div>
                                    {formData.health_provider === 'Other' && (
                                        <div className="space-y-1">
                                            <input
                                                type="text"
                                                placeholder="Type Provider Name"
                                                value={formData.health_provider_custom || ""}
                                                onChange={(e) => updateField('health_provider_custom', e.target.value)}
                                                className={`w-full border rounded-xl px-4 py-3 focus:outline-none transition-colors mt-2 ${!formData.health_provider_custom?.trim() ? 'border-red-500' : 'focus:border-brand-accent'
                                                    }`}
                                                style={{
                                                    backgroundColor: 'var(--bg-auth-input)',
                                                    borderColor: !formData.health_provider_custom?.trim() ? '#ef4444' : 'var(--border-auth-card)',
                                                    color: 'var(--text-auth-primary)'
                                                }}
                                            />
                                            {!formData.health_provider_custom?.trim() && <p className="text-[10px] text-red-500 font-bold uppercase px-1">Provider name is required</p>}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-auth-placeholder)' }}>Policy Name</label>
                                    <div className="relative">
                                        <select
                                            value={formData.health_policy_name || ""}
                                            onChange={(e) => updateField('health_policy_name', e.target.value)}
                                            disabled={formData.health_provider === 'Other'}
                                            className={`w-full border rounded-xl px-4 py-3 appearance-none focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${formData.has_health_insurance && formData.health_provider && !formData.health_policy_name ? 'border-red-500' : 'focus:border-brand-accent'
                                                }`}
                                            style={{
                                                backgroundColor: 'var(--bg-auth-input)',
                                                borderColor: (formData.has_health_insurance && formData.health_provider && !formData.health_policy_name) ? '#ef4444' : 'var(--border-auth-card)',
                                                color: 'var(--text-auth-primary)'
                                            }}
                                        >
                                            <option value="" style={{ backgroundColor: 'var(--bg-auth-main)' }}>Select Policy</option>
                                            {formData.health_provider && formData.health_provider !== 'Other' && POLICIES[formData.health_provider]?.map(p => (
                                                <option key={p} value={p} style={{ backgroundColor: 'var(--bg-auth-main)' }}>{p}</option>
                                            ))}
                                            <option value="Other" style={{ backgroundColor: 'var(--bg-auth-main)' }}>Other</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-auth-placeholder)' }} />
                                    </div>
                                    {formData.health_policy_name === 'Other' && (
                                        <div className="space-y-1">
                                            <input
                                                type="text"
                                                placeholder="Type Policy Name"
                                                value={formData.health_policy_name_custom || ""}
                                                onChange={(e) => updateField('health_policy_name_custom', e.target.value)}
                                                className={`w-full border rounded-xl px-4 py-3 focus:outline-none transition-colors mt-2 ${!formData.health_policy_name_custom?.trim() ? 'border-red-500' : 'focus:border-brand-accent'
                                                    }`}
                                                style={{
                                                    backgroundColor: 'var(--bg-auth-input)',
                                                    borderColor: !formData.health_policy_name_custom?.trim() ? '#ef4444' : 'var(--border-auth-card)',
                                                    color: 'var(--text-auth-primary)'
                                                }}
                                            />
                                            {!formData.health_policy_name_custom?.trim() && <p className="text-[10px] text-red-500 font-bold uppercase px-1">Policy name is required</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!formData.has_life_insurance && !formData.has_health_insurance && (
                    <div className="text-center py-10 rounded-2xl border border-dashed" style={{
                        backgroundColor: 'var(--bg-auth-input)',
                        borderColor: 'var(--border-auth-card)'
                    }}>
                        <p style={{ color: 'var(--text-auth-placeholder)' }}>No existing insurance declared.</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-auth-placeholder)' }}>You can go back to declare insurance or proceed to complete.</p>
                    </div>
                )}
            </div>


        </StepWrapper>
    );
}
