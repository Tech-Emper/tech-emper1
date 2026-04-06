import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Loader2, ArrowRight } from 'lucide-react';

export default function OTPModal({ show, email, loading, error, onVerify, onClose }) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);

    if (!show) return null;

    const handleOtpChange = (index, value) => {
        if (!/^[0-9]*$/.test(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'Enter') {
            submit();
        }
    };

    const submit = () => {
        const otpString = otp.join('');
        if (otpString.length === 6) {
            onVerify(otpString);
        }
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-md p-8 border rounded-3xl shadow-2xl relative"
                    style={{ backgroundColor: 'var(--bg-auth-card)', borderColor: 'var(--border-auth-card)' }}
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    <div className="mt-8 text-center mb-8">
                        <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--text-auth-primary)' }}>Verify Your Email</h2>
                        <p className="font-medium text-sm" style={{ color: 'var(--text-auth-muted)' }}>
                            We sent a secure code to<br />
                            <span className="font-bold whitespace-nowrap" style={{ color: 'var(--text-auth-primary)' }}>{email}</span>
                        </p>
                    </div>

                    <div className="flex justify-between gap-2 mb-8">
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                ref={el => inputRefs.current[i] = el}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleOtpChange(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                disabled={loading}
                                className="w-12 h-14 text-center text-xl font-black rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50"
                                style={{
                                    backgroundColor: 'var(--bg-auth-input)',
                                    borderColor: 'var(--border-auth-card)',
                                    color: 'var(--text-auth-primary)'
                                }}
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium text-center">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-4 font-bold rounded-2xl border transition-all disabled:opacity-50 hover:bg-white/5"
                            style={{ borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={submit}
                            disabled={loading || otp.join('').length < 6}
                            className="flex-1 py-4 font-black rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Code'}
                            {!loading && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </div>
                </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
