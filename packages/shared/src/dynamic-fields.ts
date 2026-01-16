import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export interface DynamicField {
    id: string;
    entity_type: string;
    field_name: string;
    field_label: string;
    field_type: 'text' | 'textarea' | 'number' | 'email' | 'url' | 'select' | 'checkbox' | 'date' | 'file' | 'json';
    field_options: {
        options?: string[];
        [key: string]: any;
    };
    placeholder: string;
    default_value: string;
    is_required: boolean;
    is_visible: boolean;
    display_order: number;
    section: string;
    validation_rules: {
        min?: number;
        max?: number;
        pattern?: string;
        [key: string]: any;
    };
}

/**
 * Fetch all visible dynamic fields for an entity type
 * @param entityType - The entity type to fetch fields for (e.g., 'vendors', 'services')
 * @returns Array of dynamic field definitions
 */
export async function getDynamicFields(entityType: string): Promise<DynamicField[]> {
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

/**
 * Get dynamic fields grouped by section
 * @param entityType - The entity type to fetch fields for
 * @returns Object with section names as keys and arrays of fields as values
 */
export async function getDynamicFieldsBySection(entityType: string): Promise<Record<string, DynamicField[]>> {
    const fields = await getDynamicFields(entityType);

    const grouped: Record<string, DynamicField[]> = {};
    fields.forEach(field => {
        const section = field.section || 'general';
        if (!grouped[section]) {
            grouped[section] = [];
        }
        grouped[section].push(field);
    });

    return grouped;
}

/**
 * Render dynamic field input based on field type
 * This is a helper to generate the appropriate input element
 */
export function getDynamicFieldInputType(fieldType: string): string {
    const typeMap: Record<string, string> = {
        'text': 'text',
        'textarea': 'textarea',
        'number': 'number',
        'email': 'email',
        'url': 'url',
        'select': 'select',
        'checkbox': 'checkbox',
        'date': 'date',
        'file': 'file',
        'json': 'textarea',
    };
    return typeMap[fieldType] || 'text';
}

/**
 * Validate a value against dynamic field rules
 */
export function validateDynamicField(field: DynamicField, value: any): { valid: boolean; error?: string } {
    // Check required
    if (field.is_required && (value === undefined || value === null || value === '')) {
        return { valid: false, error: `${field.field_label} is required` };
    }

    if (value === undefined || value === null || value === '') {
        return { valid: true };
    }

    const rules = field.validation_rules;

    // Check min/max for numbers
    if (field.field_type === 'number') {
        const numValue = Number(value);
        if (rules.min !== undefined && numValue < rules.min) {
            return { valid: false, error: `${field.field_label} must be at least ${rules.min}` };
        }
        if (rules.max !== undefined && numValue > rules.max) {
            return { valid: false, error: `${field.field_label} must be at most ${rules.max}` };
        }
    }

    // Check min/max length for text
    if (field.field_type === 'text' || field.field_type === 'textarea') {
        const strValue = String(value);
        if (rules.min !== undefined && strValue.length < rules.min) {
            return { valid: false, error: `${field.field_label} must be at least ${rules.min} characters` };
        }
        if (rules.max !== undefined && strValue.length > rules.max) {
            return { valid: false, error: `${field.field_label} must be at most ${rules.max} characters` };
        }
    }

    // Check pattern
    if (rules.pattern) {
        const regex = new RegExp(rules.pattern);
        if (!regex.test(String(value))) {
            return { valid: false, error: `${field.field_label} format is invalid` };
        }
    }

    // Check email format
    if (field.field_type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
            return { valid: false, error: 'Please enter a valid email address' };
        }
    }

    // Check URL format
    if (field.field_type === 'url') {
        try {
            new URL(String(value));
        } catch {
            return { valid: false, error: 'Please enter a valid URL' };
        }
    }

    return { valid: true };
}

/**
 * Apply default values to a data object based on dynamic fields
 */
export function applyDynamicFieldDefaults(fields: DynamicField[], data: Record<string, any>): Record<string, any> {
    const result = { ...data };

    fields.forEach(field => {
        if (result[field.field_name] === undefined && field.default_value) {
            if (field.field_type === 'checkbox') {
                result[field.field_name] = field.default_value === 'true';
            } else if (field.field_type === 'number') {
                result[field.field_name] = Number(field.default_value);
            } else if (field.field_type === 'json') {
                try {
                    result[field.field_name] = JSON.parse(field.default_value);
                } catch {
                    result[field.field_name] = field.default_value;
                }
            } else {
                result[field.field_name] = field.default_value;
            }
        }
    });

    return result;
}
