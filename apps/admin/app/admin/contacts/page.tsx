'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Mail, Phone, Building2, User, Clock, MessageSquare,
    CheckCircle2, Eye, Archive, Reply, Loader2, Filter,
    Search, AlertCircle, Briefcase, Users, Headphones
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getSupabaseClient } from '@/lib/supabase';

const supabase = getSupabaseClient();

// Inquiry type icons and colors
const inquiryTypeConfig: Record<string, { icon: any; color: string; label: string }> = {
    general: { icon: MessageSquare, color: 'bg-gray-100 text-gray-600', label: 'General' },
    enterprise: { icon: Building2, color: 'bg-blue-100 text-blue-600', label: 'Enterprise' },
    support: { icon: Headphones, color: 'bg-orange-100 text-orange-600', label: 'Support' },
    partnership: { icon: Briefcase, color: 'bg-purple-100 text-purple-600', label: 'Partnership' },
    vendor: { icon: Users, color: 'bg-green-100 text-green-600', label: 'Vendor' }
};

const statusConfig: Record<string, { color: string; label: string }> = {
    pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
    read: { color: 'bg-blue-100 text-blue-700', label: 'Read' },
    replied: { color: 'bg-green-100 text-green-700', label: 'Replied' },
    archived: { color: 'bg-gray-100 text-gray-500', label: 'Archived' }
};

interface ContactSubmission {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    company_name: string | null;
    inquiry_type: string;
    subject: string;
    message: string;
    status: string;
    admin_notes: string | null;
    replied_at: string | null;
    created_at: string;
}

