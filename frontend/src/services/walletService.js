const getStorageKey = () => {
    const email = localStorage.getItem('auth_email');
    return email ? `user_policies_${email}` : 'user_policies_guest';
};

export const walletService = {
    getPolicies: () => {
        const email = localStorage.getItem('auth_email');
        const key = getStorageKey();
        
        // Lazy migration: if authenticated, merge from legacy or guest
        if (email) {
            const guestData = localStorage.getItem('user_policies_guest');
            const legacyData = localStorage.getItem('user_policies');
            
            let merged = null;
            
            const mergeData = (sourceDataStr) => {
                if (!sourceDataStr) return;
                try {
                    const src = JSON.parse(sourceDataStr);
                    if (src && Array.isArray(src) && src.length > 0) {
                        if (!merged) {
                            const existingData = localStorage.getItem(key);
                            merged = existingData ? JSON.parse(existingData) : [];
                        }
                        for (const p of src) {
                            if (!merged.find(existing => existing.id === p.id)) merged.push(p);
                        }
                    }
                } catch (e) {
                    console.error("Migration parse error", e);
                }
            };
            
            if (guestData) mergeData(guestData);
            if (legacyData) mergeData(legacyData);
            
            if (merged) {
                localStorage.setItem(key, JSON.stringify(merged));
            }
            
            localStorage.removeItem('user_policies_guest');
            localStorage.removeItem('user_policies'); // Remove legacy so we don't migrate logic forever
        }

        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    getPolicyById: (id) => {
        const policies = walletService.getPolicies();
        return policies.find(p => p.id === id);
    },

    addPolicy: (policy) => {
        const policies = walletService.getPolicies();
        const newPolicy = {
            ...policy,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString()
        };
        const updatedPolicies = [...policies, newPolicy];
        localStorage.setItem(getStorageKey(), JSON.stringify(updatedPolicies));
        return newPolicy;
    },

    deletePolicy: (id) => {
        const policies = walletService.getPolicies();
        const updatedPolicies = policies.filter(p => p.id !== id);
        localStorage.setItem(getStorageKey(), JSON.stringify(updatedPolicies));
    },

    updatePolicy: (id, updatedData) => {
        const policies = walletService.getPolicies();
        const index = policies.findIndex(p => p.id === id);
        if (index !== -1) {
            policies[index] = {
                ...policies[index],
                ...updatedData,
                id // Ensure ID remains same
            };
            localStorage.setItem(getStorageKey(), JSON.stringify(policies));
            return policies[index];
        }
        return null;
    }
};
