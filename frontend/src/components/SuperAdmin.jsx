import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Building, Inbox } from 'lucide-react';
import InstitutesPanel from './superadmin/InstitutesPanel';
import LeadsPanel from './superadmin/LeadsPanel';

const NAV_ITEMS = [
    { key: 'institutes', label: 'Institutes', icon: Building },
    { key: 'leads', label: 'Leads', icon: Inbox },
];

export default function SuperAdmin() {
    const { user } = useAuth();

    // Only superadmins can access this dashboard (backend re-checks on every call)
    if (user?.role !== 'superadmin') {
        return <Navigate to="/" replace />;
    }

    const [section, setSection] = useState('institutes');

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
            {/* Left navigation */}
            <aside className="md:w-56 shrink-0">
                <div className="flex md:flex-col gap-2 rounded-2xl p-2 border backdrop-blur-xl"
                    style={{ backgroundColor: 'var(--bg-auth-card)', borderColor: 'var(--border-auth-card)' }}>
                    {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
                        const active = section === key;
                        return (
                            <button
                                key={key}
                                onClick={() => setSection(key)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all flex-1 md:flex-none ${active ? 'bg-[#14BA80] text-white shadow-lg shadow-[#14BA80]/20' : 'hover:bg-white/5'}`}
                                style={active ? {} : { color: 'var(--text-auth-muted)' }}
                            >
                                <Icon className="w-5 h-5" />
                                {label}
                            </button>
                        );
                    })}
                </div>
            </aside>

            {/* Active section */}
            <main className="flex-1 min-w-0">
                {section === 'institutes' ? <InstitutesPanel /> : <LeadsPanel />}
            </main>
        </div>
    );
}
