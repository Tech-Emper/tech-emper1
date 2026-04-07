import React from 'react';
import StepWrapper from './StepWrapper';
import { Mail, Phone } from 'lucide-react';
import { useThemeStyles } from '../../hooks/useThemeStyles';

export default function Step04b_ContactInfo({ formData, updateField }) {
    const themeStyles = useThemeStyles();

    return (
        <StepWrapper className="space-y-6 md:space-y-8">
            <div className="text-center space-y-3 md:space-y-4">
                <h1 className="text-3xl md:text-5xl font-black leading-tight" style={{ color: 'var(--text-auth-primary)' }}>
                    Save Your <span className="text-brand-accent">Blueprint</span>
                </h1>
                <p className="text-base md:text-lg max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--text-auth-label)' }}>
                    We've run the calculations. Drop your contact details below to instantly unlock your tailored AI strategy!
                </p>
            </div>

            <div className="space-y-6 max-w-md mx-auto pt-8">
                {/* Mobile */}
                <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors opacity-50" />
                    <div className="absolute left-12 top-1/2 -translate-y-1/2 font-medium select-none opacity-50">+91</div>
                    <input
                        type="tel"
                        maxLength="10"
                        placeholder="Mobile Number"
                        value={formData.mobile || ""}
                        onChange={(e) => updateField('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full pl-22 pr-4 py-4 border rounded-2xl focus:ring-2 focus:ring-brand-accent outline-none transition-all font-bold placeholder:opacity-50 text-lg"
                        style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }}
                    />
                </div>
                
                {/* Email */}
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors opacity-50" />
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={formData.email || ""}
                        onChange={(e) => updateField('email', e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border rounded-2xl focus:ring-2 focus:ring-brand-accent outline-none transition-all font-bold placeholder:opacity-50 text-lg"
                        style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: !formData.email || formData.email.includes('@') ? 'var(--border-auth-card)' : '#ef4444', color: 'var(--text-auth-primary)' }}
                    />
                </div>
            </div>
        </StepWrapper>
    );
}
