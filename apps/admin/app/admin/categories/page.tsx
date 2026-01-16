'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, FolderKanban, Edit2, Trash2, ChevronRight, Loader2,
    Link as LinkIcon, Image, Palette, Eye, EyeOff, Save, X, ChevronDown
} from 'lucide-react';
import { fetchCategories, createCategory, updateCategory, deleteCategory, createSubCategory } from '@/lib/admin-service';
import { toast } from 'react-hot-toast';

const iconOptions = [
    'Globe', 'Smartphone', 'Code', 'Palette', 'Cloud', 'Brain', 'Shield', 'TestTube', 'Cog',
    'GraduationCap', 'FileCode', 'FileText', 'Edit', 'BookOpen', 'Briefcase', 'Package', 'Zap',
    'Database', 'Server', 'Monitor', 'Cpu', 'Layers', 'Box', 'Settings', 'Terminal'
];

const colorOptions = [
    { name: 'Blue Cyan', value: 'from-blue-600 to-cyan-500' },
    { name: 'Emerald Teal', value: 'from-emerald-600 to-teal-500' },
    { name: 'Indigo Violet', value: 'from-indigo-600 to-violet-500' },
    { name: 'Pink Rose', value: 'from-pink-600 to-rose-500' },
    { name: 'Cyan Blue', value: 'from-cyan-600 to-blue-500' },
    { name: 'Orange Amber', value: 'from-orange-600 to-amber-500' },
    { name: 'Red Rose', value: 'from-red-600 to-rose-500' },
    { name: 'Yellow Orange', value: 'from-yellow-600 to-orange-500' },
    { name: 'Violet Purple', value: 'from-violet-600 to-purple-500' },
    { name: 'Teal Emerald', value: 'from-teal-600 to-emerald-500' },
];

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [newCategory, setNewCategory] = useState({
        name: '', description: '', icon_name: 'Globe', image_url: '', color: 'from-blue-600 to-cyan-500', type: 'IT_TECH', is_visible: true
    });
    const [newSubCategory, setNewSubCategory] = useState({
        name: '', description: '', icon_name: 'Package', image_url: '', color: 'from-blue-600 to-cyan-500', service_count: 0, category_id: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setIsLoading(true);
        try {
            const data = await fetchCategories();
            setCategories(data || []);
        } catch (error: any) {
            toast.error('Failed to load categories: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const slug = newCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            await createCategory({ ...newCategory, slug });
            toast.success('Category created successfully');
            setIsAddModalOpen(false);
            setNewCategory({ name: '', description: '', icon_name: 'Globe', image_url: '', color: 'from-blue-600 to-cyan-500', type: 'IT_TECH', is_visible: true });
            loadCategories();
        } catch (error: any) {
            toast.error('Failed to create category: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory) return;
        setIsSubmitting(true);
        try {
            await updateCategory(selectedCategory.id, selectedCategory);
            toast.success('Category updated successfully');
            setIsEditModalOpen(false);
            setSelectedCategory(null);
            loadCategories();
        } catch (error: any) {
            toast.error('Failed to update category: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateSubCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const slug = newSubCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            await createSubCategory({ ...newSubCategory, slug, is_visible: true });
            toast.success('Sub-category created successfully');
            setIsSubModalOpen(false);
            setNewSubCategory({ name: '', description: '', icon_name: 'Package', image_url: '', color: 'from-blue-600 to-cyan-500', service_count: 0, category_id: '' });
            loadCategories();
        } catch (error: any) {
            toast.error('Failed to create sub-category: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category? This will affect services using it.')) return;
        try {
            await deleteCategory(id);
            toast.success('Category deleted');
            loadCategories();
        } catch (error: any) {
            toast.error('Failed to delete: ' + error.message);
        }
    };

    const openEditModal = (category: any) => {
        setSelectedCategory({ ...category });
        setIsEditModalOpen(true);
    };

    const openSubModal = (categoryId: string) => {
        setNewSubCategory({ ...newSubCategory, category_id: categoryId });
        setIsSubModalOpen(true);
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const CategoryForm = ({ data, setData, onSubmit, isEdit = false }: any) => (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Name</label>
                    <input
                        type="text"
                        className="input w-full"
                        placeholder="e.g. Web Development"
                        value={data.name}
                        onChange={e => setData({ ...data, name: e.target.value })}
                        required
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Description</label>
                    <textarea
                        className="input w-full h-20 resize-none"
                        placeholder="Brief description of this category..."
                        value={data.description}
                        onChange={e => setData({ ...data, description: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Icon</label>
                    <select
                        className="input w-full"
                        value={data.icon_name}
                        onChange={e => setData({ ...data, icon_name: e.target.value })}
                    >
                        {iconOptions.map(icon => (
                            <option key={icon} value={icon}>{icon}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Color Gradient</label>
                    <select
                        className="input w-full"
                        value={data.color}
                        onChange={e => setData({ ...data, color: e.target.value })}
                    >
                        {colorOptions.map(color => (
                            <option key={color.value} value={color.value}>{color.name}</option>
                        ))}
                    </select>
                </div>
                <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Image URL</label>
                    <div className="relative">
                        <Image className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="url"
                            className="input pl-12 w-full"
                            placeholder="https://images.unsplash.com/..."
                            value={data.image_url}
                            onChange={e => setData({ ...data, image_url: e.target.value })}
                        />
                    </div>
                    {data.image_url && (
                        <div className="mt-2 rounded-xl overflow-hidden h-24">
                            <img src={data.image_url} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>
                {!data.category_id && (
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Type</label>
                        <select
                            className="input w-full"
                            value={data.type}
                            onChange={e => setData({ ...data, type: e.target.value })}
                        >
                            <option value="IT_TECH">IT & Tech</option>
                            <option value="ACADEMIC">Academic</option>
                        </select>
                    </div>
                )}
                {data.service_count !== undefined && (
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Service Count</label>
                        <input
                            type="number"
                            className="input w-full"
                            value={data.service_count}
                            onChange={e => setData({ ...data, service_count: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                )}
            </div>

            <div className="flex gap-4 mt-8">
                <button
                    type="button"
                    className="btn-secondary flex-1"
                    onClick={() => {
                        setIsAddModalOpen(false);
                        setIsEditModalOpen(false);
                        setIsSubModalOpen(false);
                    }}
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (isEdit ? 'Update Category' : 'Create Category')}
                </button>
            </div>
        </form>
    );

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Category Management</h1>
                    <p className="text-gray-400">Organize and manage platform service categories - changes reflect on buyer website</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn-primary"
                >
                    <Plus className="w-4 h-4" />
                    New Category
                </button>
            </div>

            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input pl-12 w-full"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-20 text-center">
                        <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">Loading categories...</p>
                    </div>
                ) : filteredCategories.map((category) => (
                    <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card group hover:border-primary-500/50 transition-colors overflow-hidden"
                    >
                        {/* Category Image Preview */}
                        {category.image_url && (
                            <div className="h-32 -mx-6 -mt-6 mb-4 overflow-hidden">
                                <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
                            </div>
                        )}

                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color || 'from-blue-600 to-cyan-500'} flex items-center justify-center text-white font-bold shadow-lg`}>
                                {category.icon_name?.charAt(0) || <FolderKanban className="w-6 h-6" />}
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openEditModal(category)}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteCategory(category.id)}
                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-white">{category.name}</h3>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${category.type === 'ACADEMIC' ? 'bg-purple-500/20 text-purple-400' : 'bg-primary-500/20 text-primary-400'}`}>
                                {category.type || 'IT_TECH'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2 mb-4">{category.description || 'No description provided.'}</p>

                        <div className="space-y-2 pt-4 border-t border-gray-700">
                            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <span>Sub-categories</span>
                                <span>{category.sub_categories?.length || 0}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {category.sub_categories?.slice(0, 3).map((sub: any) => (
                                    <span key={sub.id} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-[10px]">
                                        {sub.name}
                                    </span>
                                ))}
                                {(category.sub_categories?.length || 0) > 3 && (
                                    <span className="text-[10px] text-gray-500 mt-1">
                                        +{category.sub_categories.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => openSubModal(category.id)}
                            className="w-full mt-6 py-2 flex items-center justify-center gap-2 text-sm font-medium text-primary-400 hover:text-primary-300 bg-primary-500/5 hover:bg-primary-500/10 rounded-xl transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Sub-category
                        </button>
                    </motion.div>
                ))}

                {!isLoading && filteredCategories.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-700">
                        <FolderKanban className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No categories found</h3>
                        <p className="text-gray-400 mb-6">Start by creating your first platform category.</p>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="btn-primary"
                        >
                            <Plus className="w-4 h-4" />
                            New Category
                        </button>
                    </div>
                )}
            </div>

            {/* Add Category Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/70" onClick={() => setIsAddModalOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-gray-800 rounded-2xl p-6 max-w-lg w-full border border-gray-700 max-h-[90vh] overflow-y-auto"
                        >
                            <h2 className="text-xl font-bold text-white mb-6">Create New Category</h2>
                            <CategoryForm data={newCategory} setData={setNewCategory} onSubmit={handleCreateCategory} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Category Modal */}
            <AnimatePresence>
                {isEditModalOpen && selectedCategory && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/70" onClick={() => setIsEditModalOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-gray-800 rounded-2xl p-6 max-w-lg w-full border border-gray-700 max-h-[90vh] overflow-y-auto"
                        >
                            <h2 className="text-xl font-bold text-white mb-6">Edit Category</h2>
                            <CategoryForm data={selectedCategory} setData={setSelectedCategory} onSubmit={handleUpdateCategory} isEdit />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add Sub-Category Modal */}
            <AnimatePresence>
                {isSubModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/70" onClick={() => setIsSubModalOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-gray-800 rounded-2xl p-6 max-w-lg w-full border border-gray-700 max-h-[90vh] overflow-y-auto"
                        >
                            <h2 className="text-xl font-bold text-white mb-6">Add Sub-Category</h2>
                            <CategoryForm data={newSubCategory} setData={setNewSubCategory} onSubmit={handleCreateSubCategory} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
