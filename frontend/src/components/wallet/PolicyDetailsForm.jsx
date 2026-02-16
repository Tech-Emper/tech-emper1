import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Shield, CreditCard, Clock, IndianRupee } from 'lucide-react';
import { walletService } from '../../services/walletService';
import { useEffect } from 'react';

export default function PolicyDetailsForm() {
    const { type: typeParam, company: companyParam, id } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
    const watchedSumInsured = watch("sumInsured", 0);
    const watchedPremium = watch("premium", 0);

    const formatLakhs = (num) => {
        if (!num) return "₹0";
        if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Crore`;
        if (num >= 100000) return `₹${(num / 100000).toFixed(1)} Lakh`;
        return `₹${num.toLocaleString()}`;
    };

    const isEdit = !!id;

    useEffect(() => {
        if (isEdit) {
            const policy = walletService.getPolicyById(id);
            if (policy) {
                // Convert DD/MM/YYYY to YYYY-MM-DD for native date picker
                let normalizedTimeline = policy.timeline;
                if (normalizedTimeline && !normalizedTimeline.includes('-') && normalizedTimeline.includes('/')) {
                    const [d, m, y] = normalizedTimeline.split('/');
                    normalizedTimeline = `${y}-${m}-${d}`;
                }

                reset({
                    ...policy,
                    timeline: normalizedTimeline,
                    sumInsured: Number(policy.sumInsured) || 0,
                    premium: Number(policy.premium) || 0
                });
            }
        }
    }, [id, isEdit, reset]);

    const onSubmit = (data) => {
        // Normalize date format if coming from date picker (YYYY-MM-DD -> DD/MM/YYYY)
        let timeline = data.timeline;
        if (timeline && timeline.includes('-')) {
            const [y, m, d] = timeline.split('-');
            timeline = `${d}/${m}/${y}`;
        }

        sessionStorage.setItem('pending_policy', JSON.stringify({
            ...data,
            timeline,
            type: data.type || typeParam,
            company: data.company || companyParam,
            id: id
        }));

        const finalType = data.type || typeParam;
        const finalCompany = data.company || companyParam;
        navigate(`/wallet/add-policy/${finalType}/${finalCompany}/confirm`);
    };

    const inputStyle = "w-full border rounded-2xl p-4 transition-all font-medium placeholder:text-slate-500 focus:outline-none focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/10";
    const labelStyle = "block text-[11px] font-black uppercase tracking-widest mb-2 ml-1 text-slate-500";
    const errorStyle = "text-red-500 text-[10px] font-black mt-2 ml-1 uppercase tracking-wider";

    return (
        <div className="w-full max-w-2xl mx-auto px-4 py-8">
            <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => isEdit ? navigate(`/wallet/policy/${id}`) : navigate(`/wallet/add-policy/${typeParam}`)}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold">{isEdit ? 'Back to Policy' : 'Back to Insurer'}</span>
            </motion.button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 md:mb-10 text-center"
            >
                <h2 className="text-2xl md:text-3xl font-black mb-2" style={{ color: 'var(--text-auth-primary)' }}>{isEdit ? 'Edit Policy' : 'Policy Details'}</h2>
                <p className="text-sm md:text-base font-medium" style={{ color: 'var(--text-auth-muted)' }}>
                    {isEdit ? 'Refine your coverage information' : `Enter your ${companyParam} policy info`}
                </p>
            </motion.div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Policy Number */}
                    <div className="relative group">
                        <label className={labelStyle} style={{ color: 'var(--text-auth-label)' }}>Policy Number</label>
                        <div className="relative">
                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-brand-accent transition-colors" />
                            <input
                                {...register("policyNumber", { required: "Policy number is required" })}
                                placeholder="PRO-99887766"
                                className={`${inputStyle} pl-12`}
                                style={{
                                    backgroundColor: 'var(--bg-auth-input)',
                                    borderColor: 'var(--border-auth-card)',
                                    color: 'var(--text-auth-primary)'
                                }}
                            />
                        </div>
                        {errors.policyNumber && <p className={errorStyle}>{errors.policyNumber.message}</p>}
                    </div>

                    {/* Plan Name */}
                    <div className="relative group">
                        <label className={labelStyle} style={{ color: 'var(--text-auth-label)' }}>Plan Name</label>
                        <div className="relative">
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-brand-accent transition-colors" />
                            <input
                                {...register("planName", { required: "Plan name is required" })}
                                placeholder="Optima Secure / Term Pro"
                                className={`${inputStyle} pl-12`}
                                style={{
                                    backgroundColor: 'var(--bg-auth-input)',
                                    borderColor: 'var(--border-auth-card)',
                                    color: 'var(--text-auth-primary)'
                                }}
                            />
                        </div>
                        {errors.planName && <p className={errorStyle}>{errors.planName.message}</p>}
                    </div>

                    {/* Policy Term */}
                    <div className="relative group">
                        <label className={labelStyle} style={{ color: 'var(--text-auth-label)' }}>Policy Term (Years)</label>
                        <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-brand-accent transition-colors" />
                            <input
                                type="number"
                                {...register("term", { valueAsNumber: true })}
                                placeholder="E.g. 1"
                                className={`${inputStyle} pl-12`}
                                style={{
                                    backgroundColor: 'var(--bg-auth-input)',
                                    borderColor: 'var(--border-auth-card)',
                                    color: 'var(--text-auth-primary)'
                                }}
                            />
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="relative group">
                        <label className={labelStyle} style={{ color: 'var(--text-auth-label)' }}>Renewal Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-brand-accent transition-colors pointer-events-none" />
                            <input
                                type="date"
                                {...register("timeline", { required: "Renewal date is required" })}
                                className={`${inputStyle} pl-12`}
                                style={{
                                    backgroundColor: 'var(--bg-auth-input)',
                                    borderColor: 'var(--border-auth-card)',
                                    color: 'var(--text-auth-primary)'
                                }}
                            />
                        </div>
                        {errors.timeline && <p className={errorStyle}>{errors.timeline.message}</p>}
                    </div>

                    {/* Sum Insured Slider */}
                    <div className="md:col-span-2 p-6 rounded-[2rem] border mt-2"
                        style={{
                            backgroundColor: 'var(--bg-auth-surface)',
                            borderColor: 'var(--border-auth-card)'
                        }}>
                        <div className="flex justify-between items-center mb-6">
                            <label className={labelStyle + " mb-0"}>Sum Insured</label>
                            <span className="text-xl font-black text-brand-accent">{formatLakhs(watchedSumInsured)}</span>
                        </div>
                        <input
                            type="range"
                            min="100000"
                            max="50000000"
                            step="50000"
                            {...register("sumInsured", { valueAsNumber: true })}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-brand-accent"
                            style={{
                                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((watchedSumInsured - 100000) / (50000000 - 100000)) * 100}%, rgba(148, 163, 184, 0.2) ${((watchedSumInsured - 100000) / (50000000 - 100000)) * 100}%, rgba(148, 163, 184, 0.2) 100%)`
                            }}
                        />
                        <div className="flex justify-between text-[10px] mt-4 font-black uppercase tracking-widest text-slate-500">
                            <span>1 Lakh</span>
                            <span>5 Crore</span>
                        </div>
                    </div>

                    {/* Premium Slider */}
                    <div className="md:col-span-2 p-6 rounded-[2rem] border"
                        style={{
                            backgroundColor: 'var(--bg-auth-surface)',
                            borderColor: 'var(--border-auth-card)'
                        }}>
                        <div className="flex justify-between items-center mb-6">
                            <label className={labelStyle + " mb-0"}>Annual Premium</label>
                            <span className="text-xl font-black text-emerald-500">{formatLakhs(watchedPremium)}</span>
                        </div>
                        <input
                            type="range"
                            min="1000"
                            max="500000"
                            step="500"
                            {...register("premium", { valueAsNumber: true })}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            style={{
                                background: `linear-gradient(to right, #10B981 0%, #10B981 ${((watchedPremium - 1000) / (500000 - 1000)) * 100}%, rgba(148, 163, 184, 0.2) ${((watchedPremium - 1000) / (500000 - 1000)) * 100}%, rgba(148, 163, 184, 0.2) 100%)`
                            }}
                        />
                        <div className="flex justify-between text-[10px] mt-4 font-black uppercase tracking-widest text-slate-500">
                            <span>₹1,000</span>
                            <span>5 Lakhs</span>
                        </div>
                    </div>
                </div>

                <div className="pt-4 md:pt-8">
                    <button
                        type="submit"
                        className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white p-4 md:p-5 rounded-2xl font-black transition-all shadow-xl shadow-brand-accent/20 flex items-center justify-center gap-2 group"
                    >
                        <span>Review Policy Details</span>
                        <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </form>
        </div>
    );
}
