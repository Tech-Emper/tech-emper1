import { useEffect } from 'react';
import StepWrapper from './StepWrapper';
import { IndianRupee, Briefcase, Building2 } from 'lucide-react';

export default function Step04_FinancialReality({ formData, updateField }) {
    const incomeBrackets = [
        { range: 'Under ₹5L', tier: 'Essential' },
        { range: '₹6–10L', tier: 'Standard' },
        { range: '₹11–20L', tier: 'Enhanced' },
        { range: '₹21–40L', tier: 'Premium' },
        { range: '₹40L+', tier: 'Comprehensive' }
    ];

    // Automatically calculate Career Stage on mount if missing
    useEffect(() => {
        if (!formData.career_stage && formData.insured_members?.self?.age) {
            const age = parseInt(formData.insured_members.self.age, 10);
            let autoStage = "Launch Pad";
            if (age >= 25 && age <= 32) autoStage = "Growth Gear";
            else if (age >= 33 && age <= 39) autoStage = "Peak Performer";
            else if (age >= 40) autoStage = "Legacy Builder";

            updateField('career_stage', autoStage);
        }
    }, [formData.insured_members, formData.career_stage, updateField]);

    return (
        <StepWrapper className="space-y-6 md:space-y-8">
            <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text-auth-primary)' }}>
                    {formData.first_name || 'Hey'}, you are <span className="text-brand-accent">{formData.career_stage || 'Launch Pad'}</span>
                </h2>
                <p className="text-sm md:text-base" style={{ color: 'var(--text-auth-muted)' }}>
                    Your work fuels more than just your career
                </p>
            </div>

            <div className="space-y-6">
                {/* Company Name */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold ml-1 flex items-center gap-2" style={{ color: 'var(--text-auth-label)' }}>
                        <Building2 className="w-4 h-4 text-brand-accent" /> Company Name
                    </label>
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="e.g. Google, TCS, HDFC Bank"
                            value={formData.company_name || ""}
                            onChange={(e) => updateField('company_name', e.target.value)}
                            className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-brand-accent outline-none transition-all font-medium"
                            style={{
                                backgroundColor: 'var(--bg-auth-input)',
                                borderColor: 'var(--border-auth-card)',
                                color: 'var(--text-auth-primary)'
                            }}
                        />
                    </div>
                </div>

                {/* Designation */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold ml-1 flex items-center gap-2" style={{ color: 'var(--text-auth-label)' }}>
                        <Briefcase className="w-4 h-4 text-blue-400" /> Designation
                    </label>
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="e.g. Software Engineer, Manager, Director"
                            value={formData.employment_type || ""}
                            onChange={(e) => updateField('employment_type', e.target.value)}
                            className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-brand-accent outline-none transition-all font-medium"
                            style={{
                                backgroundColor: 'var(--bg-auth-input)',
                                borderColor: 'var(--border-auth-card)',
                                color: 'var(--text-auth-primary)'
                            }}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="block text-sm font-semibold ml-1 flex items-center gap-2" style={{ color: 'var(--text-auth-label)' }}>
                        <IndianRupee className="w-4 h-4 text-emerald-400" /> Annual Income
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                        {incomeBrackets.map((bracket, index) => {
                            const value = `${bracket.range} - ${bracket.tier}`;
                            return (
                                <button
                                    key={value}
                                    onClick={() => updateField('income_level', value)}
                                    className={`p-3 md:p-4 rounded-xl border text-left transition-all duration-200 group ${formData.income_level === value
                                            ? 'bg-brand-accent/20 border-brand-accent'
                                            : 'hover:bg-opacity-10'
                                        } ${index === incomeBrackets.length - 1 ? 'sm:col-span-2' : ''}`}
                                    style={formData.income_level !== value ? {
                                        backgroundColor: 'var(--bg-auth-input)',
                                        borderColor: 'var(--border-auth-card)',
                                        color: 'var(--text-auth-muted)'
                                    } : {
                                        color: 'var(--text-auth-primary)'
                                    }}
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold">{bracket.range}</span>
                                        <span className={`text-[10px] uppercase tracking-widest font-black transition-colors ${formData.income_level === value
                                                ? 'text-brand-accent'
                                                : ''
                                            }`} style={formData.income_level !== value ? {
                                                color: 'var(--text-auth-placeholder)'
                                            } : {}}>
                                            {bracket.tier} Tier
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}
