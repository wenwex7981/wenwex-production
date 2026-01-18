'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Save, Upload, Plus, X, Clock,
    Info, DollarSign, Tag, Image as ImageIcon,
    Type, Layout, Loader2, Sparkles, CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { fetchCategories, updateService, getCurrentVendor, fetchServiceById, uploadMedia } from '@/lib/vendor-service';
import { DynamicFieldsForm } from '@/lib/dynamic-fields';
import { toast } from 'react-hot-toast';

export default function EditServicePage() {
    const router = useRouter();
    const { id } = useParams() as { id: string };
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [vendor, setVendor] = useState<any>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category_id: '',
        sub_category_id: '',
        main_image_url: '',
        features: [''],
        tech_stack: [''],
        status: 'DRAFT',
        service_type: 'IT & TECH',
        delivery_days: '7',
        revisions: '3',
        project_photos: [] as string[],
        project_videos: [] as string[],
        project_documents: [] as string[],
        custom_fields: {} as Record<string, any>,
    });

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [vendorData, categoriesData, serviceData] = await Promise.all([
                getCurrentVendor(),
                fetchCategories(),
                fetchServiceById(id)
            ]);

            // If vendor data is null, redirect
            if (!vendorData) {
                toast.error('Please complete onboarding first');
                router.push('/onboarding');
                return;
            }

            if (serviceData.vendor_id !== vendorData.id) {
                toast.error('You do not have permission to edit this service');
                router.push('/dashboard/services');
                return;
            }

            setVendor(vendorData);
            setCategories(categoriesData || []);
            setFormData({
                title: serviceData.title,
                description: serviceData.description || '',
                price: serviceData.price.toString(),
                category_id: serviceData.category_id,
                sub_category_id: serviceData.sub_category_id || '',
                main_image_url: serviceData.main_image_url || '',
                features: serviceData.features && serviceData.features.length > 0 ? serviceData.features : [''],
                tech_stack: serviceData.tech_stack && serviceData.tech_stack.length > 0 ? serviceData.tech_stack : [''],
                status: serviceData.status,
                service_type: serviceData.service_type || 'IT & TECH',
                delivery_days: (serviceData.delivery_days || 7).toString(),
                revisions: (serviceData.revisions || 0).toString(),
                project_photos: serviceData.project_photos || [],
                project_videos: serviceData.project_videos || [],
                project_documents: serviceData.project_documents || [],
                custom_fields: serviceData.custom_fields || {},
            });
        } catch (error: any) {
            console.error('Load data error:', error);
            toast.error('Failed to load service data');
            router.push('/dashboard/services');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddFeature = () => {
        setFormData({ ...formData, features: [...formData.features, ''] });
    };

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData({ ...formData, features: newFeatures });
    };

    const handleRemoveFeature = (index: number) => {
        setFormData({
            ...formData,
            features: formData.features.filter((_, i) => i !== index)
        });
    };

    const handleAddTech = () => {
        setFormData({ ...formData, tech_stack: [...formData.tech_stack, ''] });
    };

    const handleTechChange = (index: number, value: string) => {
        const newTech = [...formData.tech_stack];
        newTech[index] = value;
        setFormData({ ...formData, tech_stack: newTech });
    };

    const handleRemoveTech = (index: number) => {
        setFormData({
            ...formData,
            tech_stack: formData.tech_stack.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vendor) return;

        if (!formData.title || !formData.price || !formData.category_id) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSaving(true);
        try {
            await updateService(id, {
                ...formData,
                price: parseFloat(formData.price),
                delivery_days: parseInt(formData.delivery_days) || 7,
                revisions: parseInt(formData.revisions) || 0,
                features: formData.features.filter(f => f.trim() !== ''),
                tech_stack: formData.tech_stack.filter(t => t.trim() !== '')
            });

            toast.success('Service updated successfully!');
            router.push('/dashboard/services');
        } catch (error: any) {
            toast.error('Failed to update service: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const selectedCategory = categories.find(c => c.id === formData.category_id);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/services" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Service</h1>
                    <p className="text-gray-500 text-sm font-medium">Update your listing details and pricing</p>
                </div>
                <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold ring-1 ring-green-100">
                    <CheckCircle className="w-3 h-3" />
                    STATUS: {formData.status}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                                <Info className="w-5 h-5 text-primary-600" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 ml-1">Service Title*</label>
                                <div className="relative">
                                    <Type className="absolute left-4 top-4 w-5 h-5 text-gray-300" />
                                    <input
                                        type="text"
                                        placeholder="Service title"
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 ml-1">Description</label>
                                <textarea
                                    placeholder="Describe your service..."
                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all min-h-[160px] font-medium resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-purple-600" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Key Features</h2>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddFeature}
                                className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Add More
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.features.map((feature, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Feature description"
                                        className="flex-1 p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm font-medium"
                                        value={feature}
                                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                                    />
                                    {formData.features.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFeature(index)}
                                            className="p-3 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tech Stack */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <Layout className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Technologies Used</h2>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddTech}
                                className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Add More
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.tech_stack.map((tech, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="e.g. Next.js, Python, Figma"
                                        className="flex-1 p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm font-medium"
                                        value={tech}
                                        onChange={(e) => handleTechChange(index, e.target.value)}
                                    />
                                    {formData.tech_stack.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTech(index)}
                                            className="p-3 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Pricing & Category */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700 ml-1">Base Price (USD)*</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-4 w-5 h-5 text-gray-300" />
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-gray-900"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                                    <Tag className="w-4 h-4" /> Category*
                                </label>
                                <select
                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium cursor-pointer"
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value, sub_category_id: '' })}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                                    <Layout className="w-4 h-4" /> Service Type*
                                </label>
                                <select
                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium cursor-pointer"
                                    value={formData.service_type}
                                    onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                                    required
                                >
                                    <option value="IT & TECH">IT & TECH</option>
                                    <option value="ACADEMIC">ACADEMIC</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Delivery (Days)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="7"
                                        className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium"
                                        value={formData.delivery_days}
                                        onChange={(e) => setFormData({ ...formData, delivery_days: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" /> Revisions
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="3"
                                        className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium"
                                        value={formData.revisions}
                                        onChange={(e) => setFormData({ ...formData, revisions: e.target.value })}
                                    />
                                </div>
                            </div>

                            {selectedCategory && (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                                        Sub Category
                                    </label>
                                    <select
                                        className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium cursor-pointer"
                                        value={formData.sub_category_id}
                                        onChange={(e) => setFormData({ ...formData, sub_category_id: e.target.value })}
                                    >
                                        <option value="">Select Sub-category</option>
                                        {selectedCategory.sub_categories?.map((sub: any) => (
                                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Media */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Media</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 ml-1">Main Image</label>
                                <div
                                    onClick={() => document.getElementById('image-upload')?.click()}
                                    className="relative aspect-[16/10] bg-gray-50 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100/50 hover:border-primary-200 transition-all group overflow-hidden"
                                >
                                    {formData.main_image_url ? (
                                        <>
                                            <img
                                                src={formData.main_image_url}
                                                alt="Thumbnail preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                <div className="bg-white/90 px-4 py-2 rounded-xl text-xs font-black uppercase text-gray-900">Change Image</div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-gray-300 group-hover:text-primary-500 mb-2 transition-colors" />
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Click to Upload</p>
                                        </>
                                    )}
                                    <input
                                        id="image-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                try {
                                                    const url = await uploadMedia('services', file, vendor?.id);
                                                    setFormData({ ...formData, main_image_url: url });
                                                    toast.success('Image uploaded');
                                                } catch (err: any) {
                                                    toast.error(err.message);
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {formData.main_image_url && (
                                <div className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <ImageIcon className="w-4 h-4 text-blue-500" />
                                    <p className="text-[10px] font-bold text-blue-600 truncate flex-1">{formData.main_image_url}</p>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, main_image_url: '' })}
                                        className="text-blue-500 hover:text-blue-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Project Media - Photos, Videos, Documents */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                                <Upload className="w-5 h-5 text-green-600" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Project Media</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Project Photos */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" /> Project Photos
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {formData.project_photos.map((url, i) => (
                                        <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, project_photos: formData.project_photos.filter((_, idx) => idx !== i) })}
                                                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/50 transition-all">
                                        <Plus className="w-6 h-6 text-gray-400" />
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            multiple
                                            onChange={async (e) => {
                                                const files = Array.from(e.target.files || []);
                                                for (const file of files) {
                                                    try {
                                                        const url = await uploadMedia('services', file, vendor?.id);
                                                        setFormData(prev => ({ ...prev, project_photos: [...prev.project_photos, url] }));
                                                    } catch (err: any) {
                                                        toast.error(err.message);
                                                    }
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Project Videos */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Project Videos
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {formData.project_videos.map((url, i) => (
                                        <div key={i} className="relative w-32 h-20 rounded-xl overflow-hidden group bg-gray-900">
                                            <video src={url} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, project_videos: formData.project_videos.filter((_, idx) => idx !== i) })}
                                                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="w-32 h-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/50 transition-all">
                                        <Plus className="w-6 h-6 text-gray-400" />
                                        <span className="text-[10px] text-gray-400 mt-1">Video</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="video/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    try {
                                                        const url = await uploadMedia('services', file, vendor?.id);
                                                        setFormData(prev => ({ ...prev, project_videos: [...prev.project_videos, url] }));
                                                        toast.success('Video uploaded');
                                                    } catch (err: any) {
                                                        toast.error(err.message);
                                                    }
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Project Documents */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                                    <Tag className="w-4 h-4" /> Related Documents
                                </label>
                                <div className="space-y-2">
                                    {formData.project_documents.map((url, i) => (
                                        <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                                            <Tag className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-700 truncate flex-1">{url.split('/').pop()}</span>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, project_documents: formData.project_documents.filter((_, idx) => idx !== i) })}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="flex items-center gap-2 p-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary-300 hover:bg-primary-50/50 transition-all">
                                        <Plus className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm text-gray-500">Add Document (PDF, DOC, etc.)</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    try {
                                                        const url = await uploadMedia('services', file, vendor?.id);
                                                        setFormData(prev => ({ ...prev, project_documents: [...prev.project_documents, url] }));
                                                        toast.success('Document uploaded');
                                                    } catch (err: any) {
                                                        toast.error(err.message);
                                                    }
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Custom Dynamic Fields */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Additional Fields</h2>
                        </div>
                        <DynamicFieldsForm
                            entityType="services"
                            values={formData.custom_fields}
                            onChange={(name, value) => setFormData(prev => ({
                                ...prev,
                                custom_fields: { ...prev.custom_fields, [name]: value }
                            }))}
                        />
                    </div>

                    {/* Actions */}
                    <div className="space-y-4">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full py-5 bg-primary-600 text-white rounded-3xl font-black text-lg uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20 active:scale-[0.98]"
                        >
                            {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="w-full py-4 bg-white text-gray-500 border border-gray-100 rounded-3xl font-bold hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
