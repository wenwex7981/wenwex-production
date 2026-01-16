// ===========================================
// PLATFORM ACCESS CONTROL SERVICE
// ===========================================
// Centralized service for checking feature flags, permissions, and configs
// Used across buyer, vendor, and admin apps

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// Cache for feature flags and configs
let featureFlagsCache: Map<string, boolean> = new Map();
let platformConfigCache: Map<string, string> = new Map();
let permissionsCache: Map<string, Map<string, boolean>> = new Map();
let cacheTimestamp: number = 0;
const CACHE_TTL = 60000; // 1 minute cache

// ===========================================
// FEATURE FLAGS
// ===========================================

export interface FeatureFlag {
    feature_key: string;
    feature_name: string;
    is_enabled: boolean;
    applies_to: string;
    category: string;
    config: Record<string, any>;
}

/**
 * Check if a feature is enabled
 * @param featureKey - The feature key to check (e.g., 'auth_google_oauth')
 * @returns boolean - Whether the feature is enabled
 */
export async function isFeatureEnabled(featureKey: string): Promise<boolean> {
    await refreshCacheIfNeeded();
    return featureFlagsCache.get(featureKey) ?? true; // Default to enabled if not found
}

/**
 * Get multiple feature flags at once
 * @param featureKeys - Array of feature keys to check
 * @returns Object with feature keys as keys and boolean values
 */
export async function getFeatureFlags(featureKeys: string[]): Promise<Record<string, boolean>> {
    await refreshCacheIfNeeded();
    const result: Record<string, boolean> = {};
    featureKeys.forEach(key => {
        result[key] = featureFlagsCache.get(key) ?? true;
    });
    return result;
}

/**
 * Get all feature flags for a specific category
 * @param category - Category name (e.g., 'auth', 'services', 'messaging')
 */
export async function getFeatureFlagsByCategory(category: string): Promise<FeatureFlag[]> {
    const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .eq('category', category);

    if (error) {
        console.error('Error fetching feature flags:', error);
        return [];
    }
    return data || [];
}

// ===========================================
// ROLE PERMISSIONS
// ===========================================

export interface Permission {
    permission_key: string;
    permission_name: string;
    is_allowed: boolean;
}

/**
 * Check if a role has a specific permission
 * @param role - User role ('BUYER', 'VENDOR', 'SUPER_ADMIN')
 * @param permissionKey - The permission key to check
 * @returns boolean - Whether the permission is allowed
 */
export async function hasPermission(role: string, permissionKey: string): Promise<boolean> {
    await refreshCacheIfNeeded();

    // Super Admin always has all permissions
    if (role === 'SUPER_ADMIN') return true;

    const rolePerms = permissionsCache.get(role);
    if (!rolePerms) return true; // Default to allowed if not found

    return rolePerms.get(permissionKey) ?? true;
}

/**
 * Get all permissions for a role
 * @param role - User role
 */
export async function getRolePermissions(role: string): Promise<Permission[]> {
    const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('role', role);

    if (error) {
        console.error('Error fetching permissions:', error);
        return [];
    }
    return data || [];
}

// ===========================================
// PLATFORM CONFIGURATION
// ===========================================

/**
 * Get a platform configuration value
 * @param configKey - The configuration key
 * @param defaultValue - Default value if not found
 */
export async function getConfig(configKey: string, defaultValue: string = ''): Promise<string> {
    await refreshCacheIfNeeded();
    return platformConfigCache.get(configKey) ?? defaultValue;
}

/**
 * Get a platform configuration as a number
 * @param configKey - The configuration key
 * @param defaultValue - Default value if not found or invalid
 */
export async function getConfigNumber(configKey: string, defaultValue: number = 0): Promise<number> {
    const value = await getConfig(configKey, String(defaultValue));
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
}

/**
 * Get a platform configuration as a boolean
 * @param configKey - The configuration key
 * @param defaultValue - Default value if not found
 */
export async function getConfigBoolean(configKey: string, defaultValue: boolean = false): Promise<boolean> {
    const value = await getConfig(configKey, String(defaultValue));
    return value === 'true';
}

/**
 * Get multiple configurations at once
 * @param configKeys - Array of configuration keys
 */
