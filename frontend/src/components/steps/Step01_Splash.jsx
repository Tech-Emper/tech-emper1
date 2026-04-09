import React from 'react';
import StepWrapper from './StepWrapper';
import { User, MapPin, Mail, Phone } from 'lucide-react';
import { useThemeStyles } from '../../hooks/useThemeStyles';

const MemberCard = ({ memberKey, icon, label, isChild = false, data, onUpdate, onMaritalStatusUpdate }) => {
    const selected = isChild ? data.count > 0 : data.selected;

    const handleCardClick = () => {
        if (!isChild) {
            // Prevent deselecting 'self'
            if (memberKey === 'self' && selected) {
                return;
            }
            // If it's spouse, and currently unselected, maybe we should auto-set marital status to Married?
            if (memberKey === 'spouse' && !selected && onMaritalStatusUpdate) {
                onMaritalStatusUpdate('Married');
            }
            onUpdate(memberKey, 'selected', !selected);
        }
    };

    const increment = (e) => {
        e.stopPropagation();
        onUpdate(memberKey, 'count', (data.count || 0) + 1);
    };

    const decrement = (e) => {
        e.stopPropagation();
        if (data.count > 0) {
            onUpdate(memberKey, 'count', data.count - 1);
        }
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <div
                onClick={handleCardClick}
                className={`relative w-full flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 ${!isChild ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''} ${selected ? 'bg-brand-accent/20 border-brand-accent shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'hover:bg-opacity-10 opacity-70 hover:opacity-100'}`}
                style={!selected ? { backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-muted)' } : { color: 'var(--text-auth-primary)' }}
            >
                <div className="text-4xl mb-2 select-none" style={{ textShadow: selected ? '0 0 15px rgba(var(--brand-accent-rgb), 0.5)' : 'none' }}>
                    {icon}
                </div>
                <div className={`text-sm font-bold ${selected ? 'text-brand-accent' : ''}`}>
                    {label}
                </div>

                {isChild && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-brand-accent text-white rounded-lg flex items-center shadow-lg border-2 border-[var(--bg-auth-main)] select-none z-10" style={{ height: '32px' }}>
                        <button onClick={decrement} className="px-3 h-full flex items-center justify-center font-black rounded-l-full hover:bg-black/10 transition-colors">-</button>
                        <span className="px-1 min-w-[16px] text-center font-bold text-sm leading-none">{data.count}</span>
                        <button onClick={increment} className="px-3 h-full flex items-center justify-center font-black rounded-r-full hover:bg-black/10 transition-colors">+</button>
                    </div>
                )}
            </div>

            {/* Age Input Box natively below the adult card */}
            {selected && !isChild && (
                <div className="w-full mt-1">
                    <input
                        type="number"
                        placeholder="Age"
                        min="18"
                        max="100"
                        value={data.age || ''}
                        onChange={(e) => onUpdate(memberKey, 'age', e.target.value)}
                        className="w-full text-center py-2 px-2 border-2 rounded-xl focus:ring-2 focus:ring-brand-accent/50 outline-none transition-all font-black"
                        style={{
                            backgroundColor: 'var(--bg-auth-input)',
                            borderColor: data.age ? 'var(--border-auth-card)' : 'rgba(239, 68, 68, 0.4)', // light red hint if empty
                            color: 'var(--text-auth-primary)'
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default function Step01_Splash({ formData, updateField }) {
    const themeStyles = useThemeStyles();

    // Default initializer fallback for insured_members if not present
    const insuredMembers = (formData.insured_members && Object.keys(formData.insured_members).length > 0) ? formData.insured_members : {
        self: { selected: true, age: '' },
        spouse: { selected: false, age: '' },
        son: { count: 0 },
        daughter: { count: 0 },
        father: { selected: false, age: '' },
        mother: { selected: false, age: '' }
    };

    const handleMemberUpdate = (memberKey, field, value) => {
        updateField('insured_members', {
            ...insuredMembers,
            [memberKey]: {
                ...insuredMembers[memberKey],
                [field]: value
            }
        });
    };

    return (
        <StepWrapper className="space-y-6 md:space-y-8 pb-10">
            <div className="text-center space-y-3 md:space-y-4">
                <h1 className="text-3xl md:text-5xl font-black leading-tight" style={{ color: 'var(--text-auth-primary)' }}>
                    Your personal <span className="text-brand-accent">insurance </span>check
                </h1>
                <p className="text-base md:text-lg max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--text-auth-label)' }}>
                    Insurance is about people, not just policies
                </p>
            </div>

            <div className="space-y-6 max-w-md mx-auto">
                {/* 1. First Name + Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors opacity-50" />
                        <input
                            type="text"
                            placeholder="First Name"
                            value={formData.first_name || ""}
                            onChange={(e) => updateField('first_name', e.target.value)}
                            className="w-full pl-12 pr-8 py-3.5 border rounded-2xl focus:ring-2 focus:ring-brand-accent outline-none transition-all font-bold placeholder:opacity-50"
                            style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }}
                        />
                    </div>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors opacity-50" />
                        <input
                            type="text"
                            placeholder="Last Name"
                            value={formData.last_name || ""}
                            onChange={(e) => updateField('last_name', e.target.value)}
                            className="w-full pl-12 pr-8 py-3.5 border rounded-2xl focus:ring-2 focus:ring-brand-accent outline-none transition-all font-bold placeholder:opacity-50"
                            style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }}
                        />
                    </div>
                </div>

                {/* 2. City */}
                <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors opacity-50" />
                    <select
                        value={formData.city || ""}
                        onChange={(e) => updateField('city', e.target.value)}
                        className="w-full pl-12 pr-10 py-3.5 border rounded-2xl focus:ring-2 focus:ring-brand-accent outline-none appearance-none cursor-pointer"
                        style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }}
                    >
                        <option value="" disabled>Select your city</option>
                        {["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", "Other"].map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xs opacity-50">▼</div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {/* 3. Marital Status */}
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold ml-1 tracking-wider" style={{ color: 'var(--text-auth-label)' }}>Marital Status</label>
                        <div className="grid grid-cols-2 gap-2 md:gap-3">
                            {['Single', 'Married'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        updateField('marital_status', status);
                                        if (status === 'Single') handleMemberUpdate('spouse', 'selected', false);
                                    }}
                                    className={`p-2.5 md:p-3 rounded-xl border transition-all duration-200 ${formData.marital_status === status ? 'bg-brand-accent/20 border-brand-accent shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'hover:bg-opacity-10'}`}
                                    style={formData.marital_status !== status ? {
                                        backgroundColor: 'var(--bg-auth-input)',
                                        borderColor: 'var(--border-auth-card)',
                                        color: 'var(--text-auth-muted)'
                                    } : {
                                        color: 'var(--text-auth-primary)'
                                    }}
                                >
                                    <span className="text-xs md:text-sm font-bold">{status}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 4. Gender */}
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold ml-1 tracking-wider" style={{ color: 'var(--text-auth-label)' }}>Gender</label>
                        <div className="grid grid-cols-2 gap-2 md:gap-3">
                            {['Male', 'Female'].map(g => (
                                <button
                                    key={g}
                                    onClick={() => updateField('gender', g)}
                                    className={`flex items-center justify-center gap-2 p-2.5 md:p-3 rounded-xl border transition-all duration-200 ${formData.gender === g ? 'bg-brand-accent/20 border-brand-accent shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'hover:bg-opacity-10'}`}
                                    style={formData.gender !== g ? {
                                        backgroundColor: 'var(--bg-auth-input)',
                                        borderColor: 'var(--border-auth-card)',
                                        color: 'var(--text-auth-muted)'
                                    } : {
                                        color: 'var(--text-auth-primary)'
                                    }}
                                >
                                    <span className="text-xs md:text-sm font-bold">{g}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 5. Select Members you want to insure */}
                <div className="pt-4 space-y-4">
                    <h3 className="text-center text-lg font-black" style={{ color: 'var(--text-auth-primary)' }}>
                        Select members you want to insure
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        <MemberCard memberKey="self" icon={formData.gender === 'Female' ? '👩🏻' : '🧔🏻‍♂️'} label="You" data={insuredMembers.self} onUpdate={handleMemberUpdate} onMaritalStatusUpdate={(val) => updateField('marital_status', val)} />
                        <MemberCard memberKey="spouse" icon={formData.gender === 'Female' ? '🧔🏻‍♂️' : '👩🏻'} label={formData.gender === 'Female' ? 'Husband' : 'Wife'} data={insuredMembers.spouse} onUpdate={handleMemberUpdate} onMaritalStatusUpdate={(val) => updateField('marital_status', val)} />
                        <MemberCard memberKey="daughter" icon="👧🏻" label="Daughter" isChild={true} data={insuredMembers.daughter} onUpdate={handleMemberUpdate} onMaritalStatusUpdate={(val) => updateField('marital_status', val)} />
                        <MemberCard memberKey="son" icon="👦🏻" label="Son" isChild={true} data={insuredMembers.son} onUpdate={handleMemberUpdate} onMaritalStatusUpdate={(val) => updateField('marital_status', val)} />
                        <MemberCard memberKey="father" icon="👴🏻" label="Father" data={insuredMembers.father} onUpdate={handleMemberUpdate} onMaritalStatusUpdate={(val) => updateField('marital_status', val)} />
                        <MemberCard memberKey="mother" icon="👵🏻" label="Mother" data={insuredMembers.mother} onUpdate={handleMemberUpdate} onMaritalStatusUpdate={(val) => updateField('marital_status', val)} />
                    </div>
                </div>
            </div>
        </StepWrapper>
    );
}
