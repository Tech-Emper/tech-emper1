import StepWrapper from './StepWrapper';
import { Calendar, Heart, Baby } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Step02_LifeStage({ formData, updateField }) {
    const [age, setAge] = useState(null);

    useEffect(() => {
        if (formData.dob) {
            const birthDate = new Date(formData.dob);
            const today = new Date();
            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                calculatedAge--;
            }
            setAge(calculatedAge);
        }
    }, [formData.dob]);

    const handleMaritalStatus = (status) => {
        updateField('marital_status', status);
        if (status === 'Single') {
            updateField('num_children', 0);
        }
    };

    return (
        <StepWrapper className="space-y-6 md:space-y-8">
            <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text-auth-primary)' }}>
                    Who shares your journey, <span className="text-brand-accent">{formData.first_name || 'Friend'}</span>?
                </h2>
                <p className="text-sm md:text-base" style={{ color: 'var(--text-auth-muted)' }}>Protecting your loved ones starts with understanding who they are.</p>
            </div>

            <div className="space-y-6">
                {/* Marital Status */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold ml-1 flex items-center gap-2" style={{ color: 'var(--text-auth-label)' }}>
                        <Heart className="w-4 h-4 text-pink-400" /> Marital Status
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {['Single', 'Married', 'Other'].map(status => (
                            <button
                                key={status}
                                onClick={() => handleMaritalStatus(status)}
                                className={`p-2.5 md:p-4 rounded-xl border transition-all duration-200 ${formData.marital_status === status
                                        ? 'bg-brand-accent/20 border-brand-accent'
                                        : 'hover:bg-opacity-10'
                                    }`}
                                style={formData.marital_status === status ? {
                                    color: 'var(--text-auth-primary)'
                                } : {
                                    backgroundColor: 'var(--bg-auth-input)',
                                    borderColor: 'var(--border-auth-card)',
                                    color: 'var(--text-auth-muted)'
                                }}
                            >
                                <span className="text-sm font-bold">{status}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Children Selector */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold ml-1 flex items-center gap-2" style={{ color: 'var(--text-auth-label)' }}>
                        <Baby className="w-4 h-4 text-blue-400" /> Number of Children
                    </label>
                    <select
                        value={formData.num_children || 0}
                        onChange={(e) => updateField('num_children', parseInt(e.target.value))}
                        className="w-full p-4 border rounded-xl outline-none appearance-none"
                        style={{
                            backgroundColor: 'var(--bg-auth-input)',
                            borderColor: 'var(--border-auth-card)',
                            color: 'var(--text-auth-primary)'
                        }}
                    >
                        {[0, 1, 2, '3+'].map(num => (
                            <option key={num} value={typeof num === 'string' ? 3 : num} style={{ backgroundColor: 'var(--bg-auth-main)' }}>{num}</option>
                        ))}
                    </select>
                </div>

                {/* Date of Birth */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold ml-1 flex items-center gap-2" style={{ color: 'var(--text-auth-label)' }}>
                        <Calendar className="w-4 h-4 text-orange-400" /> Date of Birth
                    </label>
                    <input
                        type="date"
                        value={formData.dob || ""}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => updateField('dob', e.target.value)}
                        className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-brand-accent outline-none transition-all"
                        style={{
                            backgroundColor: 'var(--bg-auth-input)',
                            borderColor: 'var(--border-auth-card)',
                            color: 'var(--text-auth-primary)',
                            colorScheme: 'light dark'
                        }}
                    />

                    {age !== null && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-500 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center">
                            <p className="text-sm font-medium" style={{ color: 'var(--text-success)' }}>
                                At {age}, you've got <span className="font-black underline">{Math.min(47, Math.max(0, 65 - age))} years</span> of earning potential to protect! 💰
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </StepWrapper>
    );
}
