'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Save, X, Upload, Eye, EyeOff, GripVertical, Image as ImageIcon, Link as LinkIcon, Loader2 } from 'lucide-react';
import { fetchTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember, uploadMedia } from '@/lib/admin-service';

interface TeamMember {
    id?: string;
    name: string;
    role: string;
    image_url: string;
    linkedin_url?: string;
    github_url?: string;
    twitter_url?: string;
    display_order: number;
    is_active: boolean;
}

export default function TeamManagementPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [imageInputType, setImageInputType] = useState<'upload' | 'url'>('upload');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<Partial<TeamMember>>({
        name: '',
        role: '',
        image_url: '',
        linkedin_url: '',
        github_url: '',
        twitter_url: '',
        display_order: 0,
        is_active: true
    });

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        try {
            setIsLoading(true);
            const data = await fetchTeamMembers(true);
            setMembers(data);
        } catch (error) {
            console.error('Error fetching team members:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const url = await uploadMedia('team', file, 'members');
            setFormData({ ...formData, image_url: url });
        } catch (error: any) {
            console.error('Upload error:', error);
            alert(error.message || 'Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleAdd = async () => {
        if (!formData.name || !formData.role || !formData.image_url) {
            alert('Please fill in all required fields (Name, Role, and Image)');
            return;
        }

        try {
            setIsSaving(true);
            await createTeamMember({
                name: formData.name,
                role: formData.role,
                image_url: formData.image_url,
                linkedin_url: formData.linkedin_url,
                github_url: formData.github_url,
                twitter_url: formData.twitter_url,
                display_order: formData.display_order || members.length,
                is_active: formData.is_active ?? true
            });
            await loadMembers();
            setShowAddForm(false);
            resetForm();
        } catch (error) {
            console.error('Error adding team member:', error);
            alert('Failed to add team member');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdate = async (id: string) => {
        try {
            setIsSaving(true);
            const memberToUpdate = members.find(m => m.id === id);
            if (!memberToUpdate) return;

            await updateTeamMember(id, memberToUpdate);
            setEditingId(null);
            await loadMembers();
        } catch (error) {
            console.error('Error updating team member:', error);
            alert('Failed to update team member');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this team member?')) return;

        try {
            await deleteTeamMember(id);
            await loadMembers();
        } catch (error) {
            console.error('Error deleting team member:', error);
            alert('Failed to delete team member');
        }
    };

    const toggleActive = async (id: string) => {
        const member = members.find(m => m.id === id);
        if (!member) return;

        try {
            await updateTeamMember(id, { is_active: !member.is_active });
            await loadMembers();
        } catch (error) {
            console.error('Error toggling active status:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            role: '',
            image_url: '',
            linkedin_url: '',
            github_url: '',
            twitter_url: '',
            display_order: members.length,
            is_active: true
        });
        setImageInputType('upload');
    };

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-20 bg-gray-200 rounded"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
                    <p className="text-gray-500 mt-1">Manage team members displayed on the homepage</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowAddForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Team Member
                </button>
            </div>

            {/* Add Form Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Add New Team Member</h2>
                            <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                                <input
                                    type="text"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Chief Technology Officer"
                                />
                            </div>

                            {/* Image Input - Toggle between Upload and URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image *</label>
                                <div className="flex gap-2 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => setImageInputType('upload')}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${imageInputType === 'upload'
                                                ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                                                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                                            }`}
                                    >
                                        <Upload className="w-4 h-4" />
                                        Upload File
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setImageInputType('url')}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${imageInputType === 'url'
                                                ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                                                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                                            }`}
                                    >
                                        <LinkIcon className="w-4 h-4" />
                                        Image URL
                                    </button>
                                </div>

                                {imageInputType === 'upload' ? (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                        {formData.image_url ? (
                                            <div className="space-y-3">
                                                <img
                                                    src={formData.image_url}
                                                    alt="Preview"
                                                    className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="text-blue-600 text-sm font-medium hover:underline"
                                                >
                                                    Change Image
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploading}
                                                className="flex flex-col items-center gap-2 w-full"
                                            >
                                                {isUploading ? (
                                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                                ) : (
                                                    <ImageIcon className="w-8 h-8 text-gray-400" />
                                                )}
                                                <span className="text-sm text-gray-500">
                                                    {isUploading ? 'Uploading...' : 'Click to upload image'}
                                                </span>
                                                <span className="text-xs text-gray-400">PNG, JPG, WEBP up to 10MB</span>
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={formData.image_url}
                                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                        {formData.image_url && (
                                            <div className="flex justify-center">
                                                <img
                                                    src={formData.image_url}
                                                    alt="Preview"
                                                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Invalid&background=f0f0f0&color=999';
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                                <input
                                    type="text"
                                    value={formData.linkedin_url}
                                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="https://linkedin.com/in/username"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                                <input
                                    type="text"
                                    value={formData.github_url}
                                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="https://github.com/username"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                                <input
                                    type="number"
                                    value={formData.display_order}
                                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0"
                                />
                                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <label className="text-sm font-medium text-gray-700">Active (Display on website)</label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleAdd}
                                    disabled={isSaving || isUploading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Add Member
                                </button>
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Team Members List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Social Links</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {members.map((member) => (
                                <tr key={member.id} className={member.is_active ? '' : 'bg-gray-50 opacity-60'}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <GripVertical className="w-4 h-4 text-gray-400" />
                                            <input
                                                type="number"
                                                value={member.display_order}
                                                onChange={(e) => {
                                                    const updated = members.map(m =>
                                                        m.id === member.id ? { ...m, display_order: parseInt(e.target.value) } : m
                                                    );
                                                    setMembers(updated);
                                                    setEditingId(member.id!);
                                                }}
                                                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={member.image_url}
                                                alt={member.name}
                                                className="w-10 h-10 rounded-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0c8bff&color=fff`;
                                                }}
                                            />
                                            <div>
                                                {editingId === member.id ? (
                                                    <input
                                                        type="text"
                                                        value={member.name}
                                                        onChange={(e) => {
                                                            const updated = members.map(m =>
                                                                m.id === member.id ? { ...m, name: e.target.value } : m
                                                            );
                                                            setMembers(updated);
                                                        }}
                                                        className="px-2 py-1 text-sm font-medium border border-gray-300 rounded"
                                                    />
                                                ) : (
                                                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === member.id ? (
                                            <input
                                                type="text"
                                                value={member.role}
                                                onChange={(e) => {
                                                    const updated = members.map(m =>
                                                        m.id === member.id ? { ...m, role: e.target.value } : m
                                                    );
                                                    setMembers(updated);
                                                }}
                                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                            />
                                        ) : (
                                            <div className="text-sm text-gray-500">{member.role}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {member.linkedin_url && (
                                                <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                                    <span className="text-xs">LinkedIn</span>
                                                </a>
                                            )}
                                            {member.github_url && (
                                                <a href={member.github_url} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900">
                                                    <span className="text-xs">GitHub</span>
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => toggleActive(member.id!)}
                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${member.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {member.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                            {member.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center gap-2">
                                            {editingId === member.id ? (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdate(member.id!)}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(null);
                                                            loadMembers(); // Reset data
                                                        }}
                                                        className="text-gray-600 hover:text-gray-900"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => setEditingId(member.id!)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(member.id!)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {members.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 mt-4">
                    <p className="text-gray-500 mb-4">No team members yet</p>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowAddForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Add your first team member
                    </button>
                </div>
            )}
        </div>
    );
}
