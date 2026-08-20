
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

// Emails treated as superadmin in the UI. Override via the VITE_SUPERADMIN_EMAILS
// env var (comma-separated); defaults include the known admins. The backend is the
// real authority (it re-checks role on every request); this only drives UI routing.
const getSuperadminEmails = () => {
    const raw = import.meta.env.VITE_SUPERADMIN_EMAILS || 'tech@emper.ai,shivansh.joshi@scalevista.com';
    return new Set(raw.split(',').map(e => e.trim().toLowerCase()).filter(Boolean));
};

export const SUPERADMIN_EMAILS = getSuperadminEmails();
export const isSuperadminEmail = (email) => SUPERADMIN_EMAILS.has((email || '').trim().toLowerCase());
