import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL, isSuperadminEmail } from '../config';

// Global 401 handler: install a one-time fetch interceptor so any authenticated API
// call that comes back 401 (expired/invalid token) clears the session and redirects
// to login — instead of silently failing while the UI still looks logged in.
if (typeof window !== 'undefined' && !window.__authInterceptorInstalled) {
    window.__authInterceptorInstalled = true;
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (...args) => {
        const response = await originalFetch(...args);
        try {
            const input = args[0];
            const url = typeof input === 'string' ? input : (input && input.url) || '';
            // Only react to 401s from our own API, and only if we thought we were logged in
            if (response.status === 401 && url.startsWith(API_BASE_URL) && localStorage.getItem('auth_token')) {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_email');
                if (!window.location.pathname.startsWith('/login')) {
                    window.location.assign('/login?expired=1');
                }
            }
        } catch (e) {
            /* never let the interceptor break a request */
        }
        return response;
    };
}

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (token) => {
        const activeToken = token || localStorage.getItem('auth_token');
        if (!activeToken) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
                headers: { 'Authorization': `Bearer ${activeToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                setProfile(data.profile);
                setRecommendations(data.recommendations || []);
                if (data.profile?.email) {
                    setUser(prev => ({ ...prev, email: data.profile.email }));
                }
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        }
    };

    const updateProfile = async (profileData) => {
        const token = localStorage.getItem('auth_token');
        if (!token) return false;

        try {
            const response = await fetch(`${API_BASE_URL}/api/user/sync-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                await fetchProfile(token);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Failed to update profile:", error);
            return false;
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('auth_token');
            const emailFromLS = localStorage.getItem('auth_email');

            // Safer check for the user email
            let email = emailFromLS;
            if (!email) {
                try {
                    const userObj = localStorage.getItem('user');
                    if (userObj) {
                        email = JSON.parse(userObj).email;
                    }
                } catch (e) {
                    console.error("Failed to parse user from localStorage", e);
                }
            }

            if (token && email) {
                const role = isSuperadminEmail(email) ? 'superadmin' : 'user';
                setUser({ token, email, role });
                await fetchProfile(token);
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email) => {
        const response = await fetch(`${API_BASE_URL}/api/auth/otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to send OTP');
        }
        return true;
    };

    const verify = async (email, otp) => {
        const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Invalid OTP');
        }

        const data = await response.json();
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('auth_email', email);
        const role = isSuperadminEmail(email) ? 'superadmin' : 'user';
        setUser({ token: data.access_token, email, role });
        await fetchProfile(data.access_token);
        return true;
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_email');
        setUser(null);
        setProfile(null);
        setRecommendations([]);
    };

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            recommendations,
            loading,
            login,
            verify,
            logout,
            updateProfile,
            refreshProfile: () => fetchProfile(),
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
