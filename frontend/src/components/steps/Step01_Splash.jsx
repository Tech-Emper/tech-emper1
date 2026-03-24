import StepWrapper from './StepWrapper';
import { Sparkles, ArrowRight, User, MapPin, Phone } from 'lucide-react';
import { useThemeStyles } from '../../hooks/useThemeStyles';

export default function Step01_Splash({ formData, updateField }) {
    const themeStyles = useThemeStyles();
    
    return (
        <StepWrapper className="space-y-6 md:space-y-8">
            <div className="text-center space-y-3 md:space-y-4">
                <h1 className="text-3xl md:text-5xl font-black leading-tight" style={{ color: 'var(--text-auth-primary)' }}>
                    You're more than <span className="text-brand-accent">your job.</span>
                </h1>
                <p className="text-base md:text-lg max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--text-auth-label)' }}>
                    Your work pays the bills. But what about your family's dreams? Your parents' health? Your future freedom?
                </p>
                <div className="pt-2">
                    <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-auth-placeholder)' }}>
                        Tell us about yourself, and we'll build your protection story.
                    </p>
                </div>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
                {/* First Name + Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors" 
                              style={{ color: 'var(--text-auth-placeholder)' }} />
                        <input
                            type="text"
                            placeholder="First Name"
                            value={formData.first_name || ""}
                            onChange={(e) => updateField('first_name', e.target.value)}
                            className="w-full pl-12 pr-8 py-4 border rounded-2xl focus:ring-2 focus:ring-brand-accent outline-none transition-all font-medium placeholder:opacity-70"
                            style={{ 
                                backgroundColor: 'var(--bg-auth-input)',
                                borderColor: 'var(--border-auth-card)',
                                color: 'var(--text-auth-primary)',
                                '--placeholder-color': 'var(--text-auth-placeholder)'
                            }}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-lg">*</div>
                    </div>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors" 
                              style={{ color: 'var(--text-auth-placeholder)' }} />
                        <input
                            type="text"
                            placeholder="Last Name"
                            value={formData.last_name || ""}
                            onChange={(e) => updateField('last_name', e.target.value)}
                            className="w-full pl-12 pr-8 py-4 border rounded-2xl focus:ring-2 focus:ring-brand-accent outline-none transition-all font-medium placeholder:opacity-70"
                            style={{ 
                                backgroundColor: 'var(--bg-auth-input)',
                                borderColor: 'var(--border-auth-card)',
                                color: 'var(--text-auth-primary)',
                                '--placeholder-color': 'var(--text-auth-placeholder)'
                            }}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-lg">*</div>
                    </div>
                </div>

                {/* Gender */}
                <div className="grid grid-cols-3 gap-3">
                    {['Male', 'Female', 'Other'].map(g => (
                        <button
                            key={g}
                            onClick={() => updateField('gender', g)}
                            className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                                formData.gender === g 
                                    ? 'bg-brand-accent/20 border-brand-accent' 
                                    : 'hover:bg-opacity-10'
                            }`}
                            style={formData.gender === g ? { 
                                color: 'var(--text-auth-primary)' 
                            } : { 
                                backgroundColor: 'var(--bg-auth-input)',
                                borderColor: 'var(--border-auth-card)',
                                color: 'var(--text-auth-placeholder)'
                            }}
                        >
                            {g}
                        </button>
                    ))}
                </div>

                {/* City */}
                <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors" 
                            style={{ color: 'var(--text-auth-placeholder)' }} />
                    <select
                        value={formData.city || ""}
                        onChange={(e) => updateField('city', e.target.value)}
                        className="w-full pl-12 pr-10 py-4 border rounded-2xl focus:ring-2 focus:ring-brand-accent outline-none appearance-none cursor-pointer font-medium"
                        style={{ 
                            backgroundColor: 'var(--bg-auth-input)',
                            borderColor: 'var(--border-auth-card)',
                            color: 'var(--text-auth-primary)'
                        }}
                    >
                        <option value="" disabled style={{ backgroundColor: 'var(--bg-auth-main)' }}>Select your city</option>
                        {["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", "Other"].map(city => (
                            <option key={city} value={city} style={{ backgroundColor: 'var(--bg-auth-main)' }}>{city}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xs" 
                         style={{ color: 'var(--text-auth-placeholder)' }}>▼</div>
                </div>

                {/* Mobile */}
                <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors" 
                           style={{ color: 'var(--text-auth-placeholder)' }} />
                    <div className="absolute left-12 top-1/2 -translate-y-1/2 font-medium select-none" 
                         style={{ color: 'var(--text-auth-muted)' }}>+91</div>
                    <input
                        type="tel"
                        maxLength="10"
                        placeholder="Mobile Number"
                        value={formData.mobile || ""}
                        onChange={(e) => updateField('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full pl-22 pr-4 py-4 border rounded-2xl focus:ring-2 focus:ring-brand-accent outline-none transition-all font-medium placeholder:opacity-70"
                        style={{ 
                            backgroundColor: 'var(--bg-auth-input)',
                            borderColor: 'var(--border-auth-card)',
                            color: 'var(--text-auth-primary)'
                        }}
                    />
                </div>
            </div>


        </StepWrapper>
    );
}
