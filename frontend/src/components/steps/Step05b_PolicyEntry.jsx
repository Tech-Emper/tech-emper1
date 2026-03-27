import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, FileText, Plus, Loader2, ChevronDown,
    X, ArrowRight, Shield, Heart, CheckCircle2, Lock, Unlock, SkipForward, CreditCard, Clock, Calendar
} from 'lucide-react';
import StepWrapper from './StepWrapper';
import { API_BASE_URL } from '../../config';
import { walletService } from '../../services/walletService';

// ─── Provider / Policy Data (mirrors Step07) ────────────────────────────────
const PROVIDERS = {
    Life: ['LIC', 'HDFC Life', 'SBI Life', 'ICICI Prudential', 'Max Life'],
    Health: ['Star Health', 'HDFC Ergo', 'Niva Bupa', 'Care Health', 'ICICI Lombard'],
};

const POLICIES = {
    'LIC': ['Jeevan Anand', 'Jeevan Umang', 'Jeevan Lakshya', 'Tech Term', 'Jeevan Labh', 'Bima Jyoti'],
    'HDFC Life': ['Click 2 Protect', 'Sanchay Plus', 'Life Long Advantage', 'Sampoorna Samridhi'],
    'SBI Life': ['eShield Next', 'Smart Shield', 'Smart Platina', 'Saral Insure'],
    'ICICI Prudential': ['iProtect Smart', 'iCare II', 'GIFT Pro', 'Guaranteed Income Plan'],
    'Max Life': ['Smart Secure Plus', 'Smart Wealth Plan', 'Smart Term Plan', 'Critical Illness'],
    'Star Health': ['Family Health Optima', 'Star Comprehensive', 'Senior Citizens Red Carpet', 'Medi Classic'],
    'HDFC Ergo': ['Optima Restore', 'my:health Suraksha', 'Energy', 'Health Wallet'],
    'Niva Bupa': ['ReAssure', 'Health Companion', 'Health Premia', 'GoActive'],
    'Care Health': ['Care Classic', 'Care Supreme', 'Care Advantage', 'Care Freedom'],
    'ICICI Lombard': ['Health Elite', 'Health Shield', 'iHealth', 'Complete Health Insurance'],
};

