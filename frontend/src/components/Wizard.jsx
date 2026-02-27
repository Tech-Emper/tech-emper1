import React, { useState, useEffect, useRef } from 'react';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { API_BASE_URL } from '../config';
import { ArrowRight, ArrowLeft, Shield, Briefcase, User, Heart, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

import Step01_Splash from './steps/Step01_Splash';
import Step02_LifeStage from './steps/Step02_LifeStage';
import Step03_CareerStage from './steps/Step03_CareerStage';
import Step04_FinancialReality from './steps/Step04_FinancialReality';
import Step05_HealthSnapshot from './steps/Step05_HealthSnapshot';
import Step05_Results from './steps/Step05_Results';
import Step06_ExistingCoverage from './steps/Step06_ExistingCoverage';
import Step07_ExistingPolicyDetails from './steps/Step07_ExistingPolicyDetails';
import Step09_ProductRecommendations from './steps/Step09_ProductRecommendations';
import Dashboard from './Dashboard';

export default function Wizard({ onBack }) {
    const themeStyles = useThemeStyles();
    const { profile, recommendations, refreshProfile, loading: authLoading } = useAuth();
    const [step, setStep] = useState(1);
    const hasInitialized = useRef(false);
    const [formData, setFormData] = useState({
        first_name: "",
        city: "",
        mobile: "",
        marital_status: "Single",
        num_children: 0,
        support_parents: false,
        dob: "",
        career_stage: "Launch Pad",
        income_level: "₹5-7.5 lakhs - Standard Tier",
        employment_type: "Salaried (MNC/Large)",
        company_name: "",
        industry_type: "",
        smoking_status: "Never",
        family_health_history: ["No significant history"],
        lifestyle: "Moderately Active",
        gender: "", // Default
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

    // Initial sync from global profile
    useEffect(() => {
        if (!authLoading && profile) {
            setFormData(prev => ({ ...prev, ...profile }));

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
            return (
                formData.first_name?.trim() !== "" &&
                formData.city !== "" &&
                formData.mobile?.length === 10 &&
                formData.gender !== ""
            );
        }
        if (stepToCheck === 2) {
            return formData.dob !== "";
        }
        if (stepToCheck === 3) {
            return formData.career_stage !== "";
        }
        if (stepToCheck === 4) {
            return (
                formData.income_level !== "" &&
                formData.company_name?.trim() !== "" &&
                formData.industry_type !== ""
            );
        }
        if (stepToCheck === 5) {
            return (
                formData.smoking_status !== "" &&
                formData.lifestyle !== ""
            );
        }
        if (stepToCheck === 7) {
            const lifeValid = !formData.has_life_insurance || (formData.existing_life_cover_val > 0);
            const healthValid = !formData.has_health_insurance || (formData.existing_health_cover_val > 0);
            const parentsValid = !formData.parents_covered || (formData.parents_health_cover_val > 0);
            return lifeValid && healthValid && parentsValid;
        }
        if (stepToCheck === 8) {
            const lifeValid = !formData.has_life_insurance || (
                (formData.life_provider === 'Other' ? formData.life_provider_custom?.trim() : formData.life_provider) &&
                (formData.life_policy_name === 'Other' ? formData.life_policy_name_custom?.trim() : formData.life_policy_name)
            );
            const healthValid = !formData.has_health_insurance || (
                (formData.health_provider === 'Other' ? formData.health_provider_custom?.trim() : formData.health_provider) &&
                (formData.health_policy_name === 'Other' ? formData.health_policy_name_custom?.trim() : formData.health_policy_name)
            );
            return lifeValid && healthValid;
        }
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

    const fetchRecommendation = async () => {
        setLoading(true);
        try {
            // Prep dependents for calculation
            const updatedDependents = {};
            if (formData.marital_status === "Married") updatedDependents["Spouse"] = true;
            if (formData.num_children > 0) updatedDependents["Children"] = true;
            if (formData.support_parents) updatedDependents["Parents"] = true;

            const finalPayload = {
                ...formData,
                is_smoker: formData.smoking_status !== "Never",
                dependents: updatedDependents
            };

            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_BASE_URL}/api/recommend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(finalPayload)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    alert("Your session has expired. Please log in again.");
                    localStorage.removeItem('auth_token');
                    window.location.reload();
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to fetch recommendation");
            }

            const data = await response.json();
            setResult(data);
            setHistory(prev => [data, ...prev]);

            const nextStep = 6;
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
        { id: 2, title: "Life", icon: <Heart className="w-5 h-5" /> },
        { id: 3, title: "Career", icon: <Briefcase className="w-5 h-5" /> },
        { id: 4, title: "Reality", icon: <Briefcase className="w-5 h-5" /> },
        { id: 5, title: "Health", icon: <Sparkles className="w-5 h-5" /> },
        { id: 6, title: "Results", icon: <Check className="w-5 h-5" /> },
        { id: 7, title: "Coverage", icon: <Shield className="w-5 h-5" /> },
        { id: 8, title: "History", icon: <Briefcase className="w-5 h-5" /> },
        { id: 9, title: "Match", icon: <Sparkles className="w-5 h-5" /> }
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
            <div className="min-[1200px]:fixed min-[1200px]:top-24 min-[1200px]:left-8 mb-4 min-[1200px]:mb-0 z-50">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-brand-accent transition-all py-2 px-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg hover:scale-105"
                    style={{ color: 'var(--text-auth-muted)' }}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </button>
            </div>

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
                            setStep(7);
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
                        {step === 2 && <Step02_LifeStage key="step2" formData={formData} updateField={updateField} />}
                        {step === 3 && <Step03_CareerStage key="step3" formData={formData} updateField={updateField} />}
                        {step === 4 && <Step04_FinancialReality key="step4" formData={formData} updateField={updateField} />}
                        {step === 5 && <Step05_HealthSnapshot key="step5" formData={formData} updateField={updateField} />}
                        {step === 6 && <Step05_Results key="step6" result={result} formData={formData} />}
                        {step === 7 && <Step06_ExistingCoverage key="step7" formData={formData} updateField={updateField} />}
                        {step === 8 && <Step07_ExistingPolicyDetails key="step8" formData={formData} updateField={updateField} />}
                        {step === 9 && <Step09_ProductRecommendations key="step9" formData={formData} gapResult={result} onComplete={saveSafetyNet} />}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    {step < 9 && (
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
                                    step === 5 ? (isStepValid() ? fetchRecommendation : () => alert("Please fill mandatory fields.")) :
                                        handleNext
                                }
                                disabled={loading}
                                className="relative overflow-hidden bg-white text-brand-dark px-5 py-2.5 md:px-7 md:py-3 rounded-xl font-bold flex items-center shadow-lg hover:shadow-white/20 transition-all disabled:opacity-70 disabled:cursor-wait text-sm md:text-base"
                                style={{
                                    backgroundColor: 'var(--btn-primary-bg)',
                                    color: 'var(--btn-primary-text)'
                                }}
                            >
                                <span className="relative z-10 flex items-center">
                                    {loading ? 'Computing...' :
                                        (step === 1 || step === 2 || step === 3 || step === 7 || step === 9) ? 'Next' :
                                            step === 4 ? 'Continue' :
                                                step === 5 ? 'Analyze My Needs' :
                                                    step === 6 ? 'Identify Gaps' :
                                                        step === 8 ? 'Recommend Plans' : 'Next'
                                    }
                                    {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
