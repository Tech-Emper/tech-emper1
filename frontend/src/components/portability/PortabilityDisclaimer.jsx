import { motion } from 'framer-motion';

export default function PortabilityDisclaimer() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-4xl mx-auto px-4 py-12 text-left">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full p-8 md:p-12 rounded-3xl border"
                style={{ backgroundColor: 'var(--bg-auth-card)', borderColor: 'var(--border-auth-card)' }}
            >
                <h1 className="text-3xl md:text-4xl font-black mb-8" style={{ color: 'var(--text-auth-primary)' }}>
                    Portability Terms & Disclaimer
                </h1>
                
                <div className="space-y-6 text-sm md:text-base leading-relaxed opacity-90" style={{ color: 'var(--text-auth-muted)' }}>
                    <p>
                        <strong>1. Acceptance of Terms:</strong> By initiating a policy portability request through Emper.ai, you agree to these terms and conditions. The portability process is governed by the guidelines set forth by the Insurance Regulatory and Development Authority of India (IRDAI).
                    </p>
                    
                    <p>
                        <strong>2. Waiting Periods:</strong> Credit for waiting periods (pre-existing diseases, specific diseases, and initial waiting periods) will be transferred subject to the new insurer's underwriting policies. You may still be subject to new waiting periods for any enhanced sum insured.
                    </p>
                    
                    <p>
                        <strong>3. Timeline & Approvals:</strong> Portability requests should be submitted at least 45 days before the renewal date of your existing policy. The final decision to accept or reject a portability request rests solely with the new insurance company based on their underwriting guidelines.
                    </p>
                    
                    <p>
                        <strong>4. Documentation:</strong> You agree to provide accurate and complete documentation, including previous policy schedules, claim history, and any required medical records. Any misrepresentation may lead to the rejection of the request or cancellation of the policy.
                    </p>
                    
                    <p>
                        <strong>5. Data Privacy:</strong> Emper.ai will securely transmit your data to the relevant insurance companies solely for the purpose of processing your portability request. Your data will not be sold to third parties.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
