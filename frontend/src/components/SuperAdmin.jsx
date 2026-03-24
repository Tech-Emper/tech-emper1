import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Building, Plus, Users, Upload, Edit, Save, X, Search, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';

export default function SuperAdmin() {
    const { user } = useAuth();

    // Check if the user is a superadmin, otherwise redirect
    if (user?.role !== 'superadmin') {
        return <Navigate to="/" replace />;
    }

    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newOrgName, setNewOrgName] = useState('');
    const [addError, setAddError] = useState('');

    const [editingOrgId, setEditingOrgId] = useState(null);
    const [editOrgName, setEditOrgName] = useState('');

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_BASE_URL}/api/superadmin/organizations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrganizations(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddOrganization = async (e) => {
        e.preventDefault();
        const trimmedName = newOrgName.trim();
        if (!trimmedName) {
            setAddError("Organization name is required.");
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_BASE_URL}/api/superadmin/organizations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: trimmedName })
            });

            if (!res.ok) {
                const err = await res.json();
                setAddError(err.detail || "Failed to create organization");
                return;
            }

            const newOrg = await res.json();
            setOrganizations([...organizations, newOrg]);
            setNewOrgName('');
            setIsAddModalOpen(false);
            setAddError('');
        } catch (err) {
            setAddError("Network error. Please try again.");
        }
    };

    const startEditing = (org) => {
        setEditingOrgId(org.id);
        setEditOrgName(org.name);
    };

    const saveEdit = async (id) => {
        const trimmedName = editOrgName.trim();
        if (!trimmedName) {
            alert("Name cannot be empty.");
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_BASE_URL}/api/superadmin/organizations/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: trimmedName })
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.detail || "Failed to edit");
                return;
            }
            const updatedOrg = await res.json();
            setOrganizations(organizations.map(org =>
                org.id === id ? updatedOrg : org
            ));
            setEditingOrgId(null);
        } catch (err) {
            alert("Network error.");
        }
    };

    const handleCsvUpload = async (e, orgId, orgName) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_BASE_URL}/api/superadmin/organizations/${orgId}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.detail || "Failed to upload CSV");
            } else {
                const result = await res.json();
                alert(result.message);
                fetchOrganizations();
            }
        } catch (err) {
            alert("Network error during upload.");
        } finally {
            e.target.value = null;
        }
    };

    const filteredOrganizations = organizations.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3" style={{ color: 'var(--text-auth-primary)' }}>
                        <Building className="w-8 h-8 text-purple-500" />
                        Super Admin Dashboard
                    </h1>
                    <p className="mt-2 font-medium" style={{ color: 'var(--text-auth-muted)' }}>
                        Manage organizations, edit details, and bulk upload employees.
                    </p>
                </div>
                <button
                    onClick={() => { setIsAddModalOpen(true); setAddError(''); setNewOrgName(''); }}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Add Organization
                </button>
            </div>

            <div className="rounded-3xl p-6 md:p-8 border backdrop-blur-xl" style={{ backgroundColor: 'var(--bg-auth-card)', borderColor: 'var(--border-auth-card)' }}>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-auth-primary)' }}>
                        Registered Organizations
                        <span className="bg-purple-500/20 text-purple-500 py-1 px-3 rounded-full text-sm">
                            {organizations.length}
                        </span>
                    </h2>

                    <div className="relative w-full sm:w-auto">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search organizations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                            style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b" style={{ borderColor: 'var(--border-auth-card)' }}>
                                <th className="py-4 px-4 font-semibold text-sm" style={{ color: 'var(--text-auth-muted)' }}>Organization Name</th>
                                <th className="py-4 px-4 font-semibold text-sm" style={{ color: 'var(--text-auth-muted)' }}>Employees</th>
                                <th className="py-4 px-4 font-semibold text-sm text-right" style={{ color: 'var(--text-auth-muted)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filteredOrganizations.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="py-8 text-center" style={{ color: 'var(--text-auth-muted)' }}>
                                            No organizations found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrganizations.map((org) => (
                                        <motion.tr
                                            key={org.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="border-b transition-colors group hover:bg-white/5"
                                            style={{ borderColor: 'var(--border-auth-card)' }}
                                        >
                                            <td className="py-4 px-4">
                                                {editingOrgId === org.id ? (
                                                    <input
                                                        type="text"
                                                        value={editOrgName}
                                                        onChange={(e) => setEditOrgName(e.target.value)}
                                                        className="w-full px-3 py-1.5 rounded-lg border focus:ring-2 focus:ring-purple-500 outline-none"
                                                        style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span className="font-bold" style={{ color: 'var(--text-auth-primary)' }}>{org.name}</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2" style={{ color: 'var(--text-auth-muted)' }}>
                                                    <Users className="w-4 h-4 text-emerald-500" />
                                                    {org.employees}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-end gap-3">
                                                    {editingOrgId === org.id ? (
                                                        <>
                                                            <button
                                                                onClick={() => saveEdit(org.id)}
                                                                className="p-2 bg-emerald-500/20 text-emerald-500 rounded-lg hover:bg-emerald-500/30 transition-colors"
                                                                title="Save"
                                                            >
                                                                <Save className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingOrgId(null)}
                                                                className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                                                                title="Cancel"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => startEditing(org)}
                                                                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                                                style={{ color: 'var(--text-auth-muted)' }}
                                                                title="Edit Organization Details"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <label
                                                                className="flex items-center gap-2 p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors cursor-pointer"
                                                                title="Upload Employees CSV"
                                                            >
                                                                <Upload className="w-4 h-4" />
                                                                <span className="text-xs font-bold hidden xl:inline">Upload CSV</span>
                                                                <input
                                                                    type="file"
                                                                    accept=".csv"
                                                                    className="hidden"
                                                                    onChange={(e) => handleCsvUpload(e, org.id, org.name)}
                                                                />
                                                            </label>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl relative border"
                            style={{ backgroundColor: 'var(--bg-auth-main)', borderColor: 'var(--border-auth-card)' }}
                        >
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="absolute top-6 right-6 p-2 rounded-full transition-colors bg-white/5 hover:bg-white/10"
                                style={{ color: 'var(--text-auth-muted)' }}
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-2xl font-black mb-6" style={{ color: 'var(--text-auth-primary)' }}>Create Organization</h2>

                            <form onSubmit={handleAddOrganization}>
                                <div className="mb-6">
                                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-auth-label)' }}>
                                        Organization Name
                                    </label>
                                    <input
                                        type="text"
                                        value={newOrgName}
                                        onChange={(e) => { setNewOrgName(e.target.value); setAddError(''); }}
                                        placeholder="E.g. Apple Inc."
                                        autoFocus
                                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all ${addError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-purple-500'}`}
                                        style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: addError ? 'rgb(239 68 68)' : 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }}
                                    />
                                    {addError && (
                                        <p className="mt-2 text-sm text-red-500 font-medium flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {addError}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3.5 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all flex justify-center items-center gap-2"
                                >
                                    <Building className="w-5 h-5" />
                                    Confirm Creation
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
