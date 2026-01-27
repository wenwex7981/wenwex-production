'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    Search, Filter, Plus, Eye, CheckCircle, XCircle,
    Package, BadgeCheck, Star, Calendar, ExternalLink,
    MoreVertical, Loader2, DollarSign, Edit
} from 'lucide-react';
import { fetchServices, updateServiceStatus, fetchCategories, createService, updateService } from '@/lib/admin-service';
import { toast } from 'react-hot-toast';

export default function AdminServicesPage() {
    const [services, setServices] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<any>(null);
    const [newService, setNewService] = useState({
        title: '',
        description: '',
        price: '',
        category_id: '',
        vendor_id: '', // For admin added services, we might need a system vendor or pick one
        status: 'APPROVED',
        service_type: 'IT & TECH',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [servicesData, categoriesData] = await Promise.all([
                fetchServices(),
                fetchCategories()
            ]);
            setServices(servicesData || []);
            setCategories(categoriesData || []);
        } catch (error: any) {
            toast.error('Failed to load data: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await updateServiceStatus(id, status);
            toast.success(`Service status updated to ${status}`);
            loadData();
        } catch (error: any) {
            toast.error('Failed to update status: ' + error.message);
        }
    };

    const handleCreateService = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // In a real app, you'd validate and maybe pick a default vendor
            // For now, let's assume we have a system vendor or just mock the ID
            await createService({
                ...newService,
                price: parseFloat(newService.price),
                slug: newService.title.toLowerCase().replace(/ /g, '-'),
                delivery_days: 7 // default
            });
            toast.success('Service created successfully');
            setIsAddModalOpen(false);
            loadData();
        } catch (error: any) {
            toast.error('Failed to create service: ' + error.message);
        }
    };

    const handleEditService = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateService(editingService.id, {
                title: editingService.title,
                description: editingService.description,
                price: parseFloat(editingService.price),
                category_id: editingService.category_id,
                service_type: editingService.service_type,
                is_featured: editingService.is_featured
            });
            toast.success('Service updated successfully');
            setIsEditModalOpen(false);
            loadData();
        } catch (error: any) {
            toast.error('Failed to update service: ' + error.message);
        }
    };

    const filteredServices = services.filter(service => {
        const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.vendor?.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Service Management</h1>
                    <p className="text-gray-400">Manage, moderate and add platform services</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn-primary"
                >
                    <Plus className="w-4 h-4" />
                    Add New Service
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search services or vendors..."
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
                    <option value="DRAFT">Draft</option>
                </select>
            </div>

            {/* Services Table */}
            <div className="card overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="table-header px-6">Service</th>
                                <th className="table-header px-4">Vendor</th>
                                <th className="table-header px-4">Price</th>
                                <th className="table-header px-4">Status</th>
                                <th className="table-header px-4">Rating</th>
                                <th className="table-header px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-2" />
                                        <p className="text-gray-400">Loading services...</p>
                                    </td>
                                </tr>
                            ) : filteredServices.map((service) => (
                                <tr key={service.id} className="hover:bg-gray-800/50">
                                    <td className="table-cell px-6">
                                        <div>
                                            <p className="font-medium text-white">{service.title}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{service.slug}</p>
                                        </div>
                                    </td>
                                    <td className="table-cell px-4">
                                        <span className="text-gray-300">{service.vendor?.company_name || 'Admin'}</span>
                                    </td>
                                    <td className="table-cell px-4 text-white font-medium">
                                        ${service.price}
                                    </td>
                                    <td className="table-cell px-4">
                                        <span className={`badge ${service.status === 'APPROVED' ? 'bg-green-500/10 text-green-400' :
                                            service.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400' :
                                                'bg-red-500/10 text-red-400'
                                            }`}>
                                            {service.status}
                                        </span>
                                    </td>
                                    <td className="table-cell px-4">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            <span className="text-white">{service.rating || '0'}</span>
                                        </div>
                                    </td>
                                    <td className="table-cell px-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {(service.status === 'PENDING' || service.status === 'DRAFT') && (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdateStatus(service.id, 'APPROVED')}
                                                        className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(service.id, 'REJECTED')}
                                                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            {service.status === 'APPROVED' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(service.id, 'REJECTED')}
                                                    className="p-2 text-yellow-400 hover:bg-yellow-500/10 rounded-lg"
                                                    title="Revoke Approval"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            {service.status === 'REJECTED' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(service.id, 'APPROVED')}
                                                    className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg"
                                                    title="Approve"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setEditingService(service);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="p-2 text-primary-400 hover:bg-primary-500/10 rounded-lg"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <Link href={`/services/${service.slug}`} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Service Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70" onClick={() => setIsAddModalOpen(false)} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative bg-gray-800 rounded-2xl p-6 max-w-lg w-full border border-gray-700"
                    >
                        <h2 className="text-xl font-bold text-white mb-6">Add New Service</h2>
                        <form onSubmit={handleCreateService} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={newService.title}
                                    onChange={e => setNewService({ ...newService, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                <textarea
                                    className="input w-full h-24 resize-none"
                                    value={newService.description}
                                    onChange={e => setNewService({ ...newService, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Price ($)</label>
                                    <input
                                        type="number"
                                        className="input w-full"
                                        value={newService.price}
                                        onChange={e => setNewService({ ...newService, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                                    <select
                                        className="input w-full"
                                        value={newService.category_id}
                                        onChange={e => setNewService({ ...newService, category_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Service Type</label>
                                <select
                                    className="input w-full"
                                    value={newService.service_type}
                                    onChange={e => setNewService({ ...newService, service_type: e.target.value })}
                                    required
                                >
                                    <option value="IT & TECH">IT & TECH</option>
                                    <option value="ACADEMIC">ACADEMIC</option>
                                </select>
                            </div>
                            <div className="flex gap-4 mt-8">
                                <button
                                    type="button"
                                    className="btn-secondary flex-1"
                                    onClick={() => setIsAddModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary flex-1">
                                    Create Service
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
            {/* Edit Service Modal */}
            {isEditModalOpen && editingService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70" onClick={() => setIsEditModalOpen(false)} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative bg-gray-800 rounded-2xl p-6 max-w-lg w-full border border-gray-700"
                    >
                        <h2 className="text-xl font-bold text-white mb-6">Edit Service</h2>
                        <form onSubmit={handleEditService} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={editingService.title}
                                    onChange={e => setEditingService({ ...editingService, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                <textarea
                                    className="input w-full h-24 resize-none"
                                    value={editingService.description || ''}
                                    onChange={e => setEditingService({ ...editingService, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Price ($)</label>
                                    <input
                                        type="number"
                                        className="input w-full"
                                        value={editingService.price}
                                        onChange={e => setEditingService({ ...editingService, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                                    <select
                                        className="input w-full"
                                        value={editingService.category_id}
                                        onChange={e => setEditingService({ ...editingService, category_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Service Type</label>
                                <select
                                    className="input w-full"
                                    value={editingService.service_type || 'IT & TECH'}
                                    onChange={e => setEditingService({ ...editingService, service_type: e.target.value })}
                                    required
                                >
                                    <option value="IT & TECH">IT & TECH</option>
                                    <option value="ACADEMIC">ACADEMIC</option>
                                </select>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded text-primary-500 bg-gray-700 border-gray-600 focus:ring-primary-500 focus:ring-offset-gray-800"
                                        checked={editingService.is_featured || false}
                                        onChange={e => setEditingService({ ...editingService, is_featured: e.target.checked })}
                                    />
                                    <span className="text-sm font-medium text-gray-400">Featured Service</span>
                                </label>
                                <p className="text-xs text-gray-500 mt-1 ml-6">
                                    Featured services appear on the buyer homepage spotlight.
                                </p>
                            </div>
                            <div className="flex gap-4 mt-8">
                                <button
                                    type="button"
                                    className="btn-secondary flex-1"
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary flex-1">
                                    Update Service
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