export default function AdminContactsPage() {
    const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadSubmissions();
    }, []);

    const loadSubmissions = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('contact_submissions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Load error:', error);
                setSubmissions([]);
            } else {
                setSubmissions(data || []);
            }
        } catch (error) {
            console.error('Error:', error);
            setSubmissions([]);
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        setIsSaving(true);
        try {
            const updateData: any = { status, updated_at: new Date().toISOString() };
            if (status === 'replied') {
                updateData.replied_at = new Date().toISOString();
            }

            const { error } = await supabase
                .from('contact_submissions')
                .update(updateData)
                .eq('id', id);

            if (error) throw error;

            setSubmissions(prev => prev.map(s =>
                s.id === id ? { ...s, status, ...(status === 'replied' ? { replied_at: new Date().toISOString() } : {}) } : s
            ));

            if (selectedSubmission?.id === id) {
                setSelectedSubmission(prev => prev ? { ...prev, status } : null);
            }

            toast.success(`Status updated to ${status}`);
        } catch (error: any) {
            toast.error('Failed to update status');
        } finally {
            setIsSaving(false);
        }
    };

    const saveNotes = async () => {
        if (!selectedSubmission) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('contact_submissions')
                .update({
                    admin_notes: adminNotes,
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedSubmission.id);

            if (error) throw error;

            setSubmissions(prev => prev.map(s =>
                s.id === selectedSubmission.id ? { ...s, admin_notes: adminNotes } : s
            ));
            setSelectedSubmission(prev => prev ? { ...prev, admin_notes: adminNotes } : null);

            toast.success('Notes saved!');
        } catch (error: any) {
            toast.error('Failed to save notes');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredSubmissions = submissions.filter(s => {
        const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
        const matchesSearch = !searchQuery ||
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.subject.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const pendingCount = submissions.filter(s => s.status === 'pending').length;

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        Contact Submissions
                        {pendingCount > 0 && (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-lg">
                                {pendingCount} pending
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-400">Manage contact form submissions from the website</p>
                </div>
                <button
                    onClick={loadSubmissions}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:border-gray-600 transition-all"
                >
                    <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or subject..."
                        className="input w-full pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'pending', 'read', 'replied', 'archived'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterStatus === status
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:text-white'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="card py-20 text-center">
                    <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading submissions...</p>
                </div>
            ) : filteredSubmissions.length === 0 ? (
                <div className="card py-20 text-center">
                    <Mail className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Submissions</h3>
                    <p className="text-gray-500">Contact form submissions will appear here</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Submissions List */}
                    <div className="lg:col-span-1 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                        {filteredSubmissions.map((submission, index) => {
                            const inquiryConfig = inquiryTypeConfig[submission.inquiry_type] || inquiryTypeConfig.general;
                            const InquiryIcon = inquiryConfig.icon;
                            const statusCfg = statusConfig[submission.status] || statusConfig.pending;

                            return (
                                <motion.button
                                    key={submission.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                    onClick={() => {
                                        setSelectedSubmission(submission);
                                        setAdminNotes(submission.admin_notes || '');
                                        if (submission.status === 'pending') {
                                            updateStatus(submission.id, 'read');
                                        }
                                    }}
                                    className={`w-full text-left card p-4 transition-all border ${selectedSubmission?.id === submission.id
                                            ? 'border-primary-500 bg-primary-500/5'
                                            : 'border-gray-700/50 hover:border-gray-600'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-xl ${inquiryConfig.color} flex items-center justify-center flex-shrink-0`}>
                                            <InquiryIcon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <h3 className="font-bold text-white truncate">{submission.name}</h3>
                                                <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${statusCfg.color}`}>
                                                    {statusCfg.label}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400 truncate mb-1">{submission.subject}</p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Clock className="w-3 h-3" />
                                                {new Date(submission.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Detail Panel */}
                    <div className="lg:col-span-2">
                        {selectedSubmission ? (
                            <motion.div
                                key={selectedSubmission.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card p-6"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-700">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl ${inquiryTypeConfig[selectedSubmission.inquiry_type]?.color || 'bg-gray-100'} flex items-center justify-center`}>
                                            {(() => {
                                                const Icon = inquiryTypeConfig[selectedSubmission.inquiry_type]?.icon || MessageSquare;
                                                return <Icon className="w-7 h-7" />;
                                            })()}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">{selectedSubmission.name}</h2>
                                            <p className="text-gray-400">{selectedSubmission.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {selectedSubmission.status !== 'replied' && (
                                            <button
                                                onClick={() => updateStatus(selectedSubmission.id, 'replied')}
                                                disabled={isSaving}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-all"
                                            >
                                                <Reply className="w-4 h-4" />
                                                Mark Replied
                                            </button>
                                        )}
                                        {selectedSubmission.status !== 'archived' && (
                                            <button
                                                onClick={() => updateStatus(selectedSubmission.id, 'archived')}
                                                disabled={isSaving}
                                                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm font-medium transition-all"
                                            >
                                                <Archive className="w-4 h-4" />
                                                Archive
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Contact Details */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {selectedSubmission.phone && (
                                        <div className="p-3 bg-gray-800/50 rounded-xl">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                                <Phone className="w-3 h-3" />
                                                Phone
                                            </div>
                                            <p className="text-sm font-medium text-white">{selectedSubmission.phone}</p>
                                        </div>
                                    )}
                                    {selectedSubmission.company_name && (
                                        <div className="p-3 bg-gray-800/50 rounded-xl">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                                <Building2 className="w-3 h-3" />
                                                Company
                                            </div>
                                            <p className="text-sm font-medium text-white">{selectedSubmission.company_name}</p>
                                        </div>
                                    )}
                                    <div className="p-3 bg-gray-800/50 rounded-xl">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                            <MessageSquare className="w-3 h-3" />
                                            Inquiry Type
                                        </div>
                                        <p className="text-sm font-medium text-white capitalize">{selectedSubmission.inquiry_type}</p>
                                    </div>
                                    <div className="p-3 bg-gray-800/50 rounded-xl">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                            <Clock className="w-3 h-3" />
                                            Received
                                        </div>
                                        <p className="text-sm font-medium text-white">
                                            {new Date(selectedSubmission.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Subject & Message */}
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Subject</label>
                                        <p className="text-white font-medium">{selectedSubmission.subject}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Message</label>
                                        <div className="p-4 bg-gray-800/50 rounded-xl text-gray-300 whitespace-pre-wrap">
                                            {selectedSubmission.message}
                                        </div>
                                    </div>
                                </div>

                                {/* Admin Notes */}
                                <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Admin Notes</label>
                                    <textarea
                                        className="input w-full h-24 resize-none mb-3"
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Add private notes about this submission..."
                                    />
                                    <button
                                        onClick={saveNotes}
                                        disabled={isSaving}
                                        className="btn-primary w-full"
                                    >
                                        {isSaving ? 'Saving...' : 'Save Notes'}
                                    </button>
                                </div>

                                {/* Quick Reply */}
                                <div className="mt-4 pt-4 border-t border-gray-700">
                                    <a
                                        href={`mailto:${selectedSubmission.email}?subject=Re: ${encodeURIComponent(selectedSubmission.subject)}`}
                                        className="flex items-center justify-center gap-2 w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all"
                                    >
                                        <Mail className="w-5 h-5" />
                                        Send Email Reply
                                    </a>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="card h-full min-h-[400px] flex flex-col items-center justify-center text-center border-dashed">
                                <Eye className="w-16 h-16 text-gray-700 mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">Select a Submission</h3>
                                <p className="text-gray-500 max-w-sm">
                                    Click on any submission from the list to view full details and manage the response.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
