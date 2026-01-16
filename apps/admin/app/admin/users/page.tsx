'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, User, Mail, Shield, ShieldCheck,
    MoreVertical, Edit2, Trash2, X, Check, Loader2,
    Filter, ArrowUpDown, UserPlus
} from 'lucide-react';
import { fetchUsers, updateUser, deleteUser } from '@/lib/admin-service';
import { toast } from 'react-hot-toast';

const roleColors: Record<string, string> = {
    ADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    VENDOR: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    BUYER: 'bg-green-500/10 text-green-400 border-green-500/20',
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const data = await fetchUsers();
            setUsers(data || []);
        } catch (error: any) {
            toast.error('Failed to load users: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        setIsUpdating(true);
        try {
            const { id, ...updateData } = selectedUser;
            await updateUser(id, {
                full_name: updateData.full_name,
                role: updateData.role,
                phone: updateData.phone,
                country: updateData.country
            });
            toast.success('User updated successfully');
            setIsEditModalOpen(false);
            loadUsers();
        } catch (error: any) {
            toast.error('Update failed: ' + error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            await deleteUser(id);
            toast.success('User deleted successfully');
            loadUsers();
        } catch (error: any) {
            toast.error('Deletion failed: ' + error.message);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">User Management</h1>
                    <p className="text-gray-400">View and manage all users across the platform</p>
                </div>
                <button className="btn-primary">
                    <UserPlus className="w-4 h-4" />
                    New User
                </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input pl-12 w-full"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="input w-40"
                    >
                        <option value="all">All Roles</option>
                        <option value="BUYER">Buyers</option>
                        <option value="VENDOR">Vendors</option>
                        <option value="ADMIN">Admins</option>
                    </select>
                    <button className="p-2 border border-gray-700 rounded-lg hover:bg-gray-800 text-gray-400 transition-colors">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-700 bg-gray-800/50">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
                                        <p className="text-gray-400">Loading user database...</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-700/20 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-indigo-500/20 border border-primary-500/30 flex items-center justify-center font-bold text-primary-400">
                                                    {user.full_name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-white">{user.full_name || 'Anonymous'}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${roleColors[user.role] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-300">{user.phone || 'N/A'}</div>
                                            <div className="text-xs text-gray-500">{user.country || 'No Location'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-400">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                                                    title="Edit User"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <p className="text-gray-500">No users found matching your criteria</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit User Modal */}
            <AnimatePresence>
                {isEditModalOpen && selectedUser && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-primary-500" />
                                    Edit User Access
                                </h2>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-sm font-medium text-gray-400">Full Name</label>
                                        <input
                                            type="text"
                                            className="input w-full"
                                            value={selectedUser.full_name || ''}
                                            onChange={(e) => setSelectedUser({ ...selectedUser, full_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Role</label>
                                        <select
                                            className="input w-full"
                                            value={selectedUser.role}
                                            onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                                        >
                                            <option value="BUYER">Buyer</option>
                                            <option value="VENDOR">Vendor</option>
                                            <option value="ADMIN">Admin</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Country</label>
                                        <input
                                            type="text"
                                            className="input w-full"
                                            value={selectedUser.country || ''}
                                            onChange={(e) => setSelectedUser({ ...selectedUser, country: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-sm font-medium text-gray-400">Phone Number</label>
                                        <input
                                            type="text"
                                            className="input w-full"
                                            value={selectedUser.phone || ''}
                                            onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="btn-secondary flex-1"
                                        disabled={isUpdating}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary flex-1 gap-2"
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
