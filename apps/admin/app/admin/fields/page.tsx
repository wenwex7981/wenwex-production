'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Trash2, Edit3, Save, X, ChevronDown, ChevronUp,
    Settings, Database, Layers, FileText, List, ToggleLeft,
    Hash, Calendar, Link, Type, AlignLeft, CheckSquare, Mail,
    Image, Code, Loader2, AlertCircle, Check, GripVertical
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Field types configuration
const FIELD_TYPES = [
    { value: 'text', label: 'Text', icon: Type, description: 'Single line text input' },
    { value: 'textarea', label: 'Textarea', icon: AlignLeft, description: 'Multi-line text input' },
    { value: 'number', label: 'Number', icon: Hash, description: 'Numeric input' },
    { value: 'email', label: 'Email', icon: Mail, description: 'Email address input' },
    { value: 'url', label: 'URL', icon: Link, description: 'Website URL input' },
    { value: 'select', label: 'Dropdown', icon: List, description: 'Select from options' },
    { value: 'checkbox', label: 'Checkbox', icon: CheckSquare, description: 'Yes/No toggle' },
    { value: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
    { value: 'file', label: 'File Upload', icon: Image, description: 'File/Image upload' },
    { value: 'json', label: 'JSON', icon: Code, description: 'JSON data field' },
];

// Entity types for the platform
const ENTITY_TYPES = [
    { value: 'vendors', label: 'Vendors', description: 'Vendor/Agency profiles' },
    { value: 'services', label: 'Services', description: 'Service listings' },
    { value: 'categories', label: 'Categories', description: 'Service categories' },
    { value: 'users', label: 'Users', description: 'User accounts' },
    { value: 'orders', label: 'Orders', description: 'Order/Purchase records' },
    { value: 'reviews', label: 'Reviews', description: 'User reviews' },
    { value: 'shorts', label: 'Shorts', description: 'Short videos' },
];

// Section types for grouping fields
const SECTION_TYPES = [
    { value: 'general', label: 'General Information' },
    { value: 'contact', label: 'Contact Details' },
    { value: 'social', label: 'Social Links' },
    { value: 'pricing', label: 'Pricing & Plans' },
    { value: 'features', label: 'Features' },
    { value: 'media', label: 'Media & Files' },
    { value: 'settings', label: 'Settings' },
    { value: 'custom', label: 'Custom' },
];

interface DynamicField {
    id: string;
    entity_type: string;
    field_name: string;
    field_label: string;
    field_type: string;
    field_options: any;
    placeholder: string;
    default_value: string;
    is_required: boolean;
    is_visible: boolean;
    display_order: number;
    section: string;
    validation_rules: any;
    created_at: string;
}

export default function FieldsManagementPage() {
    const [fields, setFields] = useState<DynamicField[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEntity, setSelectedEntity] = useState('vendors');
    const [isAddingField, setIsAddingField] = useState(false);
    const [editingField, setEditingField] = useState<DynamicField | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // New field form state
    const [newField, setNewField] = useState({
        field_name: '',
        field_label: '',
        field_type: 'text',
        placeholder: '',
        default_value: '',
        is_required: false,
        is_visible: true,
        section: 'general',
        field_options: { options: [] },
        validation_rules: {},
    });

    // Load fields on mount and when entity changes
    useEffect(() => {
        loadFields();
    }, [selectedEntity]);

    const loadFields = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('dynamic_fields')
                .select('*')
                .eq('entity_type', selectedEntity)
                .order('display_order', { ascending: true });

            if (error) throw error;
            setFields(data || []);
        } catch (error: any) {
            console.error('Error loading fields:', error);
            if (error.code === '42P01') {
                toast.error('Dynamic fields table not found. Please run the SQL script.');
            } else {
                toast.error('Failed to load fields');
            }
            setFields([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddField = async () => {
        if (!newField.field_name || !newField.field_label) {
            toast.error('Field name and label are required');
            return;
        }

        // Convert field name to snake_case
        const fieldName = newField.field_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

        setIsSaving(true);
        try {
            const { data, error } = await supabase
                .from('dynamic_fields')
                .insert([{
                    entity_type: selectedEntity,
                    field_name: fieldName,
                    field_label: newField.field_label,
                    field_type: newField.field_type,
                    placeholder: newField.placeholder,
                    default_value: newField.default_value,
                    is_required: newField.is_required,
                    is_visible: newField.is_visible,
                    section: newField.section,
                    field_options: newField.field_options,
                    validation_rules: newField.validation_rules,
                    display_order: fields.length,
                }])
                .select()
                .single();

            if (error) {
                if (error.code === '23505') {
                    toast.error('A field with this name already exists');
                } else {
                    throw error;
                }
                return;
            }

            setFields([...fields, data]);
            resetNewField();
            setIsAddingField(false);
            toast.success('Field added successfully!');
        } catch (error) {
            console.error('Error adding field:', error);
            toast.error('Failed to add field');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateField = async () => {
        if (!editingField) return;

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('dynamic_fields')
                .update({
                    field_label: editingField.field_label,
                    field_type: editingField.field_type,
                    placeholder: editingField.placeholder,
                    default_value: editingField.default_value,
                    is_required: editingField.is_required,
                    is_visible: editingField.is_visible,
                    section: editingField.section,
                    field_options: editingField.field_options,
                    validation_rules: editingField.validation_rules,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', editingField.id);

            if (error) throw error;

            setFields(fields.map(f => f.id === editingField.id ? editingField : f));
            setEditingField(null);
            toast.success('Field updated successfully!');
        } catch (error) {
            console.error('Error updating field:', error);
            toast.error('Failed to update field');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteField = async (fieldId: string) => {
        if (!confirm('Are you sure you want to delete this field? This action cannot be undone.')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('dynamic_fields')
                .delete()
                .eq('id', fieldId);

            if (error) throw error;

            setFields(fields.filter(f => f.id !== fieldId));
            toast.success('Field deleted successfully!');
        } catch (error) {
            console.error('Error deleting field:', error);
            toast.error('Failed to delete field');
        }
    };

    const handleMoveField = async (fieldId: string, direction: 'up' | 'down') => {
        const index = fields.findIndex(f => f.id === fieldId);
        if (index === -1) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === fields.length - 1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        const newFields = [...fields];
        [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];

        // Update display_order for both fields
        try {
            await Promise.all([
                supabase.from('dynamic_fields').update({ display_order: newIndex }).eq('id', fieldId),
                supabase.from('dynamic_fields').update({ display_order: index }).eq('id', newFields[index].id),
            ]);

            setFields(newFields.map((f, i) => ({ ...f, display_order: i })));
        } catch (error) {
            console.error('Error reordering fields:', error);
            toast.error('Failed to reorder fields');
        }
    };

    const resetNewField = () => {
        setNewField({
            field_name: '',
            field_label: '',
            field_type: 'text',
            placeholder: '',
            default_value: '',
            is_required: false,
            is_visible: true,
            section: 'general',
            field_options: { options: [] },
            validation_rules: {},
        });
    };

    const getFieldTypeIcon = (type: string) => {
        const fieldType = FIELD_TYPES.find(t => t.value === type);
        return fieldType ? fieldType.icon : Type;
    };

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                            <Database className="w-6 h-6 text-white" />
                        </div>
                        Dynamic Fields Manager
                    </h1>
                    <p className="text-gray-500 mt-2">Create and manage custom fields for any entity without code changes</p>
                </div>
                <button
                    onClick={() => setIsAddingField(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Add New Field
                </button>
            </div>

            {/* Entity Selector */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Select Entity Type
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {ENTITY_TYPES.map((entity) => (
                        <button
                            key={entity.value}
                            onClick={() => setSelectedEntity(entity.value)}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${selectedEntity === entity.value
                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                    : 'border-gray-100 hover:border-gray-200 text-gray-600'
                                }`}
                        >
                            <div className="font-semibold">{entity.label}</div>
                            <div className="text-xs opacity-70 mt-1">{entity.description}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Fields List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-500" />
                        {ENTITY_TYPES.find(e => e.value === selectedEntity)?.label} Fields
                        <span className="ml-2 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                            {fields.length} fields
                        </span>
                    </h2>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto" />
                        <p className="text-gray-500 mt-4">Loading fields...</p>
                    </div>
                ) : fields.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Database className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">No custom fields yet</h3>
                        <p className="text-gray-500 mb-6">Add your first custom field to start extending {selectedEntity}</p>
                        <button
                            onClick={() => setIsAddingField(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold"
                        >
                            <Plus className="w-5 h-5" />
                            Add First Field
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {fields.map((field, index) => {
                            const FieldIcon = getFieldTypeIcon(field.field_type);
                            const isEditing = editingField?.id === field.id;

                            return (
                                <motion.div
                                    key={field.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`p-4 hover:bg-gray-50 transition-colors ${isEditing ? 'bg-purple-50' : ''}`}
                                >
                                    {isEditing ? (
                                        /* Edit Mode */
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 uppercase">Field Label</label>
                                                    <input
                                                        type="text"
                                                        value={editingField.field_label}
                                                        onChange={(e) => setEditingField({ ...editingField, field_label: e.target.value })}
                                                        className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 uppercase">Field Type</label>
                                                    <select
                                                        value={editingField.field_type}
                                                        onChange={(e) => setEditingField({ ...editingField, field_type: e.target.value })}
                                                        className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    >
                                                        {FIELD_TYPES.map(type => (
                                                            <option key={type.value} value={type.value}>{type.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 uppercase">Section</label>
                                                    <select
                                                        value={editingField.section}
                                                        onChange={(e) => setEditingField({ ...editingField, section: e.target.value })}
                                                        className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    >
                                                        {SECTION_TYPES.map(section => (
                                                            <option key={section.value} value={section.value}>{section.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 uppercase">Placeholder</label>
                                                    <input
                                                        type="text"
                                                        value={editingField.placeholder || ''}
                                                        onChange={(e) => setEditingField({ ...editingField, placeholder: e.target.value })}
                                                        className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-400 uppercase">Default Value</label>
                                                    <input
                                                        type="text"
                                                        value={editingField.default_value || ''}
                                                        onChange={(e) => setEditingField({ ...editingField, default_value: e.target.value })}
                                                        className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={editingField.is_required}
                                                        onChange={(e) => setEditingField({ ...editingField, is_required: e.target.checked })}
                                                        className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                    />
                                                    <span className="text-sm font-medium text-gray-700">Required</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={editingField.is_visible}
                                                        onChange={(e) => setEditingField({ ...editingField, is_visible: e.target.checked })}
                                                        className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                    />
                                                    <span className="text-sm font-medium text-gray-700">Visible</span>
                                                </label>
                                            </div>
                                            <div className="flex items-center gap-3 pt-2">
                                                <button
                                                    onClick={handleUpdateField}
                                                    disabled={isSaving}
                                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
                                                >
                                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                    Save Changes
                                                </button>
                                                <button
                                                    onClick={() => setEditingField(null)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* View Mode */
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <button
                                                    onClick={() => handleMoveField(field.id, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1 hover:text-gray-600 disabled:opacity-30"
                                                >
                                                    <ChevronUp className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleMoveField(field.id, 'down')}
                                                    disabled={index === fields.length - 1}
                                                    className="p-1 hover:text-gray-600 disabled:opacity-30"
                                                >
                                                    <ChevronDown className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${field.is_visible ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'
                                                }`}>
                                                <FieldIcon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-900">{field.field_label}</span>
                                                    {field.is_required && (
                                                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">Required</span>
                                                    )}
                                                    {!field.is_visible && (
                                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">Hidden</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{field.field_name}</span>
                                                    <span>•</span>
                                                    <span className="capitalize">{field.field_type}</span>
                                                    <span>•</span>
                                                    <span className="capitalize">{field.section}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setEditingField(field)}
                                                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                >
                                                    <Edit3 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteField(field.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add Field Modal */}
            <AnimatePresence>
                {isAddingField && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setIsAddingField(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900">Add New Field</h2>
                                    <button
                                        onClick={() => setIsAddingField(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-gray-500 mt-1">
                                    Create a new custom field for <span className="font-medium text-purple-600">{selectedEntity}</span>
                                </p>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Field Name & Label */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Field Name *</label>
                                        <input
                                            type="text"
                                            value={newField.field_name}
                                            onChange={(e) => setNewField({ ...newField, field_name: e.target.value })}
                                            placeholder="e.g., company_tagline"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Will be converted to snake_case</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Display Label *</label>
                                        <input
                                            type="text"
                                            value={newField.field_label}
                                            onChange={(e) => setNewField({ ...newField, field_label: e.target.value })}
                                            placeholder="e.g., Company Tagline"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Field Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Field Type</label>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                        {FIELD_TYPES.map((type) => {
                                            const TypeIcon = type.icon;
                                            return (
                                                <button
                                                    key={type.value}
                                                    onClick={() => setNewField({ ...newField, field_type: type.value })}
                                                    className={`p-3 rounded-xl border-2 transition-all text-center ${newField.field_type === type.value
                                                            ? 'border-purple-500 bg-purple-50'
                                                            : 'border-gray-100 hover:border-gray-200'
                                                        }`}
                                                >
                                                    <TypeIcon className={`w-5 h-5 mx-auto mb-1 ${newField.field_type === type.value ? 'text-purple-600' : 'text-gray-400'
                                                        }`} />
                                                    <span className={`text-xs font-medium ${newField.field_type === type.value ? 'text-purple-700' : 'text-gray-600'
                                                        }`}>{type.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Section */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                                    <select
                                        value={newField.section}
                                        onChange={(e) => setNewField({ ...newField, section: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        {SECTION_TYPES.map(section => (
                                            <option key={section.value} value={section.value}>{section.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Placeholder & Default Value */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
                                        <input
                                            type="text"
                                            value={newField.placeholder}
                                            onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                                            placeholder="e.g., Enter your tagline..."
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Default Value</label>
                                        <input
                                            type="text"
                                            value={newField.default_value}
                                            onChange={(e) => setNewField({ ...newField, default_value: e.target.value })}
                                            placeholder="Optional default value"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Options */}
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newField.is_required}
                                            onChange={(e) => setNewField({ ...newField, is_required: e.target.checked })}
                                            className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Required field</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newField.is_visible}
                                            onChange={(e) => setNewField({ ...newField, is_visible: e.target.checked })}
                                            className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Visible in forms</span>
                                    </label>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                                <button
                                    onClick={() => {
                                        resetNewField();
                                        setIsAddingField(false);
                                    }}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddField}
                                    disabled={isSaving || !newField.field_name || !newField.field_label}
                                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5" />
                                            Create Field
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
