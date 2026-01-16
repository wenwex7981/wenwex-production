'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye,
    Star, Clock, Package, CheckCircle, XCircle, AlertCircle, Loader2
} from 'lucide-react';
import { fetchVendorServices, getCurrentVendor, deleteService } from '@/lib/vendor-service';
import { toast } from 'react-hot-toast';

const statusColors: Record<string, string> = {
    APPROVED: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    REJECTED: 'bg-red-100 text-red-700',
    DRAFT: 'bg-gray-100 text-gray-700',
};

const statusIcons: Record<string, any> = {
    APPROVED: CheckCircle,
    PENDING: Clock,
    REJECTED: XCircle,
    DRAFT: AlertCircle,
};

export default function VendorServicesPage() {
    const [services, setServices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [vendor, setVendor] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const vendorData = await getCurrentVendor();

            // If vendor data is null, show empty state
            if (!vendorData) {
                setServices([]);
                setIsLoading(false);
                return;
            }

            setVendor(vendorData);
            const servicesData = await fetchVendorServices(vendorData.id);
            setServices(servicesData || []);
        } catch (error: any) {
            console.error('Services load error:', error);
            toast.error(error.message || 'Failed to load services');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!showDeleteModal) return;
        setIsDeleting(true);
        try {
            await deleteService(showDeleteModal);
            toast.success('Service deleted successfully');
            setServices(services.filter(s => s.id !== showDeleteModal));
            setShowDeleteModal(null);
        } catch (error: any) {
            toast.error('Failed to delete service');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredServices = services.filter(service => {
        const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
                    <p className="text-gray-500">Manage and track your service listings</p>
                </div>
                <Link href="/dashboard/services/new" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-semibold shadow-lg shadow-primary-600/20">
                    <Plus className="w-5 h-5" />
                    Add New Service
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search services..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all cursor-pointer"
                >
                    <option value="all">All Status</option>
                    <option value="APPROVED">Approved</option>
                    <option value="PENDING">Pending</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="DRAFT">Draft</option>
                </select>
            </div>

            {/* Services List */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="text-left py-4 px-6 font-semibold text-gray-600">Service</th>
                                <th className="text-left py-4 px-4 font-semibold text-gray-600">Status</th>
                                <th className="text-left py-4 px-4 font-semibold text-gray-600">Base Price</th>
                                <th className="text-left py-4 px-4 font-semibold text-gray-600">Rating</th>
                                <th className="text-left py-4 px-4 font-semibold text-gray-600">Activity</th>
                                <th className="text-right py-4 px-6 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                                            <p className="text-gray-400">Loading your services...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredServices.map((service) => {
                                const StatusIcon = statusIcons[service.status as keyof typeof statusIcons] || AlertCircle;
                                return (
                                    <tr key={service.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-100">
                                                    <Image
                                                        src={service.main_image_url || 'https://images.unsplash.com/photo-1557821552-17105176677c?w=400'}
                                                        alt={service.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 line-clamp-1">{service.title}</h3>
                                                    <p className="text-xs text-gray-400 mt-1">Created {new Date(service.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold leading-none ${statusColors[service.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-600'}`}>
                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                {service.status}
                                            </span>
                                            {service.rejection_reason && (
                                                <div className="flex items-center gap-1 text-[10px] text-red-500 mt-1 max-w-[150px]">
                                                    <AlertCircle className="w-3 h-3 shrink-0" />
                                                    <span className="truncate">{service.rejection_reason}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="font-bold text-gray-900">${service.price}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            {service.rating > 0 ? (
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                    <span className="font-bold text-gray-900">{service.rating}</span>
                                                    <span className="text-xs text-gray-400">({service.total_reviews})</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs font-medium">No reviews</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs text-gray-500 font-medium">{service.view_count || 0} views</span>
                                                <span className="text-xs text-primary-600 font-bold">0 orders</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={`/services/${service.slug}`}
                                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                                                    title="View Public Link"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/dashboard/services/${service.id}/edit`}
                                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                                                    title="Edit Service"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => setShowDeleteModal(service.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Delete Service"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {!isLoading && filteredServices.length === 0 && (
                    <div className="text-center py-20 px-6">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No services found</h3>
                        <p className="text-gray-500 max-w-xs mx-auto mb-8">
                            {searchQuery ? 'Try adjusting your search filters to find what you are looking for' : 'Start growing your business by adding your first service listing today'}
                        </p>
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="text-primary-600 font-bold hover:underline">Clear all searches</button>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => !isDeleting && setShowDeleteModal(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Service?</h3>
                            <p className="text-gray-500 mb-8 leading-relaxed">
                                Are you sure you want to delete this service? This action is permanent and will remove all associated data, including reviews and history.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    disabled={isDeleting}
                                    onClick={() => setShowDeleteModal(null)}
                                    className="flex-1 px-6 py-4 bg-gray-100 text-gray-900 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={isDeleting}
                                    onClick={handleDelete}
                                    className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Delete Item'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
