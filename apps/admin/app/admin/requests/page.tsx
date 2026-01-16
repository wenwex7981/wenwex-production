'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    XCircle,
    FileText,
    Building2,
    ShieldCheck,
    Search,
    Filter,
    MoreHorizontal,
    ExternalLink,
    AlertCircle,
    UserCircle2
} from 'lucide-react';

const MOCK_REQUESTS = [
    {
        id: 'REQ-001',
        companyName: 'TechCraft Studios',
        email: 'business@techcraft.com',
        panNumber: 'ABCDE1234F',
        tanNumber: 'ABCD12345E',
        submittedAt: '2026-01-10T14:30:00Z',
        status: 'pending'
    },
    {
        id: 'REQ-002',
        companyName: 'Global Solutions Inc',
        email: 'admin@globalsol.com',
        panNumber: 'FGHIJ5678K',
        tanNumber: 'EFGH67890L',
        submittedAt: '2026-01-09T10:15:00Z',
        status: 'pending'
    }
];

export default function CompanyRequestsPage() {
    const [requests, setRequests] = useState(MOCK_REQUESTS);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);

    const handleApprove = (id: string) => {
        setRequests(prev => prev.map(req =>
            req.id === id ? { ...req, status: 'approved' } : req
        ));
        setSelectedRequest(null);
        alert('Company Verified Successfully. Sending notification to partner.');
    };

    const handleReject = (id: string) => {
        setRequests(prev => prev.map(req =>
            req.id === id ? { ...req, status: 'rejected' } : req
        ));
        setSelectedRequest(null);
    };

    return (
        <div className="p-8 space-y-8 min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Company Onboarding Requests</h1>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Super Admin Control Panel</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search requests..."
                            className="h-10 pl-10 pr-4 rounded-xl bg-white border border-gray-200 outline-none focus:border-primary-500 transition-all text-sm font-medium w-64"
                        />
                    </div>
                    <button className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-gray-900 transition-colors">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Pending Review', value: requests.filter(r => r.status === 'pending').length, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Total Verified', value: 142, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Rejected', value: 12, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Average Review Time', value: '18h', color: 'text-primary-600', bg: 'bg-primary-50' },
                ].map((stat, i) => (
                    <div key={i} className={`p-6 rounded-2xl bg-white border border-gray-100 shadow-sm`}>
                        <div className={`text-[10px] font-black uppercase tracking-widest mb-1 opacity-60`}>{stat.label}</div>
                        <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Requests List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-[13px]">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <th className="px-6 py-4 font-black">Company Details</th>
                            <th className="px-6 py-4 font-black">Documentation</th>
                            <th className="px-6 py-4 font-black">Submission Date</th>
                            <th className="px-6 py-4 font-black">Status</th>
                            <th className="px-6 py-4 font-black text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {requests.map((request) => (
                            <motion.tr
                                key={request.id}
                                layout
                                className="hover:bg-gray-50/50 transition-colors"
                            >
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{request.companyName}</div>
                                            <div className="text-xs text-gray-500 font-medium">{request.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="w-3.5 h-3.5 text-primary-500" />
                                            <span className="font-mono font-bold text-gray-700 uppercase tracking-tighter">PAN: {request.panNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-3.5 h-3.5 text-primary-500" />
                                            <span className="font-mono font-bold text-gray-700 uppercase tracking-tighter">TAN: {request.tanNumber}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="font-medium text-gray-600">
                                        {new Date(request.submittedAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase">14:30 PM</div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${request.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                            request.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                'bg-red-100 text-red-700'
                                        }`}>
                                        {request.status}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    {request.status === 'pending' ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleApprove(request.id)}
                                                className="h-8 px-4 rounded-lg bg-green-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(request.id)}
                                                className="h-8 px-3 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all font-bold text-[10px] uppercase"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pr-4">Processed</div>
                                    )}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {requests.length === 0 && (
                    <div className="p-12 text-center space-y-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-8 h-8 text-gray-200" />
                        </div>
                        <p className="text-gray-400 font-bold">No pending requests found</p>
                    </div>
                )}
            </div>

            {/* Compliance Note */}
            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                <div className="space-y-1">
                    <p className="text-sm font-black text-amber-900 leading-none">Security Protocol: Manual Review Required</p>
                    <p className="text-xs text-amber-800/80 font-medium max-w-2xl">
                        Please ensure all PAN/TAN documents are visually inspected for authenticity before clicking 'Approve'. Approved companies will immediately gain access to the vendor dashboard and service listings.
                    </p>
                </div>
            </div>
        </div>
    );
}
