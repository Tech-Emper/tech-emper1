export const walletService = {
    getPolicies: () => {
        const data = localStorage.getItem('user_policies');
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
        localStorage.setItem('user_policies', JSON.stringify(updatedPolicies));
        return newPolicy;
    },

    deletePolicy: (id) => {
        const policies = walletService.getPolicies();
        const updatedPolicies = policies.filter(p => p.id !== id);
        localStorage.setItem('user_policies', JSON.stringify(updatedPolicies));
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
            localStorage.setItem('user_policies', JSON.stringify(policies));
            return policies[index];
        }
        return null;
    }
};
