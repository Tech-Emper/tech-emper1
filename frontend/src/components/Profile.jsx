import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, PhoneCall, Save, CheckCircle,
    ArrowLeft, Edit3, MapPin, Calendar, Users,
    IndianRupee, X, Briefcase, Heart, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InputField = ({ label, name, value, icon: Icon, type = "text", placeholder, options = null, isEditing, onChange }) => (
    <div className="flex flex-row items-center gap-3 md:flex-col md:items-start md:gap-2">
        <label className="block text-[10px] md:text-xs font-black uppercase tracking-widest ml-1 flex-shrink-0 w-24 md:w-auto opacity-70" style={{ color: 'var(--text-auth-muted)' }}>
            {label}
        </label>
        <div className={`relative group transition-all duration-300 ${!isEditing ? 'opacity-80' : ''} flex-1 w-full`}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-brand-accent scale-90 md:scale-100" style={{ color: 'var(--text-auth-muted)' }}>
                <Icon className="w-5 h-5" />
            </div>

            {isEditing && options ? (
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full border rounded-xl md:rounded-2xl pl-10 md:pl-11 pr-5 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 transition-all font-bold text-sm md:text-base appearance-none cursor-pointer"
                    style={{
                        backgroundColor: 'var(--bg-auth-input)',
                        borderColor: 'var(--border-auth-card)',
                        color: 'var(--text-auth-primary)'
                    }}
                >
                    <option value="">Select {label}</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value}
                    readOnly={!isEditing || name === 'email'}
                    onChange={onChange}
                    className={`w-full border rounded-xl md:rounded-2xl pl-10 md:pl-11 pr-5 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 transition-all font-bold text-sm md:text-base ${(!isEditing || name === 'email') ? 'border-transparent bg-transparent shadow-none' : 'bg-[var(--bg-auth-input)] border-[var(--border-auth-card)]'
                        }`}
                    style={{
                        color: 'var(--text-auth-primary)'
                    }}
                    placeholder={placeholder || `Enter ${label}`}
                />
            )}
        </div>
    </div>
);

