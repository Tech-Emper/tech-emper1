
const getApiBaseUrl = () => {
    // Check if we are in a production environment (e.g. Render)
    // Vite exposes env vars prefixed with VITE_
    if (import.meta.env.VITE_API_BASE_URL) {
        let url = import.meta.env.VITE_API_BASE_URL;
        if (!url.startsWith('http')) {
            url = `https://${url}`;
        }
        return url.replace(/\/$/, '');
    }
    
    // Default to localhost for development
    return 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();
