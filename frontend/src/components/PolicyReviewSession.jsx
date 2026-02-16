import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Heart, Shield, ArrowLeft } from 'lucide-react';

export default function PolicyReviewSession({ onBack }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [debugData, setDebugData] = useState({ show_debug: false });

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        const token = localStorage.getItem('auth_token');
        const rawBaseUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:8000';
        const API_BASE_URL = (rawBaseUrl.startsWith('http') ? rawBaseUrl : `https://${rawBaseUrl}`).replace(/\/$/, '');

        try {
            const response = await fetch(`${API_BASE_URL}/api/policy/extract-multiple`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to extract policy details');
            }

            const data = await response.json();
            setResults(data.results);
            setDebugData({ show_debug: data.show_debug });
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

            {!results ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-2xl mx-auto backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border shadow-2xl"
                    style={{
                        backgroundColor: 'var(--bg-auth-card)',
                        borderColor: 'var(--border-auth-card)'
                    }}
                >
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-brand-accent/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Upload className="w-10 h-10 text-brand-accent" />
                        </div>
                        <h2 className="text-3xl font-black mb-3" style={{ color: 'var(--text-auth-primary)' }}>Batch Policy Review</h2>
                        <p style={{ color: 'var(--text-auth-muted)' }}>Upload your existing life or health insurance documents for a deep AI analysis.</p>
                    </div>

                    <div className="space-y-6">
                        <label className="block p-10 border-2 border-dashed rounded-[2rem] cursor-pointer hover:bg-white/5 transition-all text-center group"
                            style={{ borderColor: 'var(--border-auth-card)' }}
                        >
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".pdf,image/*"
                            />
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                                    <FileText className="w-8 h-8 text-slate-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-lg" style={{ color: 'var(--text-auth-primary)' }}>
                                        {files.length > 0 ? `${files.length} files selected` : 'Choose Files'}
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-auth-placeholder)' }}>PDF or Images (Max 5 files)</p>
                                </div>
                            </div>
                        </label>

                        {files.length > 0 && (
                            <div className="flex flex-wrap gap-2 justify-center">
                                {files.map((f, i) => (
                                    <span key={i} className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full border border-white/10" style={{ color: 'var(--text-auth-muted)' }}>
                                        {f.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={handleUpload}
                            disabled={loading || files.length === 0}
                            className="w-full bg-gradient-to-r from-brand-accent to-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>AI is Analyzing...</span>
                                </>
                            ) : (
                                <>
                                    <span>Extract Details</span>
                                </>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}
                </motion.div>
            ) : (
                <div className="space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--text-auth-primary)' }}>Extraction Results</h2>
                        <p style={{ color: 'var(--text-auth-muted)' }}>We found {results.length} policies across your documents.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {results.map((res, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="backdrop-blur-xl rounded-[2rem] border overflow-hidden p-6 md:p-8"
                                style={{
                                    backgroundColor: 'var(--bg-auth-card)',
                                    borderColor: res.is_valid_policy ? 'var(--border-auth-card)' : 'rgba(239,68,68,0.3)'
                                }}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-3 rounded-xl ${res.is_valid_policy ? 'bg-brand-accent/10' : 'bg-red-500/10'}`}>
                                        {res.is_valid_policy ? <Shield className="w-6 h-6 text-brand-accent" /> : <AlertCircle className="w-6 h-6 text-red-500" />}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-auth-placeholder)' }}>Source File</p>
                                        <p className="text-xs font-bold truncate max-w-[150px]" style={{ color: 'var(--text-auth-muted)' }}>{res.filename}</p>
                                    </div>
                                </div>

                                {res.is_valid_policy ? (
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-black" style={{ color: 'var(--text-auth-primary)' }}>{res.policy_name || 'Individual Policy'}</h3>
                                                {res.policy_type && (
                                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${res.policy_type === 'LIFE' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                                                        {res.policy_type}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-bold text-brand-accent">{res.provider_name}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                                <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-auth-placeholder)' }}>Coverage</p>
                                                <p className="text-xl font-black" style={{ color: 'var(--text-auth-primary)' }}>{formatCurrency(res.coverage_amount_val)}</p>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                                <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-auth-placeholder)' }}>Premium</p>
                                                <p className="text-xl font-black" style={{ color: 'var(--text-auth-primary)' }}>₹{res.premium_amount?.toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>

                                        {res.add_ons.length > 0 && (
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--text-auth-placeholder)' }}>
                                                    <Heart className="w-3 h-3 text-pink-500" /> Key Features
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {res.add_ons.map((addon, i) => (
                                                        <span key={i} className="text-[10px] font-bold px-3 py-1.5 bg-brand-accent/10 text-brand-accent rounded-lg border border-brand-accent/20">
                                                            {addon.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t" style={{ borderTopColor: 'var(--border-auth-card)' }}>
                                            <p className="text-[10px] italic leading-relaxed" style={{ color: 'var(--text-auth-muted)' }}>{res.raw_summary}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-10 text-center">
                                        <p className="font-bold text-red-400 mb-2">Could not extract details</p>
                                        <p className="text-xs" style={{ color: 'var(--text-auth-placeholder)' }}>This document might not be a valid insurance policy or the image is too blurry.</p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex justify-center pt-8">
                        <button
                            onClick={() => { setResults(null); setFiles([]); }}
                            className="px-8 py-4 rounded-2xl border font-bold hover:bg-white/5 transition-all"
                            style={{ color: 'var(--text-auth-primary)', borderColor: 'var(--border-auth-card)' }}
                        >
                            Upload More Documents
                        </button>
                    </div>

                    {debugData.show_debug && results && (
                        <div className="mt-12 pt-8 border-t space-y-4" style={{ borderTopColor: 'var(--border-auth-card)' }}>
                            <p className="text-[10px] font-black uppercase tracking-widest text-center" style={{ color: 'var(--text-auth-placeholder)' }}>Debug: Extraction Prompts</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {results.map((res, i) => (
                                    <div key={i} className="p-4 rounded-xl border text-[9px] font-mono overflow-auto max-h-40 relative group"
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
                </div>
            )}
        </div>
    );
}
