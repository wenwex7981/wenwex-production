'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, MoreVertical, Eye, CheckCircle, XCircle,
    Building2, BadgeCheck, Star, Calendar, Mail, Globe, Ban, Loader2,
    Edit2, Save, X, Trash2, ExternalLink
} from 'lucide-react';
import { fetchVendors, updateVendorStatus, updateVendor } from '@/lib/admin-service';
import { toast } from 'react-hot-toast';

const statusStyles = {
    APPROVED: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Approved' },
    PENDING: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Pending' },
    REJECTED: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Rejected' },
    SUSPENDED: { bg: 'bg-gray-500/10', text: 'text-gray-400', label: 'Suspended' },
};

export default function AdminVendorsPage() {
    const [vendors, setVendors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedVendor, setSelectedVendor] = useState<any | null>(null);
    const [editVendor, setEditVendor] = useState<any | null>(null);
    const [actionModal, setActionModal] = useState<{ vendor: any, action: string } | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        loadVendors();
    }, []);

    const loadVendors = async () => {
        setIsLoading(true);
        try {
            const data = await fetchVendors();
            setVendors(data || []);
        } catch (error: any) {
            toast.error('Failed to load vendors: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!actionModal) return;

        setIsUpdating(true);
        const newStatus = actionModal.action === 'approve' ? 'APPROVED' :
            actionModal.action === 'reject' ? 'REJECTED' : 'SUSPENDED';

        try {
            await updateVendorStatus(actionModal.vendor.id, newStatus, rejectionReason);
            toast.success(`Vendor ${actionModal.action}d successfully`);
            setActionModal(null);
            setRejectionReason('');
            loadVendors();
        } catch (error: any) {
            toast.error('Failed to update status: ' + error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editVendor) return;

        setIsUpdating(true);
        try {
            const { id, ...updateData } = editVendor;
            await updateVendor(id, {
                company_name: updateData.company_name,
                description: updateData.description,
                official_email: updateData.official_email,
                country: updateData.country,
                logo_url: updateData.logo_url,
                banner_url: updateData.banner_url,
                rating: updateData.rating,
                total_reviews: updateData.total_reviews,
                followers_count: updateData.followers_count,
                is_verified: updateData.is_verified,
            });
            toast.success('Vendor profile updated - changes live on buyer website!');
            setEditVendor(null);
            loadVendors();
        } catch (error: any) {
            toast.error('Update failed: ' + error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const filteredVendors = vendors.filter(vendor => {
        const matchesSearch = vendor.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vendor.official_email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const pendingCount = vendors.filter(v => v.status === 'PENDING').length;

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Vendor Management</h1>
                    <p className="text-gray-400">Manage, moderate and edit vendor profiles</p>
                </div>
                {pendingCount > 0 && (
                    <span className="badge bg-yellow-500/10 text-yellow-400 animate-pulse">
                        {pendingCount} pending approval
                    </span>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search vendors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input pl-12 w-full"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input w-full sm:w-48"
                >
                    <option value="all">All Status</option>
                    <option value="APPROVED">Approved</option>
                    <option value="PENDING">Pending</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="SUSPENDED">Suspended</option>
                </select>
            </div>

            {/* Vendors Table */}
            <div className="card overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="table-header px-6">Vendor</th>
                                <th className="table-header px-4">Status</th>
                                <th className="table-header px-4">Country</th>
                                <th className="table-header px-4 text-center">Verified</th>
                                <th className="table-header px-4">Joined</th>
                                <th className="table-header px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                                            <p className="text-gray-400">Loading vendors...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredVendors.map((vendor) => {
                                const status = statusStyles[vendor.status as keyof typeof statusStyles] || statusStyles.PENDING;
                                return (
                                    <tr key={vendor.id} className="hover:bg-gray-800/50 group">
                                        <td className="table-cell px-6">
                                            <div className="flex items-center gap-4">
                                                <Image
                                                    src={vendor.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.company_name)}&background=random&color=fff`}
                                                    alt={vendor.company_name}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-lg ring-1 ring-gray-700"
                                                />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-white">{vendor.company_name}</span>
                                                    </div>
                                                    <span className="text-sm text-gray-500">{vendor.official_email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="table-cell px-4">
                                            <span className={`badge ${status.bg} ${status.text}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="table-cell px-4">
                                            <span className="text-gray-400">{vendor.country || 'N/A'}</span>
                                        </td>
                                        <td className="table-cell px-4 text-center">
                                            {vendor.is_verified ? (
                                                <BadgeCheck className="w-5 h-5 text-primary-400 mx-auto" />
                                            ) : (
                                                <span className="text-gray-600">—</span>
                                            )}
                                        </td>
                                        <td className="table-cell px-4">
                                            <span className="text-gray-400 text-xs">{new Date(vendor.created_at).toLocaleDateString()}</span>
                                        </td>
                                        <td className="table-cell px-4">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setSelectedVendor(vendor)}
                                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                                                    title="Quick View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setEditVendor(vendor)}
                                                    className="p-2 text-primary-400 hover:bg-primary-500/10 rounded-lg"
                                                    title="Edit Profile"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                {vendor.status === 'PENDING' ? (
                                                    <button
                                                        onClick={() => setActionModal({ vendor, action: 'approve' })}
                                                        className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => setActionModal({ vendor, action: 'suspend' })}
                                                        className="p-2 text-yellow-400 hover:bg-yellow-500/10 rounded-lg"
                                                        title="Suspend"
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Vendor Detail Modal */}
            <AnimatePresence>
                {selectedVendor && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                            onClick={() => setSelectedVendor(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="relative bg-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <Image
                                    src={selectedVendor.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedVendor.company_name)}&background=random&color=fff`}
                                    alt={selectedVendor.company_name}
                                    width={64}
                                    height={64}
                                    className="rounded-xl border border-gray-700"
                                />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-semibold text-white">{selectedVendor.company_name}</h3>
                                        {selectedVendor.is_verified && <BadgeCheck className="w-5 h-5 text-primary-400" />}
                                    </div>
                                    <span className={`badge ${statusStyles[selectedVendor.status as keyof typeof statusStyles]?.bg} ${statusStyles[selectedVendor.status as keyof typeof statusStyles]?.text}`}>
                                        {statusStyles[selectedVendor.status as keyof typeof statusStyles]?.label || 'Pending'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl">
                                    <Mail className="w-5 h-5 text-gray-500" />
                                    <span className="text-gray-300">{selectedVendor.official_email}</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl">
                                    <Globe className="w-5 h-5 text-gray-500" />
                                    <span className="text-gray-300">{selectedVendor.country || 'No Country Set'}</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl">
                                    <Calendar className="w-5 h-5 text-gray-500" />
                                    <span className="text-gray-300">Joined {new Date(selectedVendor.created_at).toLocaleDateString()}</span>
                                </div>

                                {selectedVendor.verification_documents && selectedVendor.verification_documents.length > 0 && (
                                    <div className="pt-4 border-t border-gray-700">
                                        <h4 className="text-xs font-black uppercase text-gray-500 tracking-widest mb-3">Verification Assets</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {selectedVendor.verification_documents.map((url: string, idx: number) => (
                                                <a
                                                    key={idx}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="aspect-square rounded-xl bg-gray-900 overflow-hidden border border-gray-700 hover:border-primary-500 transition-colors group relative"
                                                >
                                                    <img src={url} alt={`Doc ${idx}`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                        <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button onClick={() => setSelectedVendor(null)} className="btn-secondary flex-1">
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setEditVendor(selectedVendor);
                                        setSelectedVendor(null);
                                    }}
                                    className="btn-primary flex-1"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Vendor Modal */}
            <AnimatePresence>
                {editVendor && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => setEditVendor(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative bg-gray-800 rounded-2xl p-6 max-w-2xl w-full border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-primary-500" />
                                Edit Vendor Profile
                            </h2>
                            <p className="text-gray-400 text-sm mb-6">Changes will reflect on buyer website immediately</p>

                            <form onSubmit={handleSaveEdit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Company Name</label>
                                        <input
                                            type="text"
                                            className="input w-full"
                                            value={editVendor.company_name || ''}
                                            onChange={(e) => setEditVendor({ ...editVendor, company_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</label>
                                        <textarea
                                            className="input w-full h-24 resize-none"
                                            placeholder="Agency description shown on buyer website"
                                            value={editVendor.description || ''}
                                            onChange={(e) => setEditVendor({ ...editVendor, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Official Email</label>
                                        <input
                                            type="email"
                                            className="input w-full"
                                            value={editVendor.official_email || ''}
                                            onChange={(e) => setEditVendor({ ...editVendor, official_email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Country</label>
                                        <input
                                            type="text"
                                            className="input w-full"
                                            value={editVendor.country || ''}
                                            onChange={(e) => setEditVendor({ ...editVendor, country: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Logo URL</label>
                                        <input
                                            type="url"
                                            className="input w-full text-xs"
                                            placeholder="https://..."
                                            value={editVendor.logo_url || ''}
                                            onChange={(e) => setEditVendor({ ...editVendor, logo_url: e.target.value })}
                                        />
                                        {editVendor.logo_url && (
                                            <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden border border-gray-700">
                                                <img src={editVendor.logo_url} alt="Logo preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Banner URL</label>
                                        <input
                                            type="url"
                                            className="input w-full text-xs"
                                            placeholder="https://..."
                                            value={editVendor.banner_url || ''}
                                            onChange={(e) => setEditVendor({ ...editVendor, banner_url: e.target.value })}
                                        />
                                        {editVendor.banner_url && (
                                            <div className="mt-2 h-20 rounded-xl overflow-hidden border border-gray-700">
                                                <img src={editVendor.banner_url} alt="Banner preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rating (0-5)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="5"
                                            className="input w-full"
                                            value={editVendor.rating || 0}
                                            onChange={(e) => setEditVendor({ ...editVendor, rating: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Reviews</label>
                                        <input
                                            type="number"
                                            className="input w-full"
                                            value={editVendor.total_reviews || 0}
                                            onChange={(e) => setEditVendor({ ...editVendor, total_reviews: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Followers Count</label>
                                        <input
                                            type="number"
                                            className="input w-full"
                                            value={editVendor.followers_count || 0}
                                            onChange={(e) => setEditVendor({ ...editVendor, followers_count: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Verification</label>
                                        <select
                                            className="input w-full"
                                            value={editVendor.is_verified ? 'true' : 'false'}
                                            onChange={(e) => setEditVendor({ ...editVendor, is_verified: e.target.value === 'true' })}
                                        >
                                            <option value="true">✓ Verified</option>
                                            <option value="false">Not Verified</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-6 border-t border-gray-700">
                                    <button type="button" onClick={() => setEditVendor(null)} className="btn-secondary flex-1">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isUpdating} className="btn-primary flex-1 gap-2">
                                        {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Action Modal (Approve/Reject/Suspend) */}
            <AnimatePresence>
                {actionModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/70"
                            onClick={() => setActionModal(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700 shadow-2xl"
                        >
                            <h3 className="text-lg font-semibold text-white mb-2">
                                {actionModal.action === 'approve' && 'Approve Vendor?'}
                                {actionModal.action === 'reject' && 'Reject Vendor?'}
                                {actionModal.action === 'suspend' && 'Suspend Vendor?'}
                            </h3>
                            <p className="text-gray-400 mb-4">
                                {actionModal.action === 'approve' && `This will approve "${actionModal.vendor.company_name}" and allow them to list services.`}
                                {actionModal.action === 'reject' && `This will reject "${actionModal.vendor.company_name}". They will be notified.`}
                                {actionModal.action === 'suspend' && `This will suspend "${actionModal.vendor.company_name}" and hide all their services.`}
                            </p>
                            {(actionModal.action === 'reject' || actionModal.action === 'suspend') && (
                                <textarea
                                    placeholder="Reason (optional)"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="input mb-4 resize-none h-24"
                                />
                            )}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setActionModal(null)}
                                    className="btn-secondary flex-1"
                                    disabled={isUpdating}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateStatus}
                                    disabled={isUpdating}
                                    className={`flex-1 ${actionModal.action === 'approve' ? 'btn-success' :
                                        actionModal.action === 'reject' ? 'btn-danger' :
                                            'btn bg-yellow-600 text-white hover:bg-yellow-700'
                                        }`}>
                                    {isUpdating ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <span className="capitalize">{actionModal.action}</span>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
