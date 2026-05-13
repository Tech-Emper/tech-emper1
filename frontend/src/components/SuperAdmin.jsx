import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Building, Plus, Users, Upload, Edit, Save, X, Search, AlertCircle, UserPlus, Trash2 } from 'lucide-react';
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

    // Unified Modal State for Add / Edit
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'add', orgId: null });
    const [orgFormName, setOrgFormName] = useState('');
    const [orgKeyMembers, setOrgKeyMembers] = useState([]);
    const [existingKeyMembers, setExistingKeyMembers] = useState([]);
    const [removedAdmins, setRemovedAdmins] = useState([]);
    const [formError, setFormError] = useState('');

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

    const openAddModal = () => {
        setModalConfig({ isOpen: true, type: 'add', orgId: null });
        setOrgFormName('');
        setOrgKeyMembers([]);
        setExistingKeyMembers([]);
        setRemovedAdmins([]);
        setFormError('');
    };

    const openEditModal = async (org) => {
        setModalConfig({ isOpen: true, type: 'edit', orgId: org.id });
        setOrgFormName(org.name);
        setOrgKeyMembers([]);
        setExistingKeyMembers([]);
        setRemovedAdmins([]);
        setFormError('');

        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_BASE_URL}/api/superadmin/organizations/${org.id}/admins`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setExistingKeyMembers(data);
            }
        } catch (e) {
            console.error("Failed to fetch existing admins", e);
        }
    };

    const closeModal = () => {
        setModalConfig({ isOpen: false, type: 'add', orgId: null });
    };

    const handleAddKeyMember = () => {
        setOrgKeyMembers([...orgKeyMembers, {
            first_name: '',
            last_name: '',
            email: '',
            mobile: '',
            designation: '',
            role: 'Admin'
        }]);
    };

    const updateKeyMember = (index, field, value) => {
        const newMembers = [...orgKeyMembers];
        newMembers[index][field] = value;
        setOrgKeyMembers(newMembers);
    };

    const removeKeyMember = (index) => {
        setOrgKeyMembers(orgKeyMembers.filter((_, i) => i !== index));
    };

    const removeExistingKeyMember = (index) => {
        const member = existingKeyMembers[index];
        setRemovedAdmins([...removedAdmins, member.id]);
        setExistingKeyMembers(existingKeyMembers.filter((_, i) => i !== index));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const trimmedName = orgFormName.trim();
        if (!trimmedName) {
            setFormError("Organization name is required.");
            return;
        }

        // Validate key members
        for (let i = 0; i < orgKeyMembers.length; i++) {
            const m = orgKeyMembers[i];
            if (!m.first_name || !m.email || !m.mobile) {
                setFormError(`New Key Member ${i + 1} is missing required fields (First Name, Email, Phone Number).`);
                return;
            }
        }

        try {
            const token = localStorage.getItem('auth_token');
            const url = modalConfig.type === 'add' 
                ? `${API_BASE_URL}/api/superadmin/organizations`
                : `${API_BASE_URL}/api/superadmin/organizations/${modalConfig.orgId}`;
            
            const method = modalConfig.type === 'add' ? 'POST' : 'PUT';

            const payload = {
                name: trimmedName,
                admins: orgKeyMembers,
                removed_admins: removedAdmins
            };

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json();
                setFormError(err.detail || `Failed to ${modalConfig.type} organization`);
                return;
            }

            await fetchOrganizations();
            closeModal();
        } catch (err) {
            setFormError("Network error. Please try again.");
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
                    onClick={openAddModal}
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
                                                <span className="font-bold" style={{ color: 'var(--text-auth-primary)' }}>{org.name}</span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2" style={{ color: 'var(--text-auth-muted)' }}>
                                                    <Users className="w-4 h-4 text-emerald-500" />
                                                    {org.employees}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => openEditModal(org)}
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

            {/* Form Modal */}
            <AnimatePresence>
                {modalConfig.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl relative border my-8"
                            style={{ backgroundColor: 'var(--bg-auth-main)', borderColor: 'var(--border-auth-card)' }}
                        >
                            <button
                                type="button"
                                onClick={closeModal}
                                className="absolute top-6 right-6 p-2 rounded-full transition-colors bg-white/5 hover:bg-white/10"
                                style={{ color: 'var(--text-auth-muted)' }}
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-2xl font-black mb-6" style={{ color: 'var(--text-auth-primary)' }}>
                                {modalConfig.type === 'add' ? 'Create Organization' : 'Edit Organization'}
                            </h2>

                            <form onSubmit={handleFormSubmit}>
                                <div className="mb-6">
                                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-auth-label)' }}>
                                        Organization Name
                                    </label>
                                    <input
                                        type="text"
                                        value={orgFormName}
                                        onChange={(e) => { setOrgFormName(e.target.value); setFormError(''); }}
                                        placeholder="E.g. Apple Inc."
                                        autoFocus
                                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all ${formError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-purple-500'}`}
                                        style={{ backgroundColor: 'var(--bg-auth-input)', borderColor: formError ? 'rgb(239 68 68)' : 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }}
                                    />
                                </div>

                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="block text-sm font-bold" style={{ color: 'var(--text-auth-label)' }}>
                                            Key Members
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleAddKeyMember}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-500 rounded-lg text-sm font-bold hover:bg-blue-500/30 transition-colors"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            Add Key Member
                                        </button>
                                    </div>

                                    {orgKeyMembers.length === 0 && existingKeyMembers.length === 0 ? (
                                        <div className="text-sm p-4 rounded-xl border border-dashed text-center" style={{ borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-muted)' }}>
                                            No key members added yet. Click above to add an Admin or HR manager.
                                        </div>
                                    ) : (
                                        <div className="space-y-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                            {/* Existing Key Members (Read-only, can only remove) */}
                                            {existingKeyMembers.length > 0 && (
                                                <div>
                                                    <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-auth-muted)' }}>Existing Members</h3>
                                                    <div className="overflow-x-auto border rounded-xl" style={{ borderColor: 'var(--border-auth-card)' }}>
                                                        <table className="w-full text-left text-sm">
                                                            <thead>
                                                                <tr className="border-b bg-white/5" style={{ borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-muted)' }}>
                                                                    <th className="p-3 font-semibold">Name</th>
                                                                    <th className="p-3 font-semibold">Role</th>
                                                                    <th className="p-3 font-semibold text-center w-16">Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {existingKeyMembers.map((member, index) => (
                                                                    <tr key={`existing-${member.id}`} className="border-b last:border-b-0 transition-colors hover:bg-white/5" style={{ borderColor: 'var(--border-auth-card)' }}>
                                                                        <td className="p-3 font-medium" style={{ color: 'var(--text-auth-primary)' }}>
                                                                            {member.first_name} {member.last_name}
                                                                        </td>
                                                                        <td className="p-3" style={{ color: 'var(--text-auth-muted)' }}>
                                                                            {member.role}
                                                                        </td>
                                                                        <td className="p-3 text-center">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => removeExistingKeyMember(index)}
                                                                                className="p-1.5 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors inline-block"
                                                                                title="Remove Member"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            {/* New Key Members (Editable) */}
                                            {orgKeyMembers.length > 0 && (
                                                <div className="space-y-4">
                                                    {existingKeyMembers.length > 0 && (
                                                        <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-auth-muted)' }}>New Members to Add</h3>
                                                    )}
                                                    {orgKeyMembers.map((member, index) => (
                                                        <div key={`new-${index}`} className="p-4 rounded-xl border" style={{ borderColor: 'var(--border-auth-card)', backgroundColor: 'var(--bg-auth-input)' }}>
                                                            <div className="flex justify-between items-center mb-3">
                                                                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-auth-muted)' }}>New Member {index + 1}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeKeyMember(index)}
                                                                    className="p-1.5 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                                                                    title="Remove Member"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                <input type="text" placeholder="First Name *" value={member.first_name} onChange={(e) => updateKeyMember(index, 'first_name', e.target.value)} className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 outline-none text-sm" style={{ backgroundColor: 'var(--bg-auth-main)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }} required />
                                                                <input type="text" placeholder="Last Name" value={member.last_name} onChange={(e) => updateKeyMember(index, 'last_name', e.target.value)} className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 outline-none text-sm" style={{ backgroundColor: 'var(--bg-auth-main)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }} />
                                                                <input type="email" placeholder="Email ID *" value={member.email} onChange={(e) => updateKeyMember(index, 'email', e.target.value)} className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 outline-none text-sm" style={{ backgroundColor: 'var(--bg-auth-main)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }} required />
                                                                <input type="text" placeholder="Phone Number *" value={member.mobile} onChange={(e) => updateKeyMember(index, 'mobile', e.target.value)} className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 outline-none text-sm" style={{ backgroundColor: 'var(--bg-auth-main)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }} required />
                                                                <input type="text" placeholder="Designation" value={member.designation} onChange={(e) => updateKeyMember(index, 'designation', e.target.value)} className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 outline-none text-sm" style={{ backgroundColor: 'var(--bg-auth-main)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }} />
                                                                <select value={member.role} onChange={(e) => updateKeyMember(index, 'role', e.target.value)} className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 outline-none text-sm" style={{ backgroundColor: 'var(--bg-auth-main)', borderColor: 'var(--border-auth-card)', color: 'var(--text-auth-primary)' }}>
                                                                    <option value="Admin">Admin</option>
                                                                    <option value="HR manager">HR Manager</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {formError && (
                                    <p className="mb-4 text-sm text-red-500 font-medium flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {formError}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    className="w-full py-3.5 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all flex justify-center items-center gap-2"
                                >
                                    <Building className="w-5 h-5" />
                                    {modalConfig.type === 'add' ? 'Confirm Creation' : 'Save Changes'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
