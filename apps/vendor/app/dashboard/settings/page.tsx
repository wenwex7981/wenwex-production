'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    User, Building2, Globe, Mail, Phone, MapPin,
    Camera, Save, Eye, Lock, Bell, CreditCard, Loader2, Plus, X,
    Linkedin, Twitter, Instagram, Facebook, FileText, Award, Download, Trash2, UploadCloud
} from 'lucide-react';
import { getCurrentVendor, updateVendorProfile, uploadMedia } from '@/lib/vendor-service';
import { toast } from 'react-hot-toast';

export default function VendorSettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [vendor, setVendor] = useState<any>(null);

    const [formData, setFormData] = useState({
        company_name: '',
        slug: '',
        email: '',
        phone_number: '',
        whatsapp_number: '',
        country: '',
        website_url: '',
        description: '',
        logo_url: '',
        banner_url: '',
        founded_year: '',
        team_size: '',
        projects_done: '',
        satisfaction_rate: '98%',
        social_links: { linkedin: '', twitter: '', instagram: '', facebook: '' },
        certifications: [] as any[],
        documents: [] as any[],
    });

    useEffect(() => {
        loadVendor();
    }, []);

    const loadVendor = async () => {
        try {
            const data = await getCurrentVendor();
            if (data) {
                setVendor(data);
                setFormData({
                    company_name: data.company_name || '',
                    slug: data.slug || '',
                    email: data.email || '',
                    phone_number: data.phone_number || '',
                    whatsapp_number: data.whatsapp_number || '',
                    country: data.country || 'India',
                    website_url: data.website_url || '',
                    description: data.description || '',
                    logo_url: data.logo_url || '',
                    banner_url: data.banner_url || '',
                    founded_year: data.founded_year || '2020',
                    team_size: data.team_size || '15-30',
                    projects_done: data.projects_done || '250+',
                    satisfaction_rate: data.satisfaction_rate || '98%',
                    social_links: data.social_links || { linkedin: '', twitter: '', instagram: '', facebook: '' },
                    certifications: data.certifications || [],
                    documents: data.documents || [],
                });
            }
        } catch (error) {
            toast.error('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!vendor) return;
        setIsSaving(true);
        try {
            await updateVendorProfile(vendor.id, formData);
            toast.success('Profile updated successfully!');
        } catch (error: any) {
            toast.error('Failed to update profile: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddCertification = () => {
        setFormData({
            ...formData,
            certifications: [...formData.certifications, { name: '', issuer: '', year: new Date().getFullYear().toString() }]
        });
    };

    const handleRemoveCertification = (index: number) => {
        setFormData({
            ...formData,
            certifications: formData.certifications.filter((_, i) => i !== index)
        });
    };

    const handleCertificationChange = (index: number, field: string, value: string) => {
        const newCerts = [...formData.certifications];
        newCerts[index] = { ...newCerts[index], [field]: value };
        setFormData({ ...formData, certifications: newCerts });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'document' | 'logo' | 'banner') => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const path = type === 'document' ? `${vendor?.id}/documents` : `${vendor?.id}/${type}`;
            const url = await uploadMedia('vendors', file, path);

            if (type === 'document') {
                const newDoc = {
                    name: file.name,
                    url: url,
                    size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
                    type: file.type
                };
                setFormData({
                    ...formData,
                    documents: [...formData.documents, newDoc]
                });
                toast.success('Document uploaded');
            } else if (type === 'logo') {
                setFormData({ ...formData, logo_url: url });
                toast.success('Logo updated');
            } else if (type === 'banner') {
                setFormData({ ...formData, banner_url: url });
                toast.success('Banner updated');
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleRemoveDocument = (index: number) => {
        setFormData({
            ...formData,
            documents: formData.documents.filter((_, i) => i !== index)
        });
    };

    const tabs = [
        { id: 'profile', label: 'Company Profile', icon: Building2 },
        { id: 'account', label: 'Account Settings', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Lock },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto font-sans">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Settings</h1>
                <p className="text-gray-500 font-medium">Manage your brand identity and professional footprint</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Tabs Sidebar */}
                <div className="lg:w-72 flex-shrink-0">
                    <div className="bg-white p-3 rounded-[2rem] border border-gray-100 shadow-sm sticky top-24">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-left transition-all duration-300 font-bold ${activeTab === tab.id
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                                    : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-300 group-hover:text-primary-600'}`} />
                                <span className="text-sm">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    {activeTab === 'profile' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* Banner & Logo */}
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                                <h2 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-widest text-[10px] text-primary-600">Brand Assets</h2>

                                {/* Banner */}
                                <div className="relative h-48 rounded-3xl overflow-hidden mb-8 group bg-gray-50 border border-gray-100">
                                    {formData.banner_url ? (
                                        <Image
                                            src={formData.banner_url}
                                            alt="Banner"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <ImageIcon className="w-10 h-10" />
                                        </div>
                                    )}
                                    <div
                                        onClick={() => document.getElementById('banner-upload')?.click()}
                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm cursor-pointer"
                                    >
                                        <div className="bg-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 hover:scale-105 transition-transform">
                                            <Camera className="w-4 h-4 text-primary-600" />
                                            <span className="text-sm font-black text-gray-900">Change Banner</span>
                                        </div>
                                    </div>
                                    <input
                                        id="banner-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                try {
                                                    const url = await uploadMedia('vendors', file, `${vendor?.id}/banner`);
                                                    setFormData({ ...formData, banner_url: url });
                                                    toast.success('Banner uploaded');
                                                } catch (err: any) {
                                                    toast.error(err.message);
                                                }
                                            }
                                        }}
                                    />
                                </div>

                                {/* Logo */}
                                <div className="flex items-center gap-8 pl-4">
                                    <div className="relative group w-24 h-24">
                                        <div className="w-full h-full rounded-[2rem] overflow-hidden bg-gray-50 border-4 border-white shadow-xl">
                                            <img
                                                src={formData.logo_url || `https://ui-avatars.com/api/?name=${formData.company_name}&background=0c8bff&color=fff&size=200`}
                                                alt="Logo"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div
                                            onClick={() => document.getElementById('logo-upload')?.click()}
                                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] flex items-center justify-center cursor-pointer"
                                        >
                                            <Camera className="w-6 h-6 text-white" />
                                        </div>
                                        <input
                                            id="logo-upload"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    try {
                                                        const url = await uploadMedia('vendors', file, `${vendor?.id}/logo`);
                                                        setFormData({ ...formData, logo_url: url });
                                                        toast.success('Logo uploaded');
                                                    } catch (err: any) {
                                                        toast.error(err.message);
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xl font-black text-gray-900 leading-tight">Company Identity</p>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Recommended: 400x400px</p>
                                        <input
                                            type="text"
                                            placeholder="Paste Logo URL..."
                                            className="text-xs p-1 border-b border-gray-100 outline-none focus:border-primary-500 w-full"
                                            value={formData.logo_url}
                                            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Company Details */}
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                <h2 className="text-lg font-black text-gray-900 mb-8 uppercase tracking-widest text-[10px] text-primary-600">Company Details</h2>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                            Company Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.company_name}
                                            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                            className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-900"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                            Public Identifier (Slug)
                                        </label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-4 bg-gray-100 border-none rounded-l-2xl text-gray-500 text-[10px] font-black">
                                                /vendors/
                                            </span>
                                            <input
                                                type="text"
                                                value={formData.slug}
                                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                className="w-full h-14 px-6 rounded-r-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-900"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                            Business Narrative (Description)
                                        </label>
                                        <textarea
                                            rows={5}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full p-6 rounded-3xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium text-gray-900 resize-none leading-relaxed"
                                            placeholder="Introduce your company..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Agency Performance Stats */}
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                <h2 className="text-lg font-black text-gray-900 mb-8 uppercase tracking-widest text-[10px] text-primary-600">Agency Performance Stats</h2>
                                <div className="grid md:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                            Founded Year
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 2020"
                                            value={formData.founded_year}
                                            onChange={(e) => setFormData({ ...formData, founded_year: e.target.value })}
                                            className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-900"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                            Team Size
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 15-30"
                                            value={formData.team_size}
                                            onChange={(e) => setFormData({ ...formData, team_size: e.target.value })}
                                            className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-900"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                            Projects Done
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 250+"
                                            value={formData.projects_done}
                                            onChange={(e) => setFormData({ ...formData, projects_done: e.target.value })}
                                            className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-900"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                            Satisfaction
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 98%"
                                            value={formData.satisfaction_rate}
                                            onChange={(e) => setFormData({ ...formData, satisfaction_rate: e.target.value })}
                                            className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-900"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Certifications */}
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-lg font-black text-gray-900 uppercase tracking-widest text-[10px] text-primary-600">Certifications & Awards</h2>
                                    <button
                                        onClick={handleAddCertification}
                                        className="text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Add Certificate
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {formData.certifications.map((cert: any, index: number) => (
                                        <div key={index} className="grid md:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-3xl relative group">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Certificate Name</label>
                                                <input
                                                    type="text"
                                                    value={cert.name}
                                                    onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                                                    className="w-full h-12 px-5 rounded-xl bg-white border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-900 text-sm"
                                                    placeholder="e.g. ISO 9001:2015"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Issuing Organization</label>
                                                <input
                                                    type="text"
                                                    value={cert.issuer}
                                                    onChange={(e) => handleCertificationChange(index, 'issuer', e.target.value)}
                                                    className="w-full h-12 px-5 rounded-xl bg-white border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-900 text-sm"
                                                    placeholder="e.g. SGS"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Year</label>
                                                <input
                                                    type="text"
                                                    value={cert.year}
                                                    onChange={(e) => handleCertificationChange(index, 'year', e.target.value)}
                                                    className="w-full h-12 px-5 rounded-xl bg-white border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-900 text-sm"
                                                    placeholder="e.g. 2024"
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleRemoveCertification(index)}
                                                className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.certifications.length === 0 && (
                                        <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-[2rem]">
                                            <Award className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Certifications Added</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Documents */}
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-lg font-black text-gray-900 uppercase tracking-widest text-[10px] text-primary-600">Company Documents</h2>
                                    <button
                                        onClick={() => document.getElementById('doc-upload')?.click()}
                                        className="text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 flex items-center gap-2"
                                    >
                                        <UploadCloud className="w-4 h-4" /> Upload Document
                                    </button>
                                    <input
                                        id="doc-upload"
                                        type="file"
                                        className="hidden"
                                        onChange={(e) => handleFileUpload(e, 'document')}
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {formData.documents.map((doc: any, index: number) => (
                                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl group overflow-hidden">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-6 h-6 text-primary-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{doc.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{doc.size}</p>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveDocument(index)}
                                                className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.documents.length === 0 && (
                                        <div className="md:col-span-2 text-center py-12 border-2 border-dashed border-gray-100 rounded-[2rem]">
                                            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Documents Uploaded</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Social Profiles */}
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                <h2 className="text-lg font-black text-gray-900 mb-8 uppercase tracking-widest text-[10px] text-primary-600">Social Profiles</h2>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Linkedin className="w-3 h-3" /> LinkedIn URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.social_links.linkedin}
                                            onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, linkedin: e.target.value } })}
                                            className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-900"
                                            placeholder="https://linkedin.com/company/..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Twitter className="w-3 h-3" /> Twitter URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.social_links.twitter}
                                            onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, twitter: e.target.value } })}
                                            className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-900"
                                            placeholder="https://twitter.com/..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Instagram className="w-3 h-3" /> Instagram URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.social_links.instagram}
                                            onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, instagram: e.target.value } })}
                                            className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-900"
                                            placeholder="https://instagram.com/..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Facebook className="w-3 h-3" /> Facebook URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.social_links.facebook}
                                            onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, facebook: e.target.value } })}
                                            className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-900"
                                            placeholder="https://facebook.com/..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                <h2 className="text-lg font-black text-gray-900 mb-8 uppercase tracking-widest text-[10px] text-primary-600">Contact Information</h2>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                            <Mail className="w-3 h-3 inline mr-1" /> Official Email
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-900"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                            <Phone className="w-3 h-3 inline mr-1" /> Phone Line
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone_number}
                                            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                            className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-900"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                            </svg>
                                            WhatsApp Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.whatsapp_number}
                                            onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                                            className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-gray-900"
                                            placeholder="+91 98765 43210 (with country code)"
                                        />
                                        <p className="text-[10px] text-gray-400 ml-1">Include country code for international access</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                            <MapPin className="w-3 h-3 inline mr-1" /> Headquarters (Country)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.country}
                                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                            className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-900"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                            <Globe className="w-3 h-3 inline mr-1" /> Professional Website
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.website_url}
                                            onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                                            className="w-full h-14 px-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-900"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end gap-4 pt-4">
                                <button onClick={handleSave} disabled={isSaving} className="px-10 py-5 bg-primary-600 text-white rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary-600/20 hover:bg-primary-700 transition-all active:scale-[0.98] flex items-center gap-3">
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {isSaving ? 'Synchronizing...' : 'Save Profile Changes'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab !== 'profile' && (
                        <div className="card p-12 text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">This settings section is currently being integrated with WENWEX security modules.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ImageIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
    )
}
