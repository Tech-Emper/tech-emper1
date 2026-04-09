import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const theme = 'light';

    useEffect(() => {
        const root = window.document.documentElement;
        // Enforce light theme
        root.classList.remove('dark');
        root.classList.add('light');
        // Clear any old saved theme preference
        localStorage.removeItem('theme');
    }, []);

    const toggleTheme = () => {
        // Theme toggle is disabled
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
