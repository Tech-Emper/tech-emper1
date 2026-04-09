import { useState, useEffect } from 'react';
import StepWrapper from './StepWrapper';
import { Activity, Cigarette, Stethoscope, Shield, Dumbbell, Coffee } from 'lucide-react';

export default function Step05_HealthSnapshot({ formData, updateField }) {
    const [otherCondition, setOtherCondition] = useState("");

    // Initialize custom condition text if it exists but isn't one of the static ones
    useEffect(() => {
        const history = formData.family_health_history || [];
        const staticConditions = ['None', 'Diabetes', 'Blood Pressure', 'Heart Condition', 'Cancer', 'Other'];

        // Find if they have any saved condition that isn't in our static list and doesn't exactly equal "None"
        const customMatch = history.find(c => !staticConditions.includes(c));
        if (customMatch && history.includes('Other')) {
            setOtherCondition(customMatch);
        }
    }, []);

    const tobaccoOptions = [
        { label: 'No', value: 'No' },
        { label: 'Occasionally', value: 'Occasionally' },
        { label: 'Regularly', value: 'Regularly' }
    ];

    const healthConditions = [
        'None',
        'Diabetes',
        'Blood Pressure',
        'Heart Condition',
        'Cancer',
        'Other'
    ];

    const lifestyles = [
        { label: 'Active', sub: '4+ days/week', value: 'Active', Icon: Dumbbell },
        { label: 'Moderate', sub: '1–3 days/week', value: 'Moderate', Icon: Activity },
        { label: 'Sedentary', sub: 'Mostly desk job', value: 'Sedentary', Icon: Coffee }
    ];

    const staticConditions = ['None', 'Diabetes', 'Blood Pressure', 'Heart Condition', 'Cancer', 'Other'];

    const toggleCondition = (condition) => {
        let current = formData.family_health_history || [];

        if (condition === 'None') {
            updateField('family_health_history', ['None']);
            return;
        }

        // Strip "None" if selecting something else
        let next = current.filter(c => c !== 'None');

        if (next.includes(condition)) {
            next = next.filter(c => c !== condition);
            // If we are unselecting Other, remove their custom text from the array
            if (condition === 'Other') {
                next = next.filter(c => staticConditions.includes(c));
            }
        } else {
            next = [...next, condition];
        }

        if (next.length === 0) next = ['None'];
        updateField('family_health_history', next);
    };

    const handleOtherTextChange = (text) => {
        setOtherCondition(text);
        let current = formData.family_health_history || [];
        // Keep everything that is a static condition
        let updated = current.filter(c => staticConditions.includes(c));
        // Push the custom text at the end if there's text
        if (text.trim() !== '') {
            updated.push(text.trim());
        }
        updateField('family_health_history', updated);
    };

    return (
        <StepWrapper className="space-y-6 md:space-y-8">
            <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text-auth-primary)' }}>A quick peek into your health & lifestyle</h2>
                <p className="text-sm md:text-base" style={{ color: 'var(--text-auth-muted)' }}>A few quick questions to understand your health priorities</p>
            </div>

            <div className="space-y-4 md:space-y-6">
                {/* Tobacco */}
                <div className="space-y-2 md:space-y-3">
                    <label className="block text-xs font-semibold ml-1 flex items-center gap-2 tracking-wider" style={{ color: 'var(--text-auth-label)' }}>
                        <Cigarette className="w-4 h-4 text-orange-400" /> Tobacco Usage
                    </label>
                    <div className="grid grid-cols-3 gap-2 md:gap-3">
                        {tobaccoOptions.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => updateField('smoking_status', opt.value)}
                                className={`p-2.5 md:p-4 rounded-xl border transition-all duration-200 ${formData.smoking_status === opt.value
                                    ? 'bg-brand-accent/20 border-brand-accent shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                                    : 'hover:bg-opacity-10'
                                    }`}
                                style={formData.smoking_status !== opt.value ? {
                                    backgroundColor: 'var(--bg-auth-input)',
                                    borderColor: 'var(--border-auth-card)',
                                    color: 'var(--text-auth-muted)'
                                } : {
                                    color: 'var(--text-auth-primary)'
                                }}
                            >
                                <span className="text-xs md:text-sm font-bold">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Existing Conditions */}
                <div className="space-y-2 md:space-y-3">
                    <label className="block text-xs font-semibold ml-1 flex items-center gap-2 tracking-wider" style={{ color: 'var(--text-auth-label)' }}>
                        <Stethoscope className="w-4 h-4 text-blue-400" /> Existing Conditions
                    </label>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                        {healthConditions.map(condition => {
                            const isSelected = (formData.family_health_history || []).includes(condition);
                            return (
                                <button
                                    key={condition}
                                    onClick={() => toggleCondition(condition)}
                                    className={`p-3 md:p-4 rounded-xl border text-center transition-all duration-200 ${isSelected
                                        ? 'bg-blue-500/20 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.15)]'
                                        : 'hover:bg-opacity-10'
                                        }`}
                                    style={isSelected ? {
                                        color: 'var(--text-auth-primary)'
                                    } : {
                                        backgroundColor: 'var(--bg-auth-input)',
                                        borderColor: 'var(--border-auth-card)',
                                        color: 'var(--text-auth-muted)'
                                    }}
                                >
                                    <span className="text-xs font-bold">{condition}</span>
                                </button>
                            );
                        })}
                    </div>
                    {/* Other Custom Input Field */}
                    {(formData.family_health_history || []).includes('Other') && (
                        <div className="mt-2 animate-in fade-in slide-in-from-top-2">
                            <input
                                type="text"
                                placeholder="Please specify your condition..."
                                value={otherCondition}
                                onChange={(e) => handleOtherTextChange(e.target.value)}
                                className="w-full p-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-medium"
                                style={{
                                    backgroundColor: 'var(--bg-auth-input)',
                                    borderColor: 'var(--border-auth-card)',
                                    color: 'var(--text-auth-primary)'
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Lifestyle */}
                <div className="space-y-2 md:space-y-3">
                    <label className="block text-xs font-semibold ml-1 flex items-center gap-2 tracking-wider" style={{ color: 'var(--text-auth-label)' }}>
                        <Shield className="w-4 h-4 text-brand-accent" /> Lifestyle
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
                        {lifestyles.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => updateField('lifestyle', opt.value)}
                                className={`flex flex-col items-start p-3 md:p-4 rounded-xl border transition-all duration-200 ${formData.lifestyle === opt.value
                                    ? 'bg-brand-accent/20 border-brand-accent shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                                    : 'hover:bg-opacity-10'
                                    }`}
                                style={formData.lifestyle !== opt.value ? {
                                    backgroundColor: 'var(--bg-auth-input)',
                                    borderColor: 'var(--border-auth-card)',
                                    color: 'var(--text-auth-muted)'
                                } : {
                                    color: 'var(--text-auth-primary)'
                                }}
                            >
                                <div className="text-sm font-bold mb-1 flex justify-between w-full">
                                    <span>{opt.label}</span>
                                    <opt.Icon className={`w-4 h-4 ${formData.lifestyle === opt.value ? 'text-brand-accent' : 'opacity-40'}`} />
                                </div>
                                <div className="text-[10px] uppercase font-black tracking-widest" style={{ color: 'var(--text-auth-placeholder)' }}>
                                    {opt.sub}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}