// ─── Sub-views ───────────────────────────────────────────────────────────────
const VIEW = {
    CHOICE: 'CHOICE',
    UPLOAD: 'UPLOAD',
    EXTRACTING: 'EXTRACTING',
    UPLOAD_RESULT: 'UPLOAD_RESULT',
    MANUAL: 'MANUAL',
    LIST: 'LIST',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtCover = (rupees) => {
    if (!rupees || rupees <= 0) return '₹0';
    if (rupees >= 10000000) return `₹${(rupees / 10000000).toFixed(1)} Cr`;
    if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(0)} L`;
    return `₹${rupees.toLocaleString('en-IN')}`;
};

const EMPTY_FORM = {
    type: 'Life',
    provider: '',
    providerCustom: '',
    policyName: '',
    policyNameCustom: '',
    coverVal: 0,
    policyNumber: '',
    term: 1,
    timeline: '',
    premium: 0
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function Step05b_PolicyEntry({ formData, updateField, onDone }) {
    const [view, setView] = useState(VIEW.CHOICE);
    const [policies, setPolicies] = useState([]);      // accumulated confirmed policies
    const [files, setFiles] = useState([]);
    const [filePasswords, setFilePasswords] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadSummary, setUploadSummary] = useState(null); // { results[], total_life, total_health }
    const [form, setForm] = useState(EMPTY_FORM);

    const token = localStorage.getItem('auth_token');

    // ── Upload flow ──────────────────────────────────────────────────────────
    const handleUpload = async () => {
        if (files.length === 0) return;
        setView(VIEW.EXTRACTING);
        setLoading(true);
        setError(null);

        const fd = new FormData();
        files.forEach(f => fd.append('files', f));
        if (Object.keys(filePasswords).length > 0) {
            fd.append('passwords', JSON.stringify(filePasswords));
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/policy/extract-multiple`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: fd,
            });
            if (!res.ok) throw new Error('Extraction failed. Please try again.');
            const data = await res.json();

            let totalLife = 0, totalHealth = 0;
            const extracted = [];
            (data.results || []).forEach(r => {
                if (!r.is_valid_policy || r.is_locked) return;
                const type = r.policy_type === 'LIFE' ? 'Life' : 'Health';
                const val = r.coverage_amount_val || 0;
                if (type === 'Life') totalLife += val;
                else totalHealth += val;
                extracted.push({ type, provider: r.insurer_name || 'Unknown', policyName: r.plan_name || 'Unknown', coverVal: val, source: 'upload', filename: r.filename });
            });

            setUploadSummary({ results: data.results || [], extracted, total_life: totalLife, total_health: totalHealth });
            setView(VIEW.UPLOAD_RESULT);
        } catch (err) {
            setError(err.message);
            setView(VIEW.UPLOAD);
        } finally {
            setLoading(false);
        }
    };

    const confirmUpload = () => {
        const newPolicies = [...policies, ...(uploadSummary?.extracted || [])];
        setPolicies(newPolicies);
        commitAndDone(newPolicies);
    };

    // ── Manual form ──────────────────────────────────────────────────────────
    const canAddManual = () => {
        const providerOk = form.provider === 'Other' ? form.providerCustom.trim() !== '' : form.provider !== '';
        const policyOk = form.provider === 'Other' ? form.policyNameCustom.trim() !== '' : form.policyName !== '';
        return providerOk && policyOk && form.coverVal > 0 && form.policyNumber.trim() !== '' && form.timeline !== '';
    };

    const addManualPolicy = () => {
        if (!canAddManual()) return;
        const effectiveProvider = form.provider === 'Other' ? form.providerCustom : form.provider;
        const effectivePolicy = form.provider === 'Other' ? form.policyNameCustom : form.policyName;

        // format date from YYYY-MM-DD to DD/MM/YYYY for wallet
        let formattedTimeline = form.timeline;
        if (formattedTimeline && formattedTimeline.includes('-')) {
            const [y, m, d] = formattedTimeline.split('-');
            formattedTimeline = `${d}/${m}/${y}`;
        }

        setPolicies(prev => [...prev, {
            type: form.type,
            provider: effectiveProvider,
            policyName: effectivePolicy,
            coverVal: form.coverVal,
            policyNumber: form.policyNumber,
            term: form.term,
            timeline: formattedTimeline,
            premium: form.premium,
            source: 'manual',
        }]);
        setForm(EMPTY_FORM);
        setView(VIEW.LIST);
    };

    // ── Commit / skip ────────────────────────────────────────────────────────
    const commitAndDone = (finalPolicies) => {
        const lifePols = finalPolicies.filter(p => p.type === 'Life');
        const healthPols = finalPolicies.filter(p => p.type === 'Health');
        const totalLife = lifePols.reduce((s, p) => s + p.coverVal, 0);
        const totalHealth = healthPols.reduce((s, p) => s + p.coverVal, 0);

        const updates = {};

        // Sync with wizard form data
        if (lifePols.length > 0) {
            updates.has_life_insurance = true;
            updates.existing_life_cover_val = totalLife;
            updates.existing_life_cover = fmtCover(totalLife);
            updates.life_provider = lifePols[0].provider;
            updates.life_policy_name = lifePols[0].policyName;
        }
        if (healthPols.length > 0) {
            updates.has_health_insurance = true;
            updates.existing_health_cover_val = totalHealth;
            updates.existing_health_cover = fmtCover(totalHealth);
            updates.health_provider = healthPols[0].provider;
            updates.health_policy_name = healthPols[0].policyName;
        }

        // Apply local updates immediately so UI doesn't lag
        Object.entries(updates).forEach(([k, v]) => updateField(k, v));

        // Sync all policies to Wallet
        finalPolicies.forEach(p => {
            walletService.addPolicy({
                type: p.type.toLowerCase(), // Wallet uses lowercase 'life', 'health'
                company: p.provider || 'Unknown',
                planName: p.policyName || p.filename || 'Unknown Policy',
                sumInsured: p.coverVal || 0,
                policyNumber: p.policyNumber || `AUTO-${Math.floor(Math.random() * 900000) + 100000}`,
                term: p.term || 1,
                timeline: p.timeline || new Date().toLocaleDateString('en-GB'), // DD/MM/YYYY fallback
                premium: p.premium || 0
            });
        });

        onDone(updates);
    };

    const removePolicy = (i) => setPolicies(prev => prev.filter((_, idx) => idx !== i));

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <StepWrapper className="space-y-6 md:space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-block bg-brand-accent/20 border border-brand-accent/30 px-3 py-1 rounded-full mb-1">
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-brand-accent">
                        Your Existing Coverage
                    </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black leading-tight" style={{ color: 'var(--text-auth-primary)' }}>
                    Do you have <span className="text-brand-accent italic">existing policies?</span>
                </h2>
                <p className="text-xs md:text-sm max-w-md mx-auto" style={{ color: 'var(--text-auth-muted)' }}>
                    Add your current coverage so we can calculate your exact gap — or skip if you're starting fresh.
                </p>
            </div>

            <AnimatePresence mode="wait">
                {/* ── CHOICE ─────────────────────────────────────────────── */}
                {view === VIEW.CHOICE && (
                    <motion.div key="choice" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                        className="space-y-4">
                        {/* Upload card */}
                        <button onClick={() => setView(VIEW.UPLOAD)}
                            className="w-full flex items-center gap-5 p-5 rounded-2xl border-2 text-left transition-all hover:border-brand-accent/60 hover:bg-brand-accent/5 group"
                            style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)' }}>
                            <div className="w-12 h-12 rounded-xl bg-brand-accent/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6 text-brand-accent" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-base" style={{ color: 'var(--text-auth-primary)' }}>Upload Policy Document</p>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-auth-muted)' }}>We'll scan your PDF and extract coverage details automatically</p>
                            </div>
                            <ArrowRight className="w-5 h-5 shrink-0 opacity-40 group-hover:opacity-100 group-hover:text-brand-accent transition-all" />
                        </button>

                        {/* Manual card */}
                        <button onClick={() => setView(VIEW.MANUAL)}
                            className="w-full flex items-center gap-5 p-5 rounded-2xl border-2 text-left transition-all hover:border-indigo-500/60 hover:bg-indigo-500/5 group"
                            style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)' }}>
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <Plus className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-base" style={{ color: 'var(--text-auth-primary)' }}>Add Policy Details</p>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-auth-muted)' }}>Pick provider, policy name & cover amount — add as many as you like</p>
                            </div>
                            <ArrowRight className="w-5 h-5 shrink-0 opacity-40 group-hover:opacity-100 group-hover:text-indigo-400 transition-all" />
                        </button>

                        {/* Skip */}
                        <button onClick={() => onDone()}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border font-bold text-sm transition-all hover:bg-white/5"
                            style={{ borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-muted)' }}>
                            <SkipForward className="w-4 h-4" />
                            Skip — I don't have existing coverage
                        </button>
                    </motion.div>
                )}

                {/* ── UPLOAD ─────────────────────────────────────────────── */}
                {view === VIEW.UPLOAD && (
                    <motion.div key="upload" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                        className="space-y-5">
                        {error && (
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400 font-bold">
                                {error}
                            </div>
                        )}
                        <label className="block p-10 border-2 border-dashed rounded-2xl cursor-pointer hover:bg-white/5 transition-all text-center group"
                            style={{ borderColor: 'var(--border-auth-card)' }}>
                            <input type="file" multiple accept=".pdf,image/*"
                                onChange={e => setFiles(Array.from(e.target.files))} className="hidden" />
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-4 rounded-xl group-hover:scale-110 transition-transform" style={{ backgroundColor: 'var(--bg-auth-input)' }}>
                                    <FileText className="w-8 h-8 opacity-50" style={{ color: 'var(--text-auth-primary)' }} />
                                </div>
                                <p className="font-black text-base" style={{ color: 'var(--text-auth-primary)' }}>
                                    {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''} selected` : 'Drop Policy PDFs Here'}
                                </p>
                                <p className="text-xs" style={{ color: 'var(--text-auth-placeholder)' }}>PDF or image — we'll extract coverage automatically</p>
                            </div>
                        </label>

                        <div className="flex gap-3">
                            <button onClick={() => { setView(VIEW.CHOICE); setError(null); setFiles([]); }}
                                className="flex-1 py-3 rounded-xl border font-bold transition-all text-sm"
                                style={{ borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-muted)', backgroundColor: 'var(--bg-auth-input)' }}>
                                ← Back
                            </button>
                            <button onClick={handleUpload} disabled={files.length === 0}
                                className="flex-[2] py-3 rounded-xl font-black text-sm transition-all disabled:opacity-40 bg-brand-accent/90 hover:bg-brand-accent text-white">
                                Extract & Analyse
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ── EXTRACTING ──────────────────────────────────────────── */}
                {view === VIEW.EXTRACTING && (
                    <motion.div key="extracting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-center py-16 space-y-5">
                        <Loader2 className="w-14 h-14 text-brand-accent animate-spin mx-auto" />
                        <p className="text-xl font-black" style={{ color: 'var(--text-auth-primary)' }}>Scanning Your Policies…</p>
                        <p className="text-sm" style={{ color: 'var(--text-auth-muted)' }}>Extracting coverage amounts and provider details</p>
                    </motion.div>
                )}

                {/* ── UPLOAD_RESULT ───────────────────────────────────────── */}
                {view === VIEW.UPLOAD_RESULT && uploadSummary && (
                    <motion.div key="upload_result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                        className="space-y-5">
                        {/* Locked files */}
                        {uploadSummary.results.some(r => r.is_locked) && (
                            <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-amber-500" />
                                    <p className="font-black text-sm" style={{ color: 'var(--text-auth-primary)' }}>Some files need a password</p>
                                </div>
                                {uploadSummary.results.filter(r => r.is_locked).map((r, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                                        <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                                        <span className="text-xs font-bold truncate flex-1" style={{ color: 'var(--text-auth-muted)' }}>{r.filename}</span>
                                        <input type="password" placeholder="Password"
                                            value={filePasswords[r.filename] || ''}
                                            onChange={e => setFilePasswords({ ...filePasswords, [r.filename]: e.target.value })}
                                            className="w-32 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-amber-500"
                                            style={{ color: 'var(--text-auth-primary)' }} />
                                        <button onClick={handleUpload} className="p-1.5 bg-amber-500 rounded-lg">
                                            <Unlock className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Extracted summary cards */}
                        {uploadSummary.extracted.length > 0 ? (
                            <div className="space-y-3">
                                <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-auth-placeholder)' }}>
                                    {uploadSummary.extracted.length} polic{uploadSummary.extracted.length > 1 ? 'ies' : 'y'} extracted
                                </p>
                                {uploadSummary.extracted.map((p, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border"
                                        style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)' }}>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${p.type === 'Life' ? 'bg-pink-500/20' : 'bg-blue-500/20'}`}>
                                            {p.type === 'Life' ? <Heart className="w-5 h-5 text-pink-400" /> : <Shield className="w-5 h-5 text-blue-400" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-sm truncate" style={{ color: 'var(--text-auth-primary)' }}>{p.policyName}</p>
                                            <p className="text-xs truncate" style={{ color: 'var(--text-auth-muted)' }}>{p.provider} · {p.type}</p>
                                        </div>
                                        <p className="font-black text-brand-accent text-sm shrink-0">{fmtCover(p.coverVal)}</p>
                                    </div>
                                ))}

                                {/* Totals */}
                                <div className="grid grid-cols-2 gap-3 pt-1">
                                    {uploadSummary.total_life > 0 && (
                                        <div className="p-4 rounded-2xl text-center bg-pink-500/10 border border-pink-500/20">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-pink-400 mb-1">Total Life</p>
                                            <p className="text-xl font-black" style={{ color: 'var(--text-auth-primary)' }}>{fmtCover(uploadSummary.total_life)}</p>
                                        </div>
                                    )}
                                    {uploadSummary.total_health > 0 && (
                                        <div className="p-4 rounded-2xl text-center bg-blue-500/10 border border-blue-500/20">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Total Health</p>
                                            <p className="text-xl font-black" style={{ color: 'var(--text-auth-primary)' }}>{fmtCover(uploadSummary.total_health)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 rounded-2xl border border-dashed" style={{ borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-muted)' }}>
                                <p className="font-bold">No valid policies detected</p>
                                <p className="text-xs mt-1">Try uploading a different file or add details manually</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button onClick={() => { setView(VIEW.UPLOAD); setUploadSummary(null); }}
                                className="flex-1 py-3 rounded-xl border font-bold text-sm"
                                style={{ borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-muted)', backgroundColor: 'var(--bg-auth-input)' }}>
                                ← Try Again
                            </button>
                            <button onClick={confirmUpload}
                                className="flex-[2] py-3 rounded-xl font-black text-sm bg-brand-accent text-white flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Confirm & Continue
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ── MANUAL FORM ──────────────────────────────────────────── */}
                {view === VIEW.MANUAL && (
                    <motion.div key="manual" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                        className="space-y-5">
                        {/* Type toggle */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-auth-placeholder)' }}>Policy Type</p>
                            <div className="grid grid-cols-2 gap-3">
                                {['Life', 'Health'].map(t => (
                                    <button key={t} onClick={() => setForm({ ...form, type: t, provider: '', policyName: '', providerCustom: '', policyNameCustom: '' })}
                                        className={`py-3 rounded-xl border font-black text-sm transition-all ${form.type === t
                                            ? (t === 'Life' ? 'bg-pink-500/20 border-pink-500' : 'bg-blue-500/20 border-blue-500')
                                            : ''}`}
                                        style={form.type !== t ? { backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-placeholder)' } : { color: 'var(--text-auth-primary)' }}>
                                        {t === 'Life' ? '🧬' : '🏥'} {t} Insurance
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Provider */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-auth-placeholder)' }}>Provider</p>
                            <div className="relative">
                                <select value={form.provider}
                                    onChange={e => setForm({ ...form, provider: e.target.value, policyName: '', policyNameCustom: '' })}
                                    className="w-full border rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-brand-accent transition-colors"
                                    style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }}>
                                    <option value="">Select Provider</option>
                                    {(PROVIDERS[form.type] || []).map(p => <option key={p} value={p}>{p}</option>)}
                                    <option value="Other">Other</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-auth-placeholder)' }} />
                            </div>
                            {form.provider === 'Other' && (
                                <input type="text" placeholder="Type provider name" value={form.providerCustom}
                                    onChange={e => setForm({ ...form, providerCustom: e.target.value })}
                                    className="w-full border rounded-xl px-4 py-3 mt-2 focus:outline-none focus:border-brand-accent"
                                    style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }} />
                            )}
                        </div>

                        {/* Policy name */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-auth-placeholder)' }}>Policy Name</p>
                            <div className="relative">
                                <select value={form.policyName}
                                    onChange={e => setForm({ ...form, policyName: e.target.value })}
                                    disabled={!form.provider || form.provider === 'Other'}
                                    className="w-full border rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-brand-accent transition-colors disabled:opacity-50"
                                    style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }}>
                                    <option value="">Select Policy</option>
                                    {(POLICIES[form.provider] || []).map(p => <option key={p} value={p}>{p}</option>)}
                                    <option value="Other">Other</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-auth-placeholder)' }} />
                            </div>
                            {(form.policyName === 'Other' || form.provider === 'Other') && (
                                <input type="text" placeholder="Type policy name" value={form.policyNameCustom}
                                    onChange={e => setForm({ ...form, policyNameCustom: e.target.value })}
                                    className="w-full border rounded-xl px-4 py-3 mt-2 focus:outline-none focus:border-brand-accent"
                                    style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }} />
                            )}
                        </div>

                        {/* Policy Number & Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-auth-placeholder)' }}>Policy Number</p>
                                <div className="relative">
                                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-auth-placeholder)' }} />
                                    <input type="text" placeholder="e.g. PRO-12345" value={form.policyNumber}
                                        onChange={e => setForm({ ...form, policyNumber: e.target.value })}
                                        className="w-full border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-brand-accent transition-colors"
                                        style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }} />
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-auth-placeholder)' }}>Policy Term (Years)</p>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-auth-placeholder)' }} />
                                    <input type="number" min="1" value={form.term}
                                        onChange={e => setForm({ ...form, term: parseInt(e.target.value) || 1 })}
                                        className="w-full border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-brand-accent transition-colors"
                                        style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }} />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-auth-placeholder)' }}>Renewal / Start Date</p>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-auth-placeholder)' }} />
                                    <input type="date" value={form.timeline}
                                        onChange={e => setForm({ ...form, timeline: e.target.value })}
                                        className="w-full border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-brand-accent transition-colors"
                                        style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }} />
                                </div>
                            </div>
                        </div>

                        {/* Cover amount */}
                        <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--bg-auth-surface)', borderColor: 'var(--border-auth-card)' }}>
                            <div className="flex justify-between items-end mb-4">
                                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-auth-placeholder)' }}>Cover Amount (Sum Insured)</p>
                                <p className="text-xl font-black text-brand-accent">{fmtCover(form.coverVal)}</p>
                            </div>
                                {/* Custom Cover Slider */}
                                <div className="relative w-full h-2 rounded-full mt-4 mb-3" style={{ backgroundColor: 'var(--bg-auth-input)', border: '1px solid var(--border-auth-card)' }}>
                                    <div className="absolute top-0 left-0 h-full rounded-full pointer-events-none transition-all duration-100" style={{ backgroundColor: form.type === 'Life' ? '#ec4899' : '#3b82f6', width: `${(form.coverVal / (form.type === 'Life' ? 50000000 : 20000000)) * 100}%` }} />
                                    <div className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full shadow-md border-2 border-white pointer-events-none transition-all duration-100 z-10"
                                         style={{ left: `calc(${(form.coverVal / (form.type === 'Life' ? 50000000 : 20000000)) * 100}% - 8px)`, backgroundColor: form.type === 'Life' ? '#ec4899' : '#3b82f6' }} />
                                    
                                    <input type="range" min="0" max={form.type === 'Life' ? 50000000 : 20000000}
                                        step="50000"
                                        value={form.coverVal}
                                        onChange={e => setForm({ ...form, coverVal: parseInt(e.target.value) })}
                                        className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-8 opacity-0 cursor-pointer z-20" />
                                </div>
                            <div className="flex justify-between text-[9px] font-bold mt-2" style={{ color: 'var(--text-auth-placeholder)' }}>
                                <span>0</span>
                                <span>{form.type === 'Life' ? '5 Cr' : '2 Cr'}</span>
                            </div>
                        </div>

                        {/* Annual Premium */}
                        <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--bg-auth-surface)', borderColor: 'var(--border-auth-card)' }}>
                            <div className="flex justify-between items-end mb-4">
                                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-auth-placeholder)' }}>Annual Premium</p>
                                <p className="text-xl font-black text-emerald-500">₹{form.premium?.toLocaleString('en-IN')}</p>
                            </div>
                                {/* Custom Premium Slider */}
                                <div className="relative w-full h-2 rounded-full mt-4 mb-3" style={{ backgroundColor: 'var(--bg-auth-input)', border: '1px solid var(--border-auth-card)' }}>
                                    <div className="absolute top-0 left-0 h-full rounded-full pointer-events-none transition-all duration-100" style={{ backgroundColor: '#10b981', width: `${(form.premium / 500000) * 100}%` }} />
                                    <div className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full shadow-md border-2 border-white pointer-events-none transition-all duration-100 z-10"
                                         style={{ left: `calc(${(form.premium / 500000) * 100}% - 8px)`, backgroundColor: '#10b981' }} />
                                    
                                    <input type="range" min="0" max="500000"
                                        step="500"
                                        value={form.premium}
                                        onChange={e => setForm({ ...form, premium: parseInt(e.target.value) })}
                                        className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-8 opacity-0 cursor-pointer z-20" />
                                </div>
                            <div className="flex justify-between text-[9px] font-bold mt-2" style={{ color: 'var(--text-auth-placeholder)' }}>
                                <span>0</span>
                                <span>5 Lakhs</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button onClick={() => { setView(policies.length > 0 ? VIEW.LIST : VIEW.CHOICE); setForm(EMPTY_FORM); }}
                                className="flex-1 py-3 rounded-xl border font-bold text-sm"
                                style={{ borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-muted)', backgroundColor: 'var(--bg-auth-input)' }}>
                                ← Back
                            </button>
                            <button onClick={addManualPolicy} disabled={!canAddManual()}
                                className="flex-[2] py-3 rounded-xl font-black text-sm transition-all disabled:opacity-40 bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" /> Save Policy
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ── POLICY LIST ────────────────────────────────────────────── */}
                {view === VIEW.LIST && (
                    <motion.div key="list" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                        className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-auth-placeholder)' }}>
                            Added Policies ({policies.length})
                        </p>

                        {policies.map((p, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-4 p-4 rounded-2xl border"
                                style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)' }}>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${p.type === 'Life' ? 'bg-pink-500/20' : 'bg-blue-500/20'}`}>
                                    {p.type === 'Life' ? <Heart className="w-5 h-5 text-pink-400" /> : <Shield className="w-5 h-5 text-blue-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-sm truncate" style={{ color: 'var(--text-auth-primary)' }}>{p.policyName}</p>
                                    <p className="text-xs truncate" style={{ color: 'var(--text-auth-muted)' }}>{p.provider} · {p.type}</p>
                                </div>
                                <p className="font-black text-brand-accent text-sm shrink-0">{fmtCover(p.coverVal)}</p>
                                <button onClick={() => removePolicy(i)} className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors shrink-0">
                                    <X className="w-4 h-4 text-red-400" />
                                </button>
                            </motion.div>
                        ))}

                        {/* Add another */}
                        <button onClick={() => { setForm(EMPTY_FORM); setView(VIEW.MANUAL); }}
                            className="w-full py-4 rounded-xl border-2 border-dashed font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
                            style={{ borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-muted)' }}>
                            <Plus className="w-4 h-4" /> Add Another Policy
                        </button>

                        <button onClick={() => commitAndDone(policies)}
                            className="w-full py-4 rounded-xl font-black text-sm bg-brand-accent text-white flex items-center justify-center gap-2 hover:bg-brand-accent/90 transition-all">
                            <CheckCircle2 className="w-4 h-4" /> Done — Analyse My Gaps
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </StepWrapper>
    );
}
