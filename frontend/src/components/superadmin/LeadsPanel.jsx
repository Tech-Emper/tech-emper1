import React, { useState, useEffect, useCallback } from 'react';
import { Inbox, Search, Download, X, ChevronLeft, ChevronRight, RefreshCw, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../config';

// Mirror of backend enum value sets (backend/models.py is the source of truth)
const CALL_CENTER_STATUSES = ["pending", "pushed", "contacted", "converted", "closed"];
const DOCUMENT_STATUSES = ["not_requested", "requested", "received", "incomplete", "complete"];
const INSURER_STATUSES = ["not_submitted", "submitted", "under_review", "query_raised", "terms_received", "declined", "issued"];
const CASE_STATUSES = ["lead_received", "advisor_assigned", "documents_requested", "submitted_to_insurer", "payment_pending", "policy_issued", "closed"];
const CORPORATE_STATUSES = ["pending", "contacted", "converted", "closed"];
const PRODUCT_OPTIONS = [
    ["", "All products"],
    ["super_top_up", "Super Top-Up"],
    ["portability", "Portability"],
    ["general", "General"],
];

// --- Temporary feature flags (flip these to re-enable later) ---
const SHOW_CORPORATE_TAB = false;        // hide the Corporate/HR tab for now
const ENABLED_PRODUCTS = ['general'];    // products shown in the filter; add 'super_top_up','portability' to re-enable
const VISIBLE_PRODUCT_OPTIONS = ENABLED_PRODUCTS.length > 1
    ? [["", "All products"], ...PRODUCT_OPTIONS.filter(([v]) => ENABLED_PRODUCTS.includes(v))]
    : PRODUCT_OPTIONS.filter(([v]) => ENABLED_PRODUCTS.includes(v));
const DEFAULT_PRODUCT = ENABLED_PRODUCTS.length === 1 ? ENABLED_PRODUCTS[0] : '';

const PAGE_SIZE = 25;
const authHeaders = () => ({ 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` });
const prettify = (s) => (s ? String(s).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '—');
const fmtDate = (s) => (s ? new Date(s).toLocaleString() : '—');

function StatusBadge({ value }) {
    if (!value) return <span style={{ color: 'var(--text-auth-muted)' }}>—</span>;
    return (
        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-[#14BA80]/15 text-[#14BA80]">
            {prettify(value)}
        </span>
    );
}

export default function LeadsPanel() {
    const [tab, setTab] = useState('employee'); // 'employee' | 'corporate'

    // Filters
    const [q, setQ] = useState('');
    const [product, setProduct] = useState(DEFAULT_PRODUCT);
    const [status, setStatus] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);

    const basePath = tab === 'employee' ? 'leads' : 'corporate-leads';

    const buildQuery = useCallback((extra = {}) => {
        const p = new URLSearchParams();
        if (q) p.set('q', q);
        if (dateFrom) p.set('date_from', dateFrom);
        if (dateTo) p.set('date_to', dateTo);
        if (status) p.set('status', status); // employee: call_center_status handled below
        if (tab === 'employee') {
            p.delete('status');
            if (product) p.set('product_subcategory', product);
            if (status) p.set('call_center_status', status);
        }
        Object.entries(extra).forEach(([k, v]) => p.set(k, v));
        return p.toString();
    }, [q, dateFrom, dateTo, status, product, tab]);

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const qs = buildQuery({ page, page_size: PAGE_SIZE });
            const res = await fetch(`${API_BASE_URL}/api/superadmin/${basePath}?${qs}`, { headers: authHeaders() });
            if (res.ok) {
                const data = await res.json();
                setRows(data.results || []);
                setTotal(data.total || 0);
            }
        } catch (e) {
            console.error('Failed to load leads', e);
        } finally {
            setLoading(false);
        }
    }, [buildQuery, page, basePath]);

    useEffect(() => { fetchLeads(); }, [fetchLeads]);
    // Reset to page 1 whenever filters/tab change
    useEffect(() => { setPage(1); }, [q, product, status, dateFrom, dateTo, tab]);

    const applyFilters = (e) => { e.preventDefault(); setPage(1); fetchLeads(); };

    const clearFilters = () => {
        setQ(''); setProduct(''); setStatus(''); setDateFrom(''); setDateTo(''); setPage(1);
    };

    const downloadCsv = async () => {
        try {
            const qs = buildQuery();
            const res = await fetch(`${API_BASE_URL}/api/superadmin/${basePath}/export?${qs}`, { headers: authHeaders() });
            if (!res.ok) { alert('Export failed'); return; }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${basePath}_${dateFrom || 'all'}_${dateTo || 'all'}.csv`;
            document.body.appendChild(a); a.click(); a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            alert('Export failed');
        }
    };

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-black flex items-center gap-3" style={{ color: 'var(--text-auth-primary)' }}>
                    <Inbox className="w-8 h-8 text-[#14BA80]" />
                    Leads
                </h1>
                <p className="mt-2 font-medium" style={{ color: 'var(--text-auth-muted)' }}>
                    View captured leads, filter, update status, and download CSV.
                </p>
            </div>

            {/* Sub-tabs */}
            {SHOW_CORPORATE_TAB && (
            <div className="flex gap-2 mb-6">
                {[['employee', 'Employee Leads', Inbox], ['corporate', 'Corporate / HR', Building2]].map(([key, label, Icon]) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${tab === key ? 'bg-[#14BA80] text-white shadow-lg shadow-[#14BA80]/20' : 'hover:bg-white/5'}`}
                        style={tab === key ? {} : { color: 'var(--text-auth-muted)' }}
                    >
                        <Icon className="w-4 h-4" /> {label}
                    </button>
                ))}
            </div>
            )}

            {/* Filter bar */}
            <form onSubmit={applyFilters} className="rounded-2xl p-4 mb-6 border backdrop-blur-xl flex flex-wrap items-end gap-3"
                style={{ backgroundColor: 'var(--bg-auth-card)', borderColor: 'var(--border-auth-card)' }}>
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={q} onChange={(e) => setQ(e.target.value)}
                        placeholder={tab === 'employee' ? 'Search name / mobile / email' : 'Search company / HR / mobile / email'}
                        className="w-full pl-9 pr-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-[#14BA80] text-sm"
                        style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }} />
                </div>

                {tab === 'employee' && (
                    <select value={product} onChange={(e) => setProduct(e.target.value)}
                        className="px-3 py-2 rounded-lg border outline-none text-sm"
                        style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }}>
                        {VISIBLE_PRODUCT_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                )}

                <select value={status} onChange={(e) => setStatus(e.target.value)}
                    className="px-3 py-2 rounded-lg border outline-none text-sm"
                    style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }}>
                    <option value="">{tab === 'employee' ? 'All call statuses' : 'All statuses'}</option>
                    {(tab === 'employee' ? CALL_CENTER_STATUSES : CORPORATE_STATUSES).map(s => <option key={s} value={s}>{prettify(s)}</option>)}
                </select>

                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} title="From date"
                    className="px-3 py-2 rounded-lg border outline-none text-sm"
                    style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }} />
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} title="To date"
                    className="px-3 py-2 rounded-lg border outline-none text-sm"
                    style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }} />

                <button type="submit" className="px-4 py-2 rounded-lg bg-[#14BA80] hover:bg-[#0E8F63] text-white text-sm font-bold">Apply</button>
                <button type="button" onClick={clearFilters} className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-white/5" style={{ color: 'var(--text-auth-muted)' }}>Clear</button>
                <button type="button" onClick={downloadCsv} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#14BA80]/20 text-[#14BA80] hover:bg-[#14BA80]/30 text-sm font-bold ml-auto">
                    <Download className="w-4 h-4" /> Download CSV
                </button>
            </form>

            {/* Table */}
            <div className="rounded-3xl p-4 md:p-6 border backdrop-blur-xl" style={{ backgroundColor: 'var(--bg-auth-card)', borderColor: 'var(--border-auth-card)' }}>
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-auth-muted)' }}>
                        {loading ? 'Loading…' : `${total} lead${total === 1 ? '' : 's'}`}
                    </span>
                    <button onClick={fetchLeads} className="p-2 rounded-lg hover:bg-white/5" title="Refresh" style={{ color: 'var(--text-auth-muted)' }}>
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="border-b" style={{ borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-muted)' }}>
                                {tab === 'employee' ? (
                                    <>
                                        <th className="py-3 px-3 font-semibold">Name</th>
                                        <th className="py-3 px-3 font-semibold">Mobile</th>
                                        <th className="py-3 px-3 font-semibold">Product</th>
                                        <th className="py-3 px-3 font-semibold">Employer</th>
                                        <th className="py-3 px-3 font-semibold">Status</th>
                                        <th className="py-3 px-3 font-semibold">Created</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="py-3 px-3 font-semibold">Company</th>
                                        <th className="py-3 px-3 font-semibold">HR Contact</th>
                                        <th className="py-3 px-3 font-semibold">Mobile</th>
                                        <th className="py-3 px-3 font-semibold">Status</th>
                                        <th className="py-3 px-3 font-semibold">Created</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr><td colSpan={6} className="py-8 text-center" style={{ color: 'var(--text-auth-muted)' }}>No leads found.</td></tr>
                            ) : rows.map((r) => (
                                <tr key={r.id} onClick={() => setSelected(r)}
                                    className="border-b cursor-pointer transition-colors hover:bg-white/5"
                                    style={{ borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }}>
                                    {tab === 'employee' ? (
                                        <>
                                            <td className="py-3 px-3 font-semibold">{r.full_name}</td>
                                            <td className="py-3 px-3">{r.mobile}</td>
                                            <td className="py-3 px-3">{r.product_name}</td>
                                            <td className="py-3 px-3">{r.employer || '—'}</td>
                                            <td className="py-3 px-3"><StatusBadge value={r.product_subcategory === 'portability' ? r.case_status : r.call_center_status} /></td>
                                            <td className="py-3 px-3" style={{ color: 'var(--text-auth-muted)' }}>{fmtDate(r.created_at)}</td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="py-3 px-3 font-semibold">{r.company_name}</td>
                                            <td className="py-3 px-3">{r.hr_contact_name}</td>
                                            <td className="py-3 px-3">{r.hr_contact_mobile}</td>
                                            <td className="py-3 px-3"><StatusBadge value={r.status} /></td>
                                            <td className="py-3 px-3" style={{ color: 'var(--text-auth-muted)' }}>{fmtDate(r.created_at)}</td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                    <span className="text-xs" style={{ color: 'var(--text-auth-muted)' }}>Page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                        <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-40" style={{ color: 'var(--text-auth-muted)' }}>
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-40" style={{ color: 'var(--text-auth-muted)' }}>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {selected && (
                    <LeadDrawer
                        tab={tab}
                        lead={selected}
                        onClose={() => setSelected(null)}
                        onSaved={() => { setSelected(null); fetchLeads(); }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function Field({ label, value }) {
    return (
        <div>
            <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-auth-muted)' }}>{label}</div>
            <div style={{ color: 'var(--text-auth-primary)' }}>{value === null || value === undefined || value === '' ? '—' : String(value)}</div>
        </div>
    );
}

function LeadDrawer({ tab, lead, onClose, onSaved }) {
    const isCorporate = tab === 'corporate';
    const isPortability = !isCorporate && lead.product_subcategory === 'portability';

    const [form, setForm] = useState(() => (
        isCorporate
            ? { status: lead.status || '', assigned_advisor: lead.assigned_advisor || '', note: lead.note || '' }
            : isPortability
                ? { document_status: lead.document_status || '', insurer_status: lead.insurer_status || '', case_status: lead.case_status || '', case_owner: lead.case_owner || '' }
                : { call_center_status: lead.call_center_status || '' }
    ));
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const save = async () => {
        setSaving(true);
        try {
            const basePath = isCorporate ? 'corporate-leads' : 'leads';
            const payload = { ...form };
            if (!isCorporate && note.trim()) payload.internal_note = note.trim();
            const res = await fetch(`${API_BASE_URL}/api/superadmin/${basePath}/${lead.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                alert(err.detail ? JSON.stringify(err.detail) : 'Update failed');
                return;
            }
            onSaved();
        } catch (e) {
            alert('Network error');
        } finally {
            setSaving(false);
        }
    };

    const selectCls = "w-full px-3 py-2 rounded-lg border outline-none text-sm focus:ring-2 focus:ring-[#14BA80]";
    const selectStyle = { backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={onClose}>
            <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-3xl rounded-3xl p-6 md:p-8 relative border max-h-[75vh] overflow-y-auto custom-scrollbar"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', boxShadow: '0 10px 20px -6px rgba(15,23,42,0.15), 0 28px 60px -12px rgba(15,23,42,0.42)' }}>
                <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10" style={{ color: 'var(--text-auth-muted)' }}>
                    <X className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-black mb-1" style={{ color: 'var(--text-auth-primary)' }}>
                    {isCorporate ? lead.company_name : lead.full_name}
                </h2>
                <p className="text-sm mb-6" style={{ color: 'var(--text-auth-muted)' }}>
                    {isCorporate ? 'Corporate / HR lead' : lead.product_name} · {fmtDate(lead.created_at)}
                </p>

                {/* Read-only details */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {isCorporate ? (
                        <>
                            <Field label="HR Contact" value={lead.hr_contact_name} />
                            <Field label="Mobile" value={lead.hr_contact_mobile} />
                            <Field label="Email" value={lead.hr_contact_email} />
                            <Field label="Employees" value={lead.num_employees} />
                            <Field label="Locations" value={lead.locations} />
                            <Field label="Interested in" value={lead.package_or_service_of_interest} />
                            <div className="col-span-2"><Field label="Message" value={lead.message} /></div>
                        </>
                    ) : (
                        <>
                            <Field label="Mobile" value={lead.mobile} />
                            <Field label="Email" value={lead.email} />
                            <Field label="City" value={lead.city} />
                            <Field label="Employer" value={lead.employer} />
                            <Field label="Designation" value={lead.designation} />
                            <Field label="Preferred contact" value={prettify(lead.preferred_contact_method)} />
                            <Field label="Callback date" value={lead.callback_date || fmtDate(lead.callback_date_time)} />
                            <Field label="Time slot" value={prettify(lead.callback_time_slot)} />
                            <Field label="Source" value={lead.source} />
                            <Field label="Consent" value={lead.callback_consent ? 'Yes' : 'No'} />
                            {lead.message && <div className="col-span-2"><Field label="Message" value={lead.message} /></div>}
                            {lead.details && Object.keys(lead.details).length > 0 && (
                                <div className="col-span-2">
                                    <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-auth-muted)' }}>Product details</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(lead.details).map(([k, v]) => (
                                            <Field key={k} label={prettify(k)} value={Array.isArray(v) ? v.join(', ') : v} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Editable workflow */}
                <div className="rounded-2xl p-4 border mb-4" style={{ borderColor: 'var(--border-auth-card)', backgroundColor: 'var(--bg-auth-input)' }}>
                    <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-auth-primary)' }}>Update status</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {isCorporate && (
                            <>
                                <label className="text-sm"><span style={{ color: 'var(--text-auth-muted)' }}>Status</span>
                                    <select className={selectCls} style={selectStyle} value={form.status} onChange={(e) => set('status', e.target.value)}>
                                        <option value="">—</option>
                                        {CORPORATE_STATUSES.map(s => <option key={s} value={s}>{prettify(s)}</option>)}
                                    </select>
                                </label>
                                <label className="text-sm"><span style={{ color: 'var(--text-auth-muted)' }}>Assigned advisor</span>
                                    <input className={selectCls} style={selectStyle} value={form.assigned_advisor} onChange={(e) => set('assigned_advisor', e.target.value)} />
                                </label>
                                <label className="text-sm col-span-2"><span style={{ color: 'var(--text-auth-muted)' }}>Note</span>
                                    <input className={selectCls} style={selectStyle} value={form.note} onChange={(e) => set('note', e.target.value)} />
                                </label>
                            </>
                        )}
                        {!isCorporate && isPortability && (
                            <>
                                <label className="text-sm"><span style={{ color: 'var(--text-auth-muted)' }}>Case status</span>
                                    <select className={selectCls} style={selectStyle} value={form.case_status} onChange={(e) => set('case_status', e.target.value)}>
                                        <option value="">—</option>
                                        {CASE_STATUSES.map(s => <option key={s} value={s}>{prettify(s)}</option>)}
                                    </select>
                                </label>
                                <label className="text-sm"><span style={{ color: 'var(--text-auth-muted)' }}>Document status</span>
                                    <select className={selectCls} style={selectStyle} value={form.document_status} onChange={(e) => set('document_status', e.target.value)}>
                                        <option value="">—</option>
                                        {DOCUMENT_STATUSES.map(s => <option key={s} value={s}>{prettify(s)}</option>)}
                                    </select>
                                </label>
                                <label className="text-sm"><span style={{ color: 'var(--text-auth-muted)' }}>Insurer status</span>
                                    <select className={selectCls} style={selectStyle} value={form.insurer_status} onChange={(e) => set('insurer_status', e.target.value)}>
                                        <option value="">—</option>
                                        {INSURER_STATUSES.map(s => <option key={s} value={s}>{prettify(s)}</option>)}
                                    </select>
                                </label>
                                <label className="text-sm"><span style={{ color: 'var(--text-auth-muted)' }}>Case owner</span>
                                    <input className={selectCls} style={selectStyle} value={form.case_owner} onChange={(e) => set('case_owner', e.target.value)} />
                                </label>
                            </>
                        )}
                        {!isCorporate && !isPortability && (
                            <label className="text-sm col-span-2"><span style={{ color: 'var(--text-auth-muted)' }}>Call center status</span>
                                <select className={selectCls} style={selectStyle} value={form.call_center_status} onChange={(e) => set('call_center_status', e.target.value)}>
                                    <option value="">—</option>
                                    {CALL_CENTER_STATUSES.map(s => <option key={s} value={s}>{prettify(s)}</option>)}
                                </select>
                            </label>
                        )}
                    </div>
                </div>

                {/* Internal notes (employee leads) */}
                {!isCorporate && (
                    <div className="rounded-2xl p-4 border mb-4" style={{ borderColor: 'var(--border-auth-card)', backgroundColor: 'var(--bg-auth-input)' }}>
                        <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-auth-primary)' }}>Internal notes</h3>
                        <div className="space-y-2 mb-3 max-h-40 overflow-y-auto custom-scrollbar">
                            {(lead.internal_notes || []).length === 0 && <p className="text-sm" style={{ color: 'var(--text-auth-muted)' }}>No notes yet.</p>}
                            {(lead.internal_notes || []).map((n, i) => (
                                <div key={i} className="text-sm p-2 rounded-lg bg-white/5">
                                    <div style={{ color: 'var(--text-auth-primary)' }}>{n.note}</div>
                                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-auth-muted)' }}>{n.by} · {fmtDate(n.ts)}</div>
                                </div>
                            ))}
                        </div>
                        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note (appended)…"
                            className={selectCls} style={selectStyle} />
                    </div>
                )}

                <button onClick={save} disabled={saving}
                    className="w-full py-3 bg-[#14BA80] hover:bg-[#0E8F63] disabled:opacity-60 text-white font-bold rounded-xl transition-all">
                    {saving ? 'Saving…' : 'Save changes'}
                </button>
            </motion.div>
        </motion.div>
    );
}