export async function getConfigs(configKeys: string[]): Promise<Record<string, string>> {
    await refreshCacheIfNeeded();
    const result: Record<string, string> = {};
    configKeys.forEach(key => {
        result[key] = platformConfigCache.get(key) ?? '';
    });
    return result;
}

// ===========================================
// NAVIGATION
// ===========================================

export interface NavigationItem {
    id: string;
    label: string;
    url: string;
    is_visible: boolean;
    is_external: boolean;
    requires_auth: boolean;
    allowed_roles: string[];
    display_order: number;
}

/**
 * Get navigation menu items for a location
 * @param location - Menu location ('header', 'footer', 'mobile')
 */
export async function getNavigationMenu(location: string): Promise<NavigationItem[]> {
    const { data, error } = await supabase
        .from('navigation_menus')
        .select('*')
        .eq('menu_location', location)
        .eq('is_visible', true)
        .order('display_order', { ascending: true });

    if (error) {
        console.error('Error fetching navigation:', error);
        return [];
    }
    return data || [];
}

// ===========================================
// ANNOUNCEMENTS
// ===========================================

export interface Announcement {
    id: string;
    title: string;
    message: string;
    type: string;
    bg_color: string;
    text_color: string;
    link_url?: string;
    link_text?: string;
    is_dismissible: boolean;
}

/**
 * Get active announcements for a target audience
 * @param target - Target audience ('buyer', 'vendor', 'admin')
 */
export async function getActiveAnnouncements(target: string): Promise<Announcement[]> {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .contains('show_on', [target])
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .order('display_order', { ascending: true });

    if (error) {
        console.error('Error fetching announcements:', error);
        return [];
    }
    return data || [];
}

// ===========================================
// MAINTENANCE MODE
// ===========================================

/**
 * Check if the platform is in maintenance mode
 */
export async function isMaintenanceMode(): Promise<boolean> {
    return getConfigBoolean('maintenance_mode', false);
}

/**
 * Get maintenance message
 */
export async function getMaintenanceMessage(): Promise<string> {
    return getConfig('maintenance_message', 'We are currently performing scheduled maintenance. Please check back soon.');
}

// ===========================================
// CACHE MANAGEMENT
// ===========================================

async function refreshCacheIfNeeded(): Promise<void> {
    const now = Date.now();
    if (now - cacheTimestamp < CACHE_TTL) return;

    try {
        // Fetch feature flags
        const { data: flags } = await supabase
            .from('feature_flags')
            .select('feature_key, is_enabled');

        if (flags) {
            featureFlagsCache = new Map(flags.map(f => [f.feature_key, f.is_enabled]));
        }

        // Fetch platform configs
        const { data: configs } = await supabase
            .from('platform_config')
            .select('config_key, config_value');

        if (configs) {
            platformConfigCache = new Map(configs.map(c => [c.config_key, c.config_value]));
        }

        // Fetch permissions
        const { data: perms } = await supabase
            .from('role_permissions')
            .select('role, permission_key, is_allowed');

        if (perms) {
            permissionsCache = new Map();
            perms.forEach(p => {
                if (!permissionsCache.has(p.role)) {
                    permissionsCache.set(p.role, new Map());
                }
                permissionsCache.get(p.role)!.set(p.permission_key, p.is_allowed);
            });
        }

        cacheTimestamp = now;
    } catch (error) {
        console.error('Error refreshing access control cache:', error);
    }
}

/**
 * Force refresh the cache
 */
export async function refreshCache(): Promise<void> {
    cacheTimestamp = 0;
    await refreshCacheIfNeeded();
}

/**
 * Clear the cache
 */
export function clearCache(): void {
    featureFlagsCache.clear();
    platformConfigCache.clear();
    permissionsCache.clear();
    cacheTimestamp = 0;
}

// ===========================================
// CONVENIENCE EXPORTS
// ===========================================

export const AccessControl = {
    // Feature Flags
    isFeatureEnabled,
    getFeatureFlags,
    getFeatureFlagsByCategory,

    // Permissions
    hasPermission,
    getRolePermissions,

    // Configuration
    getConfig,
    getConfigNumber,
    getConfigBoolean,
    getConfigs,

    // Navigation
    getNavigationMenu,

    // Announcements
    getActiveAnnouncements,

    // Maintenance
    isMaintenanceMode,
    getMaintenanceMessage,

    // Cache
    refreshCache,
    clearCache,
};

export default AccessControl;
