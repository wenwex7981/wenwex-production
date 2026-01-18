'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Upload, X, Plus, Calendar, Link as LinkIcon, Mail, Hash, Type, List, CheckSquare } from 'lucide-react';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export interface DynamicField {
    id: string;
    entity_type: string;
    field_name: string;
    field_label: string;
    field_type: string;
    field_options: { options?: string[] };
    placeholder: string;
    default_value: string;
    is_required: boolean;
    is_visible: boolean;
    display_order: number;
    section: string;
}

// Fetch dynamic fields for an entity type
export async function fetchDynamicFields(entityType: string): Promise<DynamicField[]> {
    try {
        const { data, error } = await supabase
            .from('dynamic_fields')
            .select('*')
            .eq('entity_type', entityType)
            .eq('is_visible', true)
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Error fetching dynamic fields:', error);
            return [];
        }
        return data || [];
    } catch (error) {
        console.error('Error fetching dynamic fields:', error);
        return [];
    }
}

// Component to render a single dynamic field
interface DynamicFieldInputProps {
    field: DynamicField;
    value: any;
    onChange: (fieldName: string, value: any) => void;
}

export function DynamicFieldInput({ field, value, onChange }: DynamicFieldInputProps) {
    const handleChange = (newValue: any) => {
        onChange(field.field_name, newValue);
    };

    const baseInputClass = "w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-gray-900";

    switch (field.field_type) {
        case 'textarea':
            return (
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        {field.field_label}
                        {field.is_required && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                        value={value || ''}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder={field.placeholder}
                        className={`${baseInputClass} min-h-[100px] resize-none`}
                        required={field.is_required}
                    />
                </div>
            );

        case 'number':
            return (
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        {field.field_label}
                        {field.is_required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                        type="number"
                        value={value || ''}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder={field.placeholder}
                        className={baseInputClass}
                        required={field.is_required}
                    />
                </div>
            );

        case 'email':
            return (
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {field.field_label}
                        {field.is_required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                        type="email"
                        value={value || ''}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder={field.placeholder}
                        className={baseInputClass}
                        required={field.is_required}
                    />
                </div>
            );

        case 'url':
            return (
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        {field.field_label}
                        {field.is_required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                        type="url"
                        value={value || ''}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder={field.placeholder || 'https://'}
                        className={baseInputClass}
                        required={field.is_required}
                    />
                </div>
            );

        case 'select':
            const selectOptions = field.field_options?.options || [];
            return (
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                        <List className="w-4 h-4" />
                        {field.field_label}
                        {field.is_required && <span className="text-red-500">*</span>}
                    </label>
                    <select
                        value={value || ''}
                        onChange={(e) => handleChange(e.target.value)}
                        className={`${baseInputClass} cursor-pointer`}
                        required={field.is_required}
                    >
                        <option value="">{field.placeholder || 'Select...'}</option>
                        {selectOptions.map((opt: string) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            );

        case 'checkbox':
            return (
                <div className="flex items-center gap-3 py-2">
                    <input
                        type="checkbox"
                        id={field.field_name}
                        checked={value || false}
                        onChange={(e) => handleChange(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor={field.field_name} className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <CheckSquare className="w-4 h-4" />
                        {field.field_label}
                        {field.is_required && <span className="text-red-500">*</span>}
                    </label>
                </div>
            );

        case 'date':
            return (
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {field.field_label}
                        {field.is_required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                        type="date"
                        value={value || ''}
                        onChange={(e) => handleChange(e.target.value)}
                        className={baseInputClass}
                        required={field.is_required}
                    />
                </div>
            );

        case 'file':
            return (
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        {field.field_label}
                        {field.is_required && <span className="text-red-500">*</span>}
                    </label>
                    <div className="flex items-center gap-2">
                        {value && (
                            <div className="flex-1 px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-600 truncate">
                                {typeof value === 'string' ? value.split('/').pop() : 'File selected'}
                            </div>
                        )}
                        <label className="px-4 py-3 bg-primary-50 text-primary-600 rounded-xl cursor-pointer hover:bg-primary-100 transition-colors font-medium text-sm">
                            {value ? 'Change' : 'Upload'}
                            <input
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        // For now, store file name - proper upload should be added
                                        handleChange(file.name);
                                    }
                                }}
                            />
                        </label>
                        {value && (
                            <button
                                type="button"
                                onClick={() => handleChange('')}
                                className="p-2 text-gray-400 hover:text-red-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            );

        case 'text':
        default:
            return (
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        {field.field_label}
                        {field.is_required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder={field.placeholder}
                        className={baseInputClass}
                        required={field.is_required}
                    />
                </div>
            );
    }
}

// Hook to use dynamic fields in forms
export function useDynamicFields(entityType: string) {
    const [fields, setFields] = useState<DynamicField[]>([]);
    const [values, setValues] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            const data = await fetchDynamicFields(entityType);
            setFields(data);

            // Initialize values with defaults
            const defaults: Record<string, any> = {};
            data.forEach(field => {
                if (field.default_value) {
                    defaults[field.field_name] = field.default_value;
                }
            });
            setValues(defaults);
            setIsLoading(false);
        }
        load();
    }, [entityType]);

    const updateValue = (fieldName: string, value: any) => {
        setValues(prev => ({ ...prev, [fieldName]: value }));
    };

    const setInitialValues = (initialValues: Record<string, any>) => {
        setValues(prev => ({ ...prev, ...initialValues }));
    };

    return { fields, values, updateValue, setInitialValues, isLoading };
}

// Component to render all dynamic fields for an entity
interface DynamicFieldsFormProps {
    entityType: string;
    values: Record<string, any>;
    onChange: (fieldName: string, value: any) => void;
    section?: string;
}

export function DynamicFieldsForm({ entityType, values, onChange, section }: DynamicFieldsFormProps) {
    const [fields, setFields] = useState<DynamicField[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            let data = await fetchDynamicFields(entityType);
            if (section) {
                data = data.filter(f => f.section === section);
            }
            setFields(data);
            setIsLoading(false);
        }
        load();
    }, [entityType, section]);

    if (isLoading) {
        return <div className="text-gray-400 text-sm py-2">Loading custom fields...</div>;
    }

    if (fields.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {fields.map(field => (
                <DynamicFieldInput
                    key={field.id}
                    field={field}
                    value={values[field.field_name]}
                    onChange={onChange}
                />
            ))}
        </div>
    );
}

// Component to display dynamic field values (for buyer pages)
interface DynamicFieldsDisplayProps {
    entityType: string;
    values: Record<string, any>;
    section?: string;
}

export function DynamicFieldsDisplay({ entityType, values, section }: DynamicFieldsDisplayProps) {
    const [fields, setFields] = useState<DynamicField[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            let data = await fetchDynamicFields(entityType);
            if (section) {
                data = data.filter(f => f.section === section);
            }
            setFields(data);
            setIsLoading(false);
        }
        load();
    }, [entityType, section]);

    if (isLoading || !values) return null;

    const displayFields = fields.filter(f => values[f.field_name]);

    if (displayFields.length === 0) return null;

    return (
        <div className="space-y-3">
            {displayFields.map(field => (
                <div key={field.id} className="flex items-start gap-3">
                    <span className="text-sm font-medium text-gray-500 min-w-[120px]">{field.field_label}:</span>
                    <span className="text-sm text-gray-900">
                        {field.field_type === 'checkbox'
                            ? (values[field.field_name] ? 'Yes' : 'No')
                            : values[field.field_name]
                        }
                    </span>
                </div>
            ))}
        </div>
    );
}
