'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from './supabase';
import { Upload, X, Calendar, Link as LinkIcon, Mail, Hash, Type, List, CheckSquare } from 'lucide-react';

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
        const supabase = getSupabaseClient();
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

// Component to render a single dynamic field input
interface DynamicFieldInputProps {
    field: DynamicField;
    value: any;
    onChange: (fieldName: string, value: any) => void;
}

export function DynamicFieldInput({ field, value, onChange }: DynamicFieldInputProps) {
    const handleChange = (newValue: any) => {
        onChange(field.field_name, newValue);
    };

    const baseInputClass = "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900";

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

        case 'checkbox':
            return (
                <div className="flex items-center gap-3 py-2">
                    <input
                        type="checkbox"
                        id={field.field_name}
                        checked={value || false}
                        onChange={(e) => handleChange(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={field.field_name} className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <CheckSquare className="w-4 h-4" />
                        {field.field_label}
                        {field.is_required && <span className="text-red-500">*</span>}
                    </label>
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

// Form component to render all dynamic fields
interface DynamicFieldsFormProps {
    entityType: string;
    values: Record<string, any>;
    onChange: (fieldName: string, value: any) => void;
    section?: string;
    className?: string;
}

export function DynamicFieldsForm({ entityType, values, onChange, section, className = '' }: DynamicFieldsFormProps) {
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
        return <div className="text-gray-400 text-sm py-2">Loading fields...</div>;
    }

    if (fields.length === 0) {
        return null;
    }

    return (
        <div className={`space-y-4 ${className}`}>
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

// Component to display dynamic field values (read-only display for buyer pages)
interface DynamicFieldsDisplayProps {
    entityType: string;
    values: Record<string, any>;
    section?: string;
    className?: string;
    variant?: 'list' | 'tags';
}

export function DynamicFieldsDisplay({ entityType, values, section, className = '', variant = 'list' }: DynamicFieldsDisplayProps) {
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

    const displayFields = fields.filter(f => values[f.field_name] !== undefined && values[f.field_name] !== '');

    if (displayFields.length === 0) return null;

    if (variant === 'tags') {
        return (
            <div className={`flex flex-wrap gap-2 ${className}`}>
                {displayFields.map(field => (
                    <div
                        key={field.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-600 border border-gray-200"
                    >
                        <span className="text-gray-400">{field.field_label}:</span>
                        <span className="text-gray-900">
                            {field.field_type === 'checkbox'
                                ? (values[field.field_name] ? '✓' : '✗')
                                : values[field.field_name]
                            }
                        </span>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
            {displayFields.map(field => (
                <div key={field.id} className="flex flex-col gap-1 p-3 rounded-2xl bg-white border border-gray-100">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {field.field_label}
                    </span>
                    <span className="text-sm text-gray-900 font-bold">
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

// Hook for using dynamic fields data
export function useDynamicFieldsData(entityType: string, customFieldsData: Record<string, any> = {}) {
    const [fields, setFields] = useState<DynamicField[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            const data = await fetchDynamicFields(entityType);
            setFields(data);
            setIsLoading(false);
        }
        load();
    }, [entityType]);

    const getFieldValue = (fieldName: string) => {
        return customFieldsData[fieldName];
    };

    const getFieldLabel = (fieldName: string) => {
        const field = fields.find(f => f.field_name === fieldName);
        return field?.field_label || fieldName;
    };

    return { fields, isLoading, getFieldValue, getFieldLabel };
}
