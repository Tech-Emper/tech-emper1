import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Building, Inbox, ShieldCheck } from 'lucide-react';
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
        <div className="w-full max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Left navigation */}
            <aside className="md:w-60 shrink-0">
                <div className="md:sticky md:top-24 rounded-2xl p-3 border"
                    style={{ backgroundColor: 'var(--bg-auth-card)', borderColor: 'var(--border-auth-card)' }}>
                    <div className="hidden md:flex items-center gap-2.5 px-2 pt-1 pb-3 mb-2 border-b"
                        style={{ borderColor: 'var(--border-auth-card)' }}>
                        <span className="grid place-items-center w-8 h-8 rounded-lg bg-[#14BA80]/12 text-[#14BA80]">
                            <ShieldCheck className="w-[18px] h-[18px]" />
                        </span>
                        <div className="leading-tight">
                            <div className="text-sm font-extrabold" style={{ color: 'var(--text-auth-primary)' }}>Super Admin</div>
                            <div className="text-[11px]" style={{ color: 'var(--text-auth-muted)' }}>Console</div>
                        </div>
                    </div>

                    <nav className="flex md:flex-col gap-1.5">
                        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
                            const active = section === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setSection(key)}
                                    aria-current={active ? 'page' : undefined}
                                    className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-colors duration-150 flex-1 md:flex-none ${active
                                        ? 'bg-[#14BA80] text-white shadow-sm shadow-[#14BA80]/25'
                                        : 'text-slate-500 hover:bg-[#14BA80]/8 hover:text-[#0E8F63]'}`}
                                >
                                    <Icon className={`w-[18px] h-[18px] ${active ? '' : 'text-slate-400 group-hover:text-[#14BA80]'}`} />
                                    {label}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* Active section */}
            <main className="flex-1 min-w-0">
                {section === 'institutes' ? <InstitutesPanel /> : <LeadsPanel />}
            </main>
        </div>
    );
}
