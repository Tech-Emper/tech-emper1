import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Heart, Shield, ArrowLeft, ArrowRight, TrendingUp, Info, Sparkles, User, Lock, Unlock } from 'lucide-react';
import Step09_ProductRecommendations from './steps/Step09_ProductRecommendations';
import { API_BASE_URL } from '../config';

const STEPS = {
    UPLOAD: 'UPLOAD',
    EXTRACTING: 'EXTRACTING',
    REVIEW: 'REVIEW',
    MISSING_INFO: 'MISSING_INFO',
    REPORT: 'REPORT',
    RECOMMENDATIONS: 'RECOMMENDATIONS'
};

export default function ReverseGapFlow({ onBack }) {
    const [step, setStep] = useState(STEPS.UPLOAD);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState({
        first_name: '',
        dob: '',
        gender: '',
        city: '',
        income_level: '',
        smoking_status: '',
        marital_status: 'Single',
        lifestyle: '',
        career_stage: 'Starting Out',
        num_children: 0,
        support_parents: false
    });
    const [idealRec, setIdealRec] = useState(null);
    const [extractionSummary, setExtractionSummary] = useState({
        total_life: 0,
        total_health: 0,
        policy_count: 0
    });
    const [extractedFields, setExtractedFields] = useState([]);
    const [filePasswords, setFilePasswords] = useState({}); // { filename: 'pwd' }

    const { user, logout } = useAuth();
    const token = user?.token;

    useEffect(() => {
        // Pre-fetch profile if it exists
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setProfile(prev => ({ ...prev, ...data }));
            }
        } catch (err) {
            console.error("Failed to fetch profile", err);
        }
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        // Optimization: Filter to only send files that aren't already successfully processed
        const successfullyProcessed = extractionSummary.results?.filter(r => r.is_valid_policy && !r.is_locked).map(r => r.filename) || [];
        const filesToUpload = files.filter(f => !successfullyProcessed.includes(f.name));

        if (filesToUpload.length === 0) return;

        setStep(STEPS.EXTRACTING);
        setLoading(true);
        setError(null);

        const formData = new FormData();
        filesToUpload.forEach(file => formData.append('files', file));
        if (Object.keys(filePasswords).length > 0) {
            formData.append('passwords', JSON.stringify(filePasswords));
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/policy/extract-multiple`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.status === 401) {
                logout();
                return;
            }
            if (!response.ok) throw new Error('Extraction failed');

            const data = await response.json();

            // Merge newly extracted results with existing successful ones
            const existingSuccessful = extractionSummary.results?.filter(r => r.is_valid_policy && !r.is_locked) || [];
            const mergedResults = [...existingSuccessful];

            data.results.forEach(newRes => {
                const idx = mergedResults.findIndex(r => r.filename === newRes.filename);
                if (idx > -1) {
                    mergedResults[idx] = newRes;
                } else {
                    mergedResults.push(newRes);
                }
            });

            setResults(mergedResults);

            // Calculate totals from merged results
            let life = 0;
            let health = 0;
            mergedResults.forEach(r => {
                if (r.is_valid_policy && !r.is_locked) {
                    if (r.policy_type === 'LIFE') {
                        life += r.coverage_amount_val;
                    } else if (r.policy_type === 'HEALTH') {
                        health += r.coverage_amount_val;
                    }
                }
            });

            const newExtractionSummary = {
                total_life: life,
                total_health: health,
                policy_count: mergedResults.filter(r => r.is_valid_policy && !r.is_locked).length,
                show_debug: data.show_debug,
                results: mergedResults
            };
            setExtractionSummary(newExtractionSummary);

            // Update profile with hints aggregated from all successful results
            const aggHints = {
                full_name: mergedResults.find(r => r.user_hint?.full_name)?.user_hint.full_name,
                dob: mergedResults.find(r => r.user_hint?.dob)?.user_hint.dob,
                gender: mergedResults.find(r => r.user_hint?.gender)?.user_hint.gender,
                city: mergedResults.find(r => r.user_hint?.city)?.user_hint.city,
                marital_status: mergedResults.find(r => r.user_hint?.marital_status)?.user_hint.marital_status,
                num_children: mergedResults.find(r => r.user_hint?.num_children !== undefined && r.user_hint?.num_children !== null)?.user_hint.num_children
            };

            const found = [];
            if (aggHints.full_name) found.push('first_name');
            if (aggHints.dob) found.push('dob');
            if (aggHints.gender) found.push('gender');
            if (aggHints.city) found.push('city');
            if (aggHints.marital_status) found.push('marital_status');
            if (aggHints.num_children !== undefined && aggHints.num_children !== null) found.push('num_children');
            setExtractedFields(found);

            const updatedProfile = {
                ...profile,
                first_name: aggHints.full_name || profile.first_name,
                dob: aggHints.dob || profile.dob,
                gender: aggHints.gender || profile.gender,
                city: aggHints.city || profile.city,
                marital_status: aggHints.marital_status || profile.marital_status,
                num_children: aggHints.num_children !== undefined && aggHints.num_children !== null ? aggHints.num_children : profile.num_children
            };
            setProfile(updatedProfile);

            // Sync with backend
            await fetch(`${API_BASE_URL}/api/user/sync-profile`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    first_name: updatedProfile.first_name,
                    dob: updatedProfile.dob,
                    gender: updatedProfile.gender,
                    city: updatedProfile.city,
                    marital_status: updatedProfile.marital_status,
                    num_children: updatedProfile.num_children,
                    income_level: updatedProfile.income_level,
                    smoking_status: updatedProfile.smoking_status,
                    lifestyle: updatedProfile.lifestyle,
                    existing_life_cover_val: life,
                    existing_health_cover_val: health
                })
            });

            setStep(STEPS.REVIEW);
        } catch (err) {
            setError(err.message);
            setStep(STEPS.REVIEW);
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Prepare UserData for recommend API
            // Note: We need to map our simple state to the UserData schema
            const userData = {
                ...profile,
                is_smoker: profile.smoking_status === 'Regularly' || profile.smoking_status === 'Occasionally',
                dependents: {
                    "Spouse": profile.marital_status === 'Married',
                    "Children": profile.num_children > 0
                }
            };

            // 1. Sync all fields to DB first to ensure persistence
            await fetch(`${API_BASE_URL}/api/user/sync-profile`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    first_name: profile.first_name,
                    dob: profile.dob,
                    gender: profile.gender,
                    city: profile.city,
                    marital_status: profile.marital_status,
                    num_children: profile.num_children,
                    income_level: profile.income_level,
                    smoking_status: profile.smoking_status,
                    lifestyle: profile.lifestyle,
                    existing_life_cover_val: extractionSummary.total_life,
                    existing_health_cover_val: extractionSummary.total_health
                })
            });

            // 2. Get recommendations
            const response = await fetch(`${API_BASE_URL}/api/recommend`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (response.status === 401) {
                logout();
                return;
            }
            if (!response.ok) throw new Error('Recommendation failed');
            const data = await response.json();
            setIdealRec(data);
            setStep(STEPS.REPORT);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val) => {
        if (!val) return "₹0";
        if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
        if (val >= 100000) return `₹${(val / 100000).toFixed(0)} Lakh`;
        return `₹${val.toLocaleString('en-IN')}`;
    };

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-6 md:py-10">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest mb-8 hover:text-brand-accent transition-colors"
                style={{ color: 'var(--text-auth-muted)' }}
            >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>

            <AnimatePresence mode="wait">
                {step === STEPS.UPLOAD && (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-2xl mx-auto backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border shadow-2xl"
                        style={{ backgroundColor: 'var(--bg-auth-card)', borderColor: 'var(--border-auth-card)' }}
                    >
                        <div className="text-center mb-10">
                            <div className="w-20 h-20 bg-brand-accent/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <TrendingUp className="w-10 h-10 text-brand-accent" />
                            </div>
                            <h2 className="text-3xl font-black mb-3" style={{ color: 'var(--text-auth-primary)' }}>Policy Gap Analysis</h2>
                            <p style={{ color: 'var(--text-auth-muted)' }}>Upload your current policies to see if you are adequately covered.</p>
                        </div>

                        <div className="space-y-6">
                            <label className="block p-10 border-2 border-dashed rounded-[2rem] cursor-pointer hover:bg-white/5 transition-all text-center group"
                                style={{ borderColor: 'var(--border-auth-card)' }}>
                                <input type="file" multiple onChange={handleFileChange} className="hidden" accept=".pdf,image/*" />
                                <div className="flex flex-col items-center gap-4">
                                    <div className="p-4 rounded-2xl group-hover:scale-110 transition-transform" style={{ backgroundColor: 'var(--bg-auth-input)' }}>
                                        <FileText className="w-8 h-8 opacity-50" style={{ color: 'var(--text-auth-primary)' }} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg" style={{ color: 'var(--text-auth-primary)' }}>
                                            {files.length > 0 ? `${files.length} files selected` : 'Drop Policies Here'}
                                        </p>
                                        <p className="text-xs mt-1" style={{ color: 'var(--text-auth-placeholder)' }}>We'll extract your coverage and profile automatically</p>
                                    </div>
                                </div>
                            </label>

                            <button
                                onClick={handleUpload}
                                disabled={loading || files.length === 0}
                                className="w-full bg-gradient-to-r from-brand-accent to-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
                            >
                                Start Analysis
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === STEPS.EXTRACTING && (
                    <motion.div key="extracting" className="text-center py-20">
                        <Loader2 className="w-16 h-16 text-brand-accent animate-spin mx-auto mb-8" />
                        <h2 className="text-4xl font-black mb-4" style={{ color: 'var(--text-auth-primary)' }}>Scanning Your Policies...</h2>
                        <p style={{ color: 'var(--text-auth-muted)' }}>We are extracting coverage amounts and policyholder details.</p>
                    </motion.div>
                )}

                {step === STEPS.REVIEW && (
                    <motion.div key="review" className="space-y-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--text-auth-primary)' }}>We Found Your Details!</h2>
                            <p style={{ color: 'var(--text-auth-muted)' }}>We detected {extractionSummary.policy_count} valid policies.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 md:p-8 backdrop-blur-xl rounded-3xl border text-center" style={{ backgroundColor: 'var(--bg-auth-card)', borderColor: 'var(--border-auth-card)' }}>
                                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-auth-placeholder)' }}>Current Life Cover</p>
                                <p className="text-3xl font-black text-brand-accent">{formatCurrency(extractionSummary.total_life)}</p>
                            </div>
                            <div className="p-6 md:p-8 backdrop-blur-xl rounded-3xl border text-center" style={{ backgroundColor: 'var(--bg-auth-card)', borderColor: 'var(--border-auth-card)' }}>
                                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-auth-placeholder)' }}>Current Health Cover</p>
                                <p className="text-3xl font-black text-brand-accent">{formatCurrency(extractionSummary.total_health)}</p>
                            </div>
                            <div className="p-6 md:p-8 backdrop-blur-xl rounded-3xl border text-center" style={{ backgroundColor: 'var(--bg-auth-card)', borderColor: 'var(--border-auth-card)' }}>
                                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-auth-placeholder)' }}>Name Detected</p>
                                <p className="text-3xl font-black" style={{ color: 'var(--text-auth-primary)' }}>{profile.first_name || 'N/A'}</p>
                            </div>
                        </div>

                        {extractionSummary.results?.some(r => r.is_locked) && (
                            <div className="p-8 rounded-[2.5rem] border border-amber-500/30 bg-amber-500/5 backdrop-blur-md">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-amber-500/20 rounded-xl">
                                        <Lock className="w-6 h-6 text-amber-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl" style={{ color: 'var(--text-auth-primary)' }}>Locked Documents</h3>
                                        <p className="text-sm opacity-70">Some policies need a password to be analyzed.</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {extractionSummary.results.filter(r => r.is_locked).map((res, i) => (
                                        <div key={i} className="flex flex-col md:flex-row items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                            <div className="flex-1 flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-amber-500" />
                                                <span className="font-bold text-sm truncate max-w-[200px]">{res.filename}</span>
                                            </div>
                                            <div className="flex items-center gap-2 w-full md:w-auto">
                                                <input
                                                    type="password"
                                                    placeholder="Enter password"
                                                    value={filePasswords[res.filename] || ''}
                                                    onChange={(e) => setFilePasswords({ ...filePasswords, [res.filename]: e.target.value })}
                                                    className="w-full md:w-48 bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-amber-500 transition-all font-mono"
                                                />
                                                <button
                                                    onClick={handleUpload}
                                                    className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all shadow-lg"
                                                    title="Decrypt & Retry"
                                                >
                                                    <Unlock className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center flex-col items-center gap-4">
                            <p className="text-sm opacity-70">To confirm your gap, we need a few more life details.</p>
                            <button
                                onClick={() => setStep(STEPS.MISSING_INFO)}
                                className="px-10 py-5 hover:opacity-80 rounded-2xl font-black flex items-center gap-3 transition-all"
                                style={{
                                    color: 'var(--text-auth-primary)',
                                    background: 'var(--bg-auth-input)',
                                    border: '1px solid var(--border-auth-card)'
                                }}
                            >
                                Complete My Profile <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>

                        {extractionSummary.show_debug && extractionSummary.results && (
                            <div className="mt-12 pt-8 border-t space-y-4" style={{ borderTopColor: 'var(--border-auth-card)' }}>
                                <p className="text-[10px] font-black uppercase tracking-widest text-center" style={{ color: 'var(--text-auth-placeholder)' }}>Debug: Extraction Prompts</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {extractionSummary.results.map((res, i) => (
                                        <div key={i} className="p-4 rounded-xl border text-[9px] font-mono overflow-auto max-h-40"
                                            style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)' }}>
                                            <div className="flex justify-between items-center mb-2 pb-2 border-b" style={{ borderBottomColor: 'var(--border-auth-card)' }}>
                                                <span className="font-black uppercase tracking-tighter text-blue-400">Prompt for: {res.filename}</span>
                                            </div>
                                            <pre className="whitespace-pre-wrap opacity-70" style={{ color: 'var(--text-auth-primary)' }}>{res.prompt_sent}</pre>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {step === STEPS.MISSING_INFO && (
                    <motion.div key="form"
                        className="max-w-4xl mx-auto backdrop-blur-xl rounded-[3rem] p-8 md:p-12 border shadow-3xl"
                        style={{ backgroundColor: 'var(--bg-auth-card)', borderColor: 'var(--border-auth-card)' }}
                    >
                        <div className="mb-10 text-center">
                            <div className="bg-brand-accent/10 border border-brand-accent/20 px-4 py-1.5 rounded-full inline-flex items-center gap-2 mb-4">
                                <Sparkles className="w-4 h-4 text-brand-accent" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent">Confirm Your AI-Extracted Profile</span>
                            </div>
                            <h2 className="text-3xl font-black mb-3" style={{ color: 'var(--text-auth-primary)' }}>Final Details</h2>
                            <p style={{ color: 'var(--text-auth-muted)' }}>We've pre-filled what we found. Please review and complete the rest.</p>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-8">
                            {/* Personal Details Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="flex items-center justify-between px-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-auth-label)' }}>Full Name</span>
                                        {extractedFields.includes('first_name') && <Sparkles className="w-3 h-3 text-brand-accent animate-pulse" />}
                                    </label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 group-focus-within:opacity-100 transition-opacity" style={{ color: 'var(--text-auth-primary)' }} />
                                        <input
                                            type="text"
                                            value={profile.first_name}
                                            onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                                            placeholder="Enter your name"
                                            className={`w-full border rounded-2xl p-4 pl-12 focus:border-brand-accent outline-none font-bold transition-all ${extractedFields.includes('first_name') ? 'border-brand-accent/30' : ''}`}
                                            style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: extractedFields.includes('first_name') ? 'var(--brand-accent)' : 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center justify-between px-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-auth-label)' }}>Date of Birth</span>
                                        {extractedFields.includes('dob') && <Sparkles className="w-3 h-3 text-brand-accent animate-pulse" />}
                                    </label>
                                    <input
                                        type="date"
                                        value={profile.dob}
                                        onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                                        className={`w-full border rounded-2xl p-4 focus:border-brand-accent outline-none font-bold transition-all ${extractedFields.includes('dob') ? 'border-brand-accent/30' : ''}`}
                                        style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: extractedFields.includes('dob') ? 'var(--brand-accent)' : 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="flex items-center justify-between px-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-auth-label)' }}>Gender</span>
                                        {extractedFields.includes('gender') && <Sparkles className="w-3 h-3 text-brand-accent animate-pulse" />}
                                    </label>
                                    <select
                                        value={profile.gender}
                                        onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                                        className={`w-full border rounded-2xl p-4 focus:border-brand-accent outline-none font-bold transition-all ${extractedFields.includes('gender') ? 'border-brand-accent/30' : ''}`}
                                        style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: extractedFields.includes('gender') ? 'var(--brand-accent)' : 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }}
                                    >
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center justify-between px-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-auth-label)' }}>City</span>
                                        {extractedFields.includes('city') && <Sparkles className="w-3 h-3 text-brand-accent animate-pulse" />}
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.city}
                                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                                        placeholder="e.g. Mumbai"
                                        className={`w-full border rounded-2xl p-4 focus:border-brand-accent outline-none font-bold transition-all ${extractedFields.includes('city') ? 'border-brand-accent/30' : ''}`}
                                        style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: extractedFields.includes('city') ? 'var(--brand-accent)' : 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center justify-between px-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-auth-label)' }}>Marital Status</span>
                                        {extractedFields.includes('marital_status') && <Sparkles className="w-3 h-3 text-brand-accent animate-pulse" />}
                                    </label>
                                    <select
                                        value={profile.marital_status}
                                        onChange={(e) => setProfile({ ...profile, marital_status: e.target.value })}
                                        className={`w-full border rounded-2xl p-4 focus:border-brand-accent outline-none font-bold transition-all ${extractedFields.includes('marital_status') ? 'border-brand-accent/30' : ''}`}
                                        style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: extractedFields.includes('marital_status') ? 'var(--brand-accent)' : 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }}
                                    >
                                        <option value="Single">Single</option>
                                        <option value="Married">Married</option>
                                    </select>
                                </div>
                            </div>

                            {/* Lifestyle & Financials Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t" style={{ borderTopColor: 'var(--border-auth-card)' }}>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest ml-2" style={{ color: 'var(--text-auth-label)' }}>Monthly Income</label>
                                    <select
                                        value={profile.income_level}
                                        onChange={(e) => setProfile({ ...profile, income_level: e.target.value })}
                                        required
                                        className="w-full border rounded-2xl p-4 focus:border-brand-accent outline-none font-bold transition-colors"
                                        style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }}
                                    >
                                        <option value="">Select Range</option>
                                        <option value="Below 5 Lakhs">Below ₹5 Lakhs</option>
                                        <option value="5-10 Lakhs">₹5 - ₹10 Lakhs</option>
                                        <option value="10-25 Lakhs">₹10 - ₹25 Lakhs</option>
                                        <option value="25-50 Lakhs">₹25 - ₹50 Lakhs</option>
                                        <option value="Above 50 Lakhs">Above ₹50 Lakhs</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest ml-2" style={{ color: 'var(--text-auth-label)' }}>Lifestyle Habit</label>
                                    <select
                                        value={profile.smoking_status}
                                        onChange={(e) => setProfile({ ...profile, smoking_status: e.target.value })}
                                        className="w-full border rounded-2xl p-4 focus:border-brand-accent outline-none font-bold transition-colors"
                                        style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }}
                                    >
                                        <option value="">Select</option>
                                        <option value="Never">Non-Smoker</option>
                                        <option value="Occasionally">Occasional Smoker</option>
                                        <option value="Regularly">Regular Smoker</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest ml-2" style={{ color: 'var(--text-auth-label)' }}>Activity Level</label>
                                    <select
                                        value={profile.lifestyle}
                                        onChange={(e) => setProfile({ ...profile, lifestyle: e.target.value })}
                                        className="w-full border rounded-2xl p-4 focus:border-brand-accent outline-none font-bold transition-colors"
                                        style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }}
                                    >
                                        <option value="">Select</option>
                                        <option value="Sedentary">Sedentary (Office Work)</option>
                                        <option value="Active">Active (Exercise/Field Work)</option>
                                        <option value="Extreme">Extreme (Physical/Adventure)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center justify-between px-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-auth-label)' }}>Number of Children</span>
                                        {extractedFields.includes('num_children') && <Sparkles className="w-3 h-3 text-brand-accent animate-pulse" />}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={profile.num_children}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setProfile({ ...profile, num_children: isNaN(val) ? 0 : Math.max(0, val) });
                                        }}
                                        className={`w-full border rounded-2xl p-4 focus:border-brand-accent outline-none font-bold transition-all ${extractedFields.includes('num_children') ? 'border-brand-accent/30' : ''}`}
                                        style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: extractedFields.includes('num_children') ? 'var(--brand-accent)' : 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-brand-accent to-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl hover:scale-[1.02] flex items-center justify-center gap-3 transition-all mt-6"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                    <>
                                        Compare My Coverage <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                )}

                {step === STEPS.REPORT && idealRec && (
                    <motion.div key="report" className="space-y-10">
                        <div className="text-center">
                            <h2 className="text-4xl font-black mb-2" style={{ color: 'var(--text-auth-primary)' }}>Your Gap Report</h2>
                            <p style={{ color: 'var(--text-auth-muted)' }}>Powered by Gemini 1.5 Analysis</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Life Gap Card */}
                            <div className="backdrop-blur-xl rounded-[2.5rem] p-10 border border-brand-accent/30 bg-brand-accent/5 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Heart className="w-32 h-32" />
                                </div>
                                <h3 className="text-xl font-black mb-10 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-brand-accent" /> Life Coverage Analysis
                                </h3>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <p className="text-sm font-bold opacity-60">Ideal Need</p>
                                        <p className="text-2xl font-black">{idealRec.life_cover}</p>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <p className="text-sm font-bold opacity-60">Your Current</p>
                                        <p className="text-2xl font-bold opacity-60">{formatCurrency(extractionSummary.total_life)}</p>
                                    </div>
                                    <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, (extractionSummary.total_life / idealRec.life_cover_val) * 100)}%` }}
                                            className="h-full bg-brand-accent"
                                        />
                                    </div>

                                    {extractionSummary.total_life < idealRec.life_cover_val ? (
                                        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                            <p className="text-red-400 font-bold mb-1 uppercase tracking-widest text-[10px]">Gap Detected</p>
                                            <p className="text-2xl font-black text-red-500">{formatCurrency(idealRec.life_cover_val - extractionSummary.total_life)} Missing</p>
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl">
                                            <p className="text-green-400 font-bold mb-1 uppercase tracking-widest text-[10px]">Fully Covered</p>
                                            <p className="text-2xl font-black text-green-500">You are safe!</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Health Gap Card */}
                            <div className="backdrop-blur-xl rounded-[2.5rem] p-10 border border-indigo-500/30 bg-indigo-500/5 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Shield className="w-32 h-32" />
                                </div>
                                <h3 className="text-xl font-black mb-10 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-indigo-400" /> Health Coverage Analysis
                                </h3>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <p className="text-sm font-bold opacity-60">Ideal Need</p>
                                        <p className="text-2xl font-black">{idealRec.health_cover}</p>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <p className="text-sm font-bold opacity-60">Your Current</p>
                                        <p className="text-2xl font-bold opacity-60">{formatCurrency(extractionSummary.total_health)}</p>
                                    </div>
                                    <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, (extractionSummary.total_health / idealRec.health_cover_val) * 100)}%` }}
                                            className="h-full bg-indigo-400"
                                        />
                                    </div>

                                    {extractionSummary.total_health < idealRec.health_cover_val ? (
                                        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                            <p className="text-red-400 font-bold mb-1 uppercase tracking-widest text-[10px]">Gap Detected</p>
                                            <p className="text-2xl font-black text-red-500">{formatCurrency(idealRec.health_cover_val - extractionSummary.total_health)} Missing</p>
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl">
                                            <p className="text-green-400 font-bold mb-1 uppercase tracking-widest text-[10px]">Fully Covered</p>
                                            <p className="text-2xl font-black text-green-500">You are safe!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-6 pt-10">
                            {((idealRec.life_cover_val > extractionSummary.total_life) || (idealRec.health_cover_val > extractionSummary.total_health)) ? (
                                <button
                                    onClick={() => setStep(STEPS.RECOMMENDATIONS)}
                                    className="group relative bg-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black text-xl shadow-[0_0_50px_rgba(99,102,241,0.2)] hover:shadow-[0_0_80px_rgba(99,102,241,0.4)] transition-all hover:scale-105 active:scale-95 overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center gap-3">
                                        Fix My Gaps <Sparkles className="w-6 h-6 text-white animate-pulse" />
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                </button>
                            ) : (
                                <button
                                    onClick={onBack}
                                    className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-black hover:bg-white/10 transition-all flex items-center gap-3"
                                >
                                    Return to Dashboard <ArrowRight className="w-5 h-5" />
                                </button>
                            )}
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">AI GAP ANALYSIS COMPLETE</p>
                        </div>
                    </motion.div>
                )}

                {step === STEPS.RECOMMENDATIONS && (
                    <Step09_ProductRecommendations
                        formData={{
                            ...profile,
                            has_life_insurance: extractionSummary.total_life > 0,
                            existing_life_cover_val: extractionSummary.total_life,
                            has_health_insurance: extractionSummary.total_health > 0,
                            existing_health_cover_val: extractionSummary.total_health
                        }}
                        gapResult={idealRec}
                        onComplete={() => onBack()}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