const Profile = () => {
    const { user, profile, updateProfile, loading } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        mobile: '',
        secondary_phone: '',
        secondary_email: '',
        aadhar_number: '',
        city: '',
        dob: '',
        gender: '',
        income_level: '',
        marital_status: '',
        occupation: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (profile) {
            // Ensure DOB is in YYYY-MM-DD format for type="date"
            let formattedDob = '';
            if (profile.dob) {
                try {
                    const dateObj = new Date(profile.dob);
                    if (!isNaN(dateObj.getTime())) {
                        formattedDob = dateObj.toISOString().split('T')[0];
                    } else {
                        formattedDob = profile.dob; // Fallback to raw if logic fails
                    }
                } catch (e) {
                    formattedDob = profile.dob;
                }
            }
            setFormData({
                first_name: profile.first_name || '',
                mobile: profile.mobile || '',
                secondary_phone: profile.secondary_phone || '',
                secondary_email: profile.secondary_email || '',
                aadhar_number: profile.aadhar_number || '',
                city: profile.city || '',
                dob: formattedDob,
                gender: profile.gender || '',
                income_level: profile.income_level || '',
                marital_status: profile.marital_status || '',
                occupation: profile.employment_type || ''
            });
        }
    }, [profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        if (profile) {
            setFormData({
                first_name: profile.first_name || '',
                // last_name: profile.last_name || '', // Removed as per instruction
                mobile: profile.mobile || '',
                secondary_phone: profile.secondary_phone || '',
                secondary_email: profile.secondary_email || '', // Added back
                aadhar_number: profile.aadhar_number || '', // Added back
                city: profile.city || '',
                dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '', // Ensure correct format on cancel
                gender: profile.gender || '',
                income_level: profile.income_level || '',
                marital_status: profile.marital_status || '',
                occupation: profile.employment_type || ''
            });
        }
        setIsEditing(false);
        setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        console.log("Submitting Profile Update with Payload:", {
            ...formData,
            employment_type: formData.occupation
        });

        const success = await updateProfile({
            ...formData,
            employment_type: formData.occupation // Mapping back
        });

        if (success) {
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);
        } else {
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        }
        setIsSaving(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-accent"></div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6 z-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 1 }}
                className="backdrop-blur-xl rounded-[32px] md:rounded-[40px] p-5 md:p-12 shadow-2xl overflow-hidden relative border border-white/10"
                style={{ backgroundColor: 'var(--bg-auth-card)' }}
            >
                {/* Decorative background Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-[80px] -z-10 pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4 md:mb-8">
                    <div className="flex items-center justify-between w-full md:w-auto">
                        <div className="flex items-center gap-6 w-full">
                            <div className="relative hidden md:block">
                                <div className="w-20 h-20 rounded-3xl bg-brand-accent/20 flex items-center justify-center text-3xl shadow-inner border border-brand-accent/20">
                                    👤
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-accent rounded-lg border-4 border-[var(--bg-auth-card)]" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between md:justify-start gap-4 w-full">
                                    <h2 className="text-2xl md:text-3xl font-black italic tracking-tight" style={{ color: 'var(--text-auth-primary)' }}>
                                        My <span className="text-brand-accent">Profile</span>
                                    </h2>
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="md:hidden p-2 bg-brand-accent text-brand-dark rounded-xl shadow-lg shadow-brand-accent/20 active:scale-[0.9] transition-all"
                                        >
                                            <Edit3 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm font-bold opacity-60 mt-1" style={{ color: 'var(--text-auth-muted)' }}>
                                    {user?.email || profile?.email || 'Authenticated User'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="hidden md:flex items-center gap-2 px-6 py-3 bg-brand-accent text-brand-dark rounded-2xl font-black shadow-lg shadow-brand-accent/20 hover:scale-[1.05] active:scale-[0.95] transition-all"
                            >
                                <Edit3 className="w-5 h-5" />
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl font-black text-white hover:bg-white/10 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSaving}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-brand-accent text-brand-dark rounded-2xl font-black shadow-lg shadow-brand-accent/20 hover:scale-[1.05] active:scale-[0.95] transition-all disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <div className="w-5 h-5 border-2 border-brand-dark/30 border-t-brand-dark animate-spin rounded-full" />
                                    ) : (
                                        <Save className="w-5 h-5" />
                                    )}
                                    Save
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                {/* <div className="h-px w-full bg-white/5 mb-6 md:mb-10" /> */}

                <AnimatePresence>
                    {message.text && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`mb-8 p-4 rounded-2xl flex items-center gap-3 overflow-hidden ${message.type === 'success'
                                ? 'bg-brand-accent/10 border border-brand-accent/20 text-brand-accent'
                                : 'bg-red-500/10 border border-red-500/20 text-red-400'
                                }`}
                        >
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-bold">{message.text}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 md:gap-y-8">
                    {/* Basic Info */}
                    <div className="space-y-3 md:space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-accent border-b border-brand-accent/20 pb-2">Personal Details</h3>

                        <InputField
                            label="First Name"
                            name="first_name"
                            value={formData.first_name}
                            icon={User}
                            placeholder="Your First Name"
                            isEditing={isEditing}
                            onChange={handleChange}
                        />

                        <InputField
                            label="Email (Primary)"
                            name="email"
                            value={user?.email || profile?.email || ''}
                            icon={Mail}
                            placeholder="email@example.com"
                            isEditing={isEditing}
                            onChange={handleChange}
                        />

                        <InputField
                            label="Secondary Email"
                            name="secondary_email"
                            value={formData.secondary_email}
                            icon={Mail}
                            placeholder="Personal email"
                            isEditing={isEditing}
                            onChange={handleChange}
                        />

                        <InputField
                            label="Aadhar Number"
                            name="aadhar_number"
                            value={formData.aadhar_number}
                            icon={Shield}
                            placeholder="12-digit Aadhar number"
                            isEditing={isEditing}
                            onChange={handleChange}
                        />

                        <div className="grid grid-cols-1 gap-4">
                            <InputField
                                label="City"
                                name="city"
                                value={formData.city}
                                icon={MapPin}
                                placeholder="e.g. Mumbai"
                                isEditing={isEditing}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Contact & Professional */}
                    <div className="space-y-3 md:space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-accent border-b border-brand-accent/20 pb-2">Professional & Lifestyle</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Mobile"
                                name="mobile"
                                value={formData.mobile}
                                icon={Phone}
                                placeholder="Mobile number"
                                isEditing={isEditing}
                                onChange={handleChange}
                            />
                            <InputField
                                label="Secondary Phone"
                                name="secondary_phone"
                                value={formData.secondary_phone}
                                icon={PhoneCall}
                                placeholder="Backup number"
                                isEditing={isEditing}
                                onChange={handleChange}
                            />
                        </div>

                        <InputField
                            label="Occupation"
                            name="occupation"
                            value={formData.occupation}
                            icon={Briefcase}
                            placeholder="Select Occupation"
                            options={['Salaried (MNC/Large)', 'Salaried (SME/Startup)', 'Business Owner', 'Professional (Doc/CA)', 'Freelancer', 'Other']}
                            isEditing={isEditing}
                            onChange={handleChange}
                        />

                        <InputField
                            label="Income Level"
                            name="income_level"
                            value={formData.income_level}
                            icon={IndianRupee}
                            options={['Under ₹5 Lakhs', '₹5-7.5 lakhs', '₹7.5-10 lakhs', '₹10-15 lakhs', '₹15-25 lakhs', '₹25+ lakhs']}
                            isEditing={isEditing}
                            onChange={handleChange}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Gender"
                                name="gender"
                                value={formData.gender}
                                icon={User}
                                options={['Male', 'Female', 'Other']}
                                isEditing={isEditing}
                                onChange={handleChange}
                            />
                            <InputField
                                label="Marital Status"
                                name="marital_status"
                                value={formData.marital_status}
                                icon={Heart}
                                options={['Single', 'Married', 'Divorced', 'Widowed']}
                                isEditing={isEditing}
                                onChange={handleChange}
                            />
                        </div>
                        <InputField
                            label="Date of Birth"
                            name="dob"
                            value={formData.dob}
                            icon={Calendar}
                            type="date"
                            placeholder="Select your birth date"
                            isEditing={isEditing}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {
                    isEditing && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-12 p-6 rounded-3xl bg-brand-accent/5 border border-brand-accent/20 flex items-start gap-4"
                        >
                            <div className="p-2 bg-brand-accent text-brand-dark rounded-xl">
                                <Save className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-brand-accent">Unsaved Changes</p>
                                <p className="text-xs opacity-60 mt-1" style={{ color: 'var(--text-auth-muted)' }}>
                                    You are currently in editing mode. Don't forget to save your changes to sync them with your insurance profile.
                                </p>
                            </div>
                        </motion.div>
                    )
                }
            </motion.div >
        </div >
    );
};

export default Profile;
