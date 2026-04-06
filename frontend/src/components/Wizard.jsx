import React, { useState, useEffect, useRef } from 'react';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { API_BASE_URL } from '../config';
import { ArrowRight, ArrowLeft, Briefcase, FileText, User, Heart, Sparkles, Check, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

import Step01_Splash from './steps/Step01_Splash';
import Step04_FinancialReality from './steps/Step04_FinancialReality';
import Step05_HealthSnapshot from './steps/Step05_HealthSnapshot';
import Step05_Results from './steps/Step05_Results';
import Step05b_PolicyEntry from './steps/Step05b_PolicyEntry';
import Step07_GapAnalysis from './steps/Step07_GapAnalysis';
import Step09_ProductRecommendations from './steps/Step09_ProductRecommendations';
import OTPModal from './OTPModal';
import Dashboard from './Dashboard';

export default function Wizard({ onBack }) {
    const themeStyles = useThemeStyles();
    const { profile, recommendations, refreshProfile, loading: authLoading, isAuthenticated, login: sendOtp, verify } = useAuth();
    const [step, setStep] = useState(1);
    const hasInitialized = useRef(false);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        city: "",
        mobile: "",
        email: "",
        marital_status: "Single",
        num_children: 0,
        support_parents: false,
        dob: "",
        career_stage: "",
        income_level: "",
        employment_type: "",
        company_name: "",
        industry_type: "",
        smoking_status: "",
        family_health_history: [],
        lifestyle: "",
        gender: "", // Default
        insured_members: {
            self: { selected: true, age: '' },
            spouse: { selected: false, age: '' },
            son: { count: 0 },
            daughter: { count: 0 },
            father: { selected: false, age: '' },
            mother: { selected: false, age: '' }
        },
        // Phase 2 Fields
        has_life_insurance: false,
        existing_life_cover: "",
        existing_life_cover_val: 0,
        has_health_insurance: false,
        existing_health_cover: "",
        existing_health_cover_val: 0,
        health_source: "Employer",
        parents_covered: false,
        dependents: {},
        // Phase 3 Fields
        life_provider: "",
        life_policy_name: "",
        life_provider_custom: "",
        life_policy_name_custom: "",
        health_provider: "",
        health_policy_name: "",
        health_provider_custom: "",
        health_policy_name_custom: "",
        secondary_email: "",
        aadhar_number: ""
    });
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [view, setView] = useState('wizard'); // 'wizard' or 'dashboard'
    const [showResumePrompt, setShowResumePrompt] = useState(false);
    const [resumeData, setResumeData] = useState(null);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [tempEmail, setTempEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    const [otpModalState, setOtpModalState] = useState({ show: false, loading: false, error: null });

    // Initial sync from global profile
    useEffect(() => {
        if (!authLoading && profile) {
            setFormData(prev => {
                const merged = { ...prev };
                Object.keys(profile).forEach(key => {
                    if (profile[key] !== null && profile[key] !== undefined && profile[key] !== "") {
                        merged[key] = profile[key];
                    }
                });
                return merged;
            });

            // Only auto-switch to dashboard ONCE on initial load
            if (!hasInitialized.current) {
                if (recommendations && recommendations.length > 0) {
                    setResult(recommendations[0]);
                    setHistory(recommendations);
                    setView('dashboard');
                } else if (profile.current_step > 1 && view === 'wizard') {
                    setResumeData({ step: profile.current_step, formData: profile });
                    setShowResumePrompt(true);
                }
                hasInitialized.current = true;
            }
        }
    }, [profile, recommendations, authLoading]);

    useEffect(() => {
        if (!authLoading) {
            setInitialLoading(false);
        }
    }, [authLoading]);

    const saveProgress = async (nextStep, currentFormData = formData) => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            console.log(`Saving progress to step ${nextStep}...`, currentFormData);
            const response = await fetch(`${API_BASE_URL}/api/user/save-progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    formData: currentFormData,
                    current_step: nextStep
                })
            });
            if (response.ok) {
                console.log("Progress saved successfully!");
                refreshProfile();
            } else {
                const errData = await response.json();
                console.error("Save progress failed:", errData);
            }
        } catch (error) {
            console.error("Failed to save progress", error);
        }
    };

    const handleNext = () => {
        if (isStepValid()) {
            const nextStep = step + 1;
            setStep(nextStep);
            saveProgress(nextStep);
            window.scrollTo(0, 0);
        } else {
            alert("Please fill mandatory fields.");
        }
    };

    const handleResume = () => {
        setStep(resumeData.step);
        setFormData(prev => ({ ...prev, ...resumeData.formData }));
        setShowResumePrompt(false);
    };

    const handleStartOver = () => {
        hasInitialized.current = true; // Stay in wizard
        setStep(1);
        saveProgress(1); // Reset step in DB
        setShowResumePrompt(false);
    };

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const isStepValid = (stepToCheck = step) => {
        if (stepToCheck === 1) {
            let valid = (
                formData.first_name?.trim() !== "" &&
                formData.last_name?.trim() !== "" &&
                formData.city !== "" &&
                formData.gender !== "" &&
                formData.marital_status !== ""
            );

            if (valid && formData.insured_members) {
                const adults = ['self', 'spouse', 'father', 'mother'];
                for (let key of adults) {
                    if (formData.insured_members[key]?.selected) {
                        const age = formData.insured_members[key].age;
                        if (!age || age < 18 || age > 100) {
                            valid = false;
                        }
                    }
                }
            }
            return valid;
        }
        if (stepToCheck === 2) {
            return (
                formData.company_name?.trim() !== "" &&
                formData.employment_type?.trim() !== "" &&
                formData.income_level !== ""
            );
        }
        if (stepToCheck === 3) {
            return (
                formData.smoking_status !== "" &&
                formData.lifestyle !== "" &&
                formData.family_health_history?.length > 0
            );
        }
        // Steps 4, 5, 6, 7 handle their own flow
        return true;
    };

    const canGoToStep = (targetStep) => {
        // Can always go back
        if (targetStep <= step) return true;

        // Cannot jump forward more than one step
        if (targetStep > step + 1) return false;

        // Can only go to the next step if the current one is valid
        return isStepValid(step);
    };

    const fetchRecommendation = async (emailOverride = null) => {
        setLoading(true);
        try {
            // Prep dependents intelligently from insured_members
            const updatedDependents = {};
            if (formData.insured_members?.spouse?.selected) updatedDependents["Spouse"] = true;
            if (formData.insured_members?.son?.count > 0 || formData.insured_members?.daughter?.count > 0) updatedDependents["Children"] = true;
            if (formData.insured_members?.father?.selected || formData.insured_members?.mother?.selected) updatedDependents["Parents"] = true;

            const finalPayload = {
                ...formData,
                ...(emailOverride ? { email: emailOverride } : {}),
                is_smoker: formData.smoking_status !== "No",
                dependents: updatedDependents
            };

            const token = localStorage.getItem('auth_token');
            const headers = { 'Content-Type': 'application/json' };
            if (token && token !== 'null' && token !== 'undefined') {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch(`${API_BASE_URL}/api/recommend`, {
                method: 'POST',
                headers,
                body: JSON.stringify(finalPayload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || "Failed to fetch recommendation");
            }

            const data = await response.json();
            setResult(data);
            setHistory(prev => [data, ...prev]);

            const nextStep = 4;
            setStep(nextStep);
            saveProgress(nextStep, formData);
        } catch (error) {
            console.error("Failed to fetch", error);
            alert("Oops! The insurance hamster fell off the wheel. Try again in a bit.");
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        const prevStep = step - 1;
        setStep(prevStep);
        saveProgress(prevStep);
    };

    const handleEmailSubmit = async () => {
        if (!tempEmail || !tempEmail.includes('@')) {
            setEmailError("Please enter a valid email address.");
            return;
        }
        setEmailError("");
        // Update state for future renders
        updateField('email', tempEmail);
        setShowEmailModal(false);
        // Pass email DIRECTLY to avoid React state batching race condition
        fetchRecommendation(tempEmail);
    };

    const handleVerifyOtp = async (otpString) => {
        setOtpModalState(prev => ({ ...prev, loading: true, error: null }));
        const emailToVerify = formData.email || tempEmail;
        try {
            await verify(emailToVerify, otpString);
            setOtpModalState(prev => ({ ...prev, show: false, loading: false }));
            
            // Now fully authenticated, if we were deferred from a step transition:
            if (otpModalState.nextStep) {
                const ns = otpModalState.nextStep;
                setStep(ns);
                const mergedData = { ...formData, email: emailToVerify, ...(otpModalState.tempUpdates || {}) };
                setFormData(mergedData);
                saveProgress(ns, mergedData);
            }
        } catch (err) {
            setOtpModalState(prev => ({ ...prev, error: err.message || "Invalid OTP", loading: false }));
        }
    };

    const saveSafetyNet = async (finalResult) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');

            // Format custom providers/policies if 'Other' was selected
            const finalFormData = { ...formData };
            if (finalFormData.life_provider === 'Other') finalFormData.life_provider = finalFormData.life_provider_custom;
            if (finalFormData.life_policy_name === 'Other') finalFormData.life_policy_name = finalFormData.life_policy_name_custom;
            if (finalFormData.health_provider === 'Other') finalFormData.health_provider = finalFormData.health_provider_custom;
            if (finalFormData.health_policy_name === 'Other') finalFormData.health_policy_name = finalFormData.health_policy_name_custom;

            await fetch(`${API_BASE_URL}/api/recommend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(finalFormData)
            });

            // Update the global result with the specific plans if provided
            if (finalResult) {
                setResult(prev => ({
                    ...prev,
                    ...finalResult
                }));
            }

            // After saving, we can finally move to dashboard or final view
            setView('dashboard');
        } catch (error) {
            console.error("Failed to save safety net", error);
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, title: "Start", icon: <Sparkles className="w-5 h-5" /> },
        { id: 2, title: "Career", icon: <Briefcase className="w-5 h-5" /> },
        { id: 3, title: "Health", icon: <Heart className="w-5 h-5" /> },
        { id: 4, title: "Results", icon: <Check className="w-5 h-5" /> },
        { id: 5, title: "Policies", icon: <FileText className="w-5 h-5" /> },
        { id: 6, title: "Gap", icon: <Shield className="w-5 h-5" /> },
        { id: 7, title: "Match", icon: <Sparkles className="w-5 h-5" /> },
    ];

    if (initialLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-accent mb-4"></div>
                <p className="font-medium" style={{ color: 'var(--text-auth-muted)' }}>Loading your profile...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto px-4">
            {/* <div className="min-[1200px]:fixed min-[1200px]:top-24 min-[1200px]:left-8 mb-4 min-[1200px]:mb-0 z-50">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-brand-accent transition-all py-2 px-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg hover:scale-105"
                    style={{ color: 'var(--text-auth-muted)' }}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </button>
            </div> */}

            {/* Resumption Prompt Overlay */}
            <AnimatePresence>
                {showResumePrompt && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-brand-dark border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
                            style={{
                                backgroundColor: 'var(--bg-auth-card)',
                                borderColor: 'var(--border-auth-card)'
                            }}
                        >
                            <div className="w-16 h-16 bg-brand-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="w-8 h-8 text-brand-accent animate-pulse" />
                            </div>
                            <h2 className="text-2xl font-black mb-2 italic" style={{ color: 'var(--text-auth-primary)' }}>Resume Your Protection</h2>
                            <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-auth-muted)' }}>
                                We found your previous progress. Would you like to pick up where you left off at <span className="font-bold" style={{ color: 'var(--text-auth-primary)' }}>Step {resumeData?.step}</span>?
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={handleResume}
                                    className="w-full py-4 bg-brand-accent text-brand-dark rounded-2xl font-black shadow-lg shadow-brand-accent/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                                >
                                    Resume My Journey <ArrowRight className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleStartOver}
                                    className="w-full py-4 border rounded-2xl font-bold transition-colors"
                                    style={{
                                        backgroundColor: 'var(--bg-auth-input)',
                                        borderColor: 'var(--border-auth-card)',
                                        color: 'var(--text-auth-muted)'
                                    }}
                                >
                                    Start Over from Scratch
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Progress Header */}
            {view !== 'dashboard' && (
                <div className="mb-6 md:mb-10">

                    {/* Desktop Stepper (Icon-based) */}
                    <div className="hidden md:flex justify-between items-start relative pb-4 px-2">
                        {/* Background Line */}
                        <div className="absolute top-5 left-7 right-7 h-0.5 -z-10 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-auth-input)' }}>
                            {/* Dynamic Filling Progress Bar */}
                            <motion.div
                                className="h-full bg-brand-accent shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                                transition={{ type: "spring", stiffness: 50, damping: 20 }}
                            />
                        </div>
                        {steps.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => {
                                    if (!loading) {
                                        if (canGoToStep(s.id)) {
                                            setStep(s.id);
                                            saveProgress(s.id);
                                        } else {
                                            alert(`Please complete the current step before moving to ${s.title}.`);
                                        }
                                    }
                                }}
                                disabled={loading}
                                className={`flex flex-col items-center gap-2 relative z-10 group cursor-pointer disabled:cursor-not-allowed ${!canGoToStep(s.id) ? 'opacity-80' : ''}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${canGoToStep(s.id) ? 'group-hover:scale-110' : ''} ${step > s.id
                                    ? 'bg-brand-accent border-brand-accent text-brand-dark shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                    : step === s.id
                                        ? 'bg-brand-accent border-brand-accent text-brand-dark shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-110 z-20'
                                        : `border-2 bg-brand-dark border-white/10`
                                    }`}
                                    style={step < s.id ? {
                                        backgroundColor: 'var(--bg-auth-card)',
                                        borderColor: 'var(--border-auth-card)',
                                        color: 'var(--text-auth-muted)'
                                    } : {}}
                                >
                                    {step > s.id ? <Check className="w-5 h-5" /> : s.icon}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${step >= s.id ? 'text-brand-accent' : ''}`}
                                    style={step < s.id ? { color: 'var(--text-auth-muted)' } : {}}
                                >
                                    {s.title}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Mobile Stepper (Compact Progress Bar) */}
                    <div className="md:hidden space-y-3">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-[10px] font-black text-brand-accent uppercase tracking-[0.2em]">
                                Progress: Step {step} of {steps.length}
                            </span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                                {steps[step - 1].title}
                            </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-auth-input)' }}>
                            <div
                                className="h-full bg-brand-accent transition-all duration-500 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                style={{ width: `${(step / steps.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Dashboard View */}
            {view === 'dashboard' ? (
                <div className="bg-brand-surface backdrop-blur-xl border border-white/10 rounded-3xl p-5 md:p-10 shadow-2xl relative">
                    <Dashboard
                        userProfile={formData}
                        latestRecommendation={result}
                        history={history}
                        onBack={onBack}
                        onUpdatePlan={() => {
                            hasInitialized.current = true;
                            setView('wizard');
                            setStep(1);
                        }}
                        onCompleteExistingDetails={() => {
                            hasInitialized.current = true;
                            setView('wizard');
                            setStep(4);
                        }}
                    />
                </div>
            ) : (
                /* Wizard Card */
                <div className="backdrop-blur-xl rounded-3xl p-5 md:p-10 shadow-2xl overflow-hidden relative"
                    style={{
                        backgroundColor: 'var(--bg-auth-card)',
                        borderColor: 'var(--border-auth-card)',
                        border: '1px solid'
                    }}>

                    {/* Decorative glow inside card */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[80px] -z-10 pointer-events-none" />

                    <AnimatePresence mode="wait" initial={false}>
                        {step === 1 && <Step01_Splash key="step1" formData={formData} updateField={updateField} />}
                        {step === 2 && <Step04_FinancialReality key="step2" formData={formData} updateField={updateField} />}
                        {step === 3 && <Step05_HealthSnapshot key="step3" formData={formData} updateField={updateField} />}
                        {step === 4 && <Step05_Results key="step4" result={result} formData={formData} onNext={() => { const ns = 5; setStep(ns); saveProgress(ns); }} />}
                        {step === 5 && <Step05b_PolicyEntry key="step5" formData={formData} updateField={updateField} onDone={async (updates = {}) => {
                            const ns = 6;
                            if (!isAuthenticated) {
                                // Resolve which email to use - tempEmail is most reliable as formData.email update is async
                                const emailToUse = formData.email || tempEmail;
                                if (!emailToUse) {
                                    alert("We couldn't find your email. Please restart the journey.");
                                    return;
                                }
                                // Show modal immediately
                                setOtpModalState({ show: true, loading: true, error: null, tempUpdates: updates, nextStep: ns });
                                try {
                                    await sendOtp(emailToUse);
                                    // OTP sent — remove loading from modal (user inputs now)
                                    setOtpModalState(prev => ({ ...prev, loading: false }));
                                } catch (err) {
                                    setOtpModalState(prev => ({
                                        ...prev,
                                        loading: false,
                                        error: `Failed to send OTP: ${err.message || 'Please try again.'}`
                                    }));
                                }
                            } else {
                                setStep(ns);
                                const mergedData = { ...formData, ...updates };
                                setFormData(mergedData);
                                saveProgress(ns, mergedData);
                            }
                        }} />}
                        {step === 6 && <Step07_GapAnalysis key="step6" formData={formData} result={result} onNext={() => { const ns = 7; setStep(ns); saveProgress(ns); }} />}
                        {step === 7 && <Step09_ProductRecommendations key="step7" formData={formData} gapResult={result} onComplete={saveSafetyNet} />}
                    </AnimatePresence>

                    {/* Navigation — hidden on step 4, 5, 6, 7 which have their own actions */}
                    {step < 4 && (
                        <div className="flex justify-between items-center pt-6 md:pt-8 mt-6 md:mt-8"
                            style={{ borderTopColor: 'var(--border-auth-card)', borderTopWidth: '1px' }}>
                            <button
                                onClick={handleBack}
                                disabled={step === 1}
                                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${step === 1
                                    ? 'cursor-not-allowed opacity-20'
                                    : 'hover:bg-opacity-5'
                                    }`}
                                style={step === 1 ? { color: 'var(--text-auth-placeholder)' } : { color: 'var(--text-auth-muted)' }}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back
                            </button>

                            <button
                                onClick={
                                    step === 3 ? (isStepValid() ? () => {
                                        // Pre-fill email if already known (returning user or profile loaded)
                                        setTempEmail(formData.email || "");
                                        setEmailError("");
                                        setShowEmailModal(true);
                                    } : () => alert("Please fill mandatory fields.")) :
                                        handleNext
                                }
                                disabled={loading || otpModalState.loading}
                                className="relative overflow-hidden bg-white text-brand-dark px-5 py-2.5 md:px-7 md:py-3 rounded-xl font-bold flex items-center shadow-lg hover:shadow-white/20 transition-all disabled:opacity-70 disabled:cursor-wait text-sm md:text-base"
                                style={{
                                    backgroundColor: 'var(--btn-primary-bg)',
                                    color: 'var(--btn-primary-text)'
                                }}
                            >
                                <span className="relative z-10 flex items-center">
                                    {loading ? 'Computing...' :
                                        (step === 1 || step === 2) ? 'Next' :
                                            step === 3 ? 'Analyze My Needs' : 'Next'
                                    }
                                    {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Email Intercept Modal purely triggered from Step 3 */}
            <AnimatePresence>
                {showEmailModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowEmailModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md p-6 rounded-3xl shadow-2xl overflow-hidden"
                            style={{
                                backgroundColor: 'var(--bg-auth-card)',
                                borderColor: 'var(--border-auth-card)',
                                border: '1px solid'
                            }}
                        >
                            <div className="text-center space-y-4 mb-6 relative z-10">
                                <div className="w-16 h-16 rounded-full bg-brand-primary/20 flex items-center justify-center mx-auto mb-2">
                                    <Sparkles className="w-8 h-8 text-brand-primary" />
                                </div>
                                <h3 className="text-2xl font-bold" style={{ color: 'var(--text-auth-primary)' }}>
                                    Where should we send your results?
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--text-auth-muted)' }}>
                                    We'll instantly calculate your unique insurance portrait.
                                </p>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div>
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={tempEmail}
                                        onChange={(e) => setTempEmail(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
                                        className="w-full text-center p-4 border rounded-xl focus:ring-2 focus:ring-brand-accent outline-none font-medium transition-all"
                                        style={{
                                            backgroundColor: 'var(--bg-auth-input)',
                                            borderColor: emailError ? '#ef4444' : 'var(--border-auth-card)',
                                            color: 'var(--text-auth-primary)'
                                        }}
                                        autoFocus
                                    />
                                    {emailError && <p className="text-red-400 text-xs mt-2 text-center font-semibold">{emailError}</p>}
                                </div>

                                <button
                                    onClick={handleEmailSubmit}
                                    className="w-full relative overflow-hidden bg-white text-brand-dark px-5 py-4 rounded-xl font-bold flex justify-center items-center shadow-lg hover:shadow-white/20 transition-all text-base"
                                    style={{
                                        backgroundColor: 'var(--btn-primary-bg)',
                                        color: 'var(--btn-primary-text)'
                                    }}
                                >
                                    Reveal My Plan <ArrowRight className="w-4 h-4 ml-2" />
                                </button>
                                
                                <button
                                    onClick={() => setShowEmailModal(false)}
                                    className="w-full mt-2 text-xs font-semibold hover:underline"
                                    style={{ color: 'var(--text-auth-muted)' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <OTPModal 
                show={otpModalState.show}
                email={formData.email || tempEmail}
                loading={otpModalState.loading}
                error={otpModalState.error}
                onVerify={handleVerifyOtp}
                onClose={() => setOtpModalState(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
}
