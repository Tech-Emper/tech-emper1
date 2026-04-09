import { useTheme } from '../context/ThemeContext';

export const useThemeStyles = () => {
    const { theme } = useTheme();

    return {
        // Card backgrounds
        cardBg: theme === 'dark' ? 'bg-white/5' : 'bg-black/5',
        cardBgHover: theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10',
        cardBorder: theme === 'dark' ? 'border-white/10' : 'border-black/10',

        // Text colors
        textPrimary: theme === 'dark' ? 'text-white' : 'text-slate-900',
        textSecondary: theme === 'dark' ? 'text-slate-400' : 'text-slate-600',
        textMuted: theme === 'dark' ? 'text-slate-500' : 'text-slate-500',

        // Input styles
        inputBg: theme === 'dark' ? 'bg-slate-900/50' : 'bg-slate-50',
        inputBorder: theme === 'dark' ? 'border-white/10' : 'border-slate-200',
        inputText: theme === 'dark' ? 'text-white' : 'text-slate-900',
        inputPlaceholder: theme === 'dark' ? 'placeholder:text-slate-600' : 'placeholder:text-slate-400',

        // Button styles
        buttonSecondary: theme === 'dark'
            ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
            : 'bg-black/5 border-black/10 text-slate-600 hover:text-black hover:bg-black/10',
    };
};