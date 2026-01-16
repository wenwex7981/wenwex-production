'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Settings, ToggleLeft, ToggleRight, Key, Users, Lock,
    ChevronRight, Search, Loader2, Save, AlertTriangle, Check,
    RefreshCw, Eye, EyeOff, Zap, Globe, MessageSquare, CreditCard,
    UserCheck, FileText, Bell, Menu, Megaphone, History, Filter,
    ChevronDown, Info, ShieldCheck, Database, Server
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getSupabaseClient } from '@/lib/supabase';

const supabase = getSupabaseClient();

// Tab configuration
const tabs = [
    { id: 'features', name: 'Feature Flags', icon: Zap, description: 'Enable/disable platform features' },
    { id: 'permissions', name: 'Role Permissions', icon: Lock, description: 'Control role-based access' },
    { id: 'config', name: 'Platform Config', icon: Settings, description: 'System-wide settings' },
    { id: 'navigation', name: 'Navigation', icon: Menu, description: 'Manage menu items' },
    { id: 'announcements', name: 'Announcements', icon: Megaphone, description: 'Site-wide banners' },
    { id: 'audit', name: 'Audit Log', icon: History, description: 'Track admin actions' },
];

// Category icons for feature flags
const categoryIcons: Record<string, any> = {
    auth: UserCheck,
    services: FileText,
    messaging: MessageSquare,
    payments: CreditCard,
    general: Globe,
};

// Role colors
const roleColors: Record<string, string> = {
    BUYER: 'from-blue-500 to-cyan-500',
    VENDOR: 'from-purple-500 to-pink-500',
    SUPER_ADMIN: 'from-amber-500 to-orange-500',
};

interface FeatureFlag {
    id: string;
    feature_key: string;
    feature_name: string;
    description: string;
    is_enabled: boolean;
    applies_to: string;
    category: string;
    config: any;
}

interface RolePermission {
    id: string;
    role: string;
    permission_key: string;
    permission_name: string;
    description: string;
    is_allowed: boolean;
}

interface PlatformConfig {
    id: string;
    config_key: string;
    config_value: string;
    config_type: string;
    category: string;
    label: string;
    description: string;
    is_sensitive: boolean;
}

interface NavigationMenu {
    id: string;
    menu_location: string;
    label: string;
    url: string;
    is_visible: boolean;
    display_order: number;
}

interface Announcement {
    id: string;
    title: string;
    message: string;
    type: string;
    is_active: boolean;
    bg_color: string;
    text_color: string;
    starts_at: string;
    ends_at: string;
}

interface AuditLog {
    id: string;
    admin_email: string;
    action: string;
    entity_type: string;
    entity_id: string;
    created_at: string;
}

export default function AccessControlPage() {
    const [activeTab, setActiveTab] = useState('features');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedRole, setSelectedRole] = useState('all');

    // Data states
    const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
    const [permissions, setPermissions] = useState<RolePermission[]>([]);
    const [platformConfigs, setPlatformConfigs] = useState<PlatformConfig[]>([]);
    const [navigationMenus, setNavigationMenus] = useState<NavigationMenu[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

    // Modified configs to track
    const [modifiedItems, setModifiedItems] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            switch (activeTab) {
                case 'features':
                    const { data: flags } = await supabase.from('feature_flags').select('*').order('category');
                    setFeatureFlags(flags || []);
                    break;
                case 'permissions':
                    const { data: perms } = await supabase.from('role_permissions').select('*').order('role');
                    setPermissions(perms || []);
                    break;
                case 'config':
                    const { data: configs } = await supabase.from('platform_config').select('*').order('category');
                    setPlatformConfigs(configs || []);
                    break;
                case 'navigation':
                    const { data: navs } = await supabase.from('navigation_menus').select('*').order('display_order');
                    setNavigationMenus(navs || []);
                    break;
                case 'announcements':
                    const { data: anns } = await supabase.from('announcements').select('*').order('display_order');
                    setAnnouncements(anns || []);
                    break;
                case 'audit':
                    const { data: logs } = await supabase.from('admin_audit_log').select('*').order('created_at', { ascending: false }).limit(100);
                    setAuditLogs(logs || []);
                    break;
            }
        } catch (error: any) {
            console.error('Failed to load data:', error);
            toast.error('Failed to load data. Make sure to run the SQL script first.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleFeatureFlag = async (flag: FeatureFlag) => {
        try {
            const { error } = await supabase
                .from('feature_flags')
                .update({ is_enabled: !flag.is_enabled, updated_at: new Date().toISOString() })
                .eq('id', flag.id);

            if (error) throw error;

            setFeatureFlags(prev => prev.map(f =>
                f.id === flag.id ? { ...f, is_enabled: !f.is_enabled } : f
            ));

            // Log the action
            await logAction('toggle_feature_flag', 'feature_flag', flag.id, flag.feature_name);

            toast.success(`${flag.feature_name} ${!flag.is_enabled ? 'enabled' : 'disabled'}`);
        } catch (error: any) {
            toast.error('Failed to update: ' + error.message);
        }
    };

    const togglePermission = async (perm: RolePermission) => {
        try {
            const { error } = await supabase
                .from('role_permissions')
                .update({ is_allowed: !perm.is_allowed, updated_at: new Date().toISOString() })
                .eq('id', perm.id);

            if (error) throw error;

            setPermissions(prev => prev.map(p =>
                p.id === perm.id ? { ...p, is_allowed: !p.is_allowed } : p
            ));

            await logAction('toggle_permission', 'role_permission', perm.id, `${perm.role} - ${perm.permission_name}`);

            toast.success(`Permission ${!perm.is_allowed ? 'granted' : 'revoked'} for ${perm.role}`);
        } catch (error: any) {
            toast.error('Failed to update: ' + error.message);
        }
    };

    const updateConfig = async (config: PlatformConfig, newValue: string) => {
        setPlatformConfigs(prev => prev.map(c =>
            c.id === config.id ? { ...c, config_value: newValue } : c
        ));
        setModifiedItems(prev => new Set(prev).add(config.id));
    };

    const saveAllConfigs = async () => {
        setIsSaving(true);
        try {
            const modified = platformConfigs.filter(c => modifiedItems.has(c.id));

            for (const config of modified) {
                const { error } = await supabase
                    .from('platform_config')
                    .update({ config_value: config.config_value, updated_at: new Date().toISOString() })
                    .eq('id', config.id);

                if (error) throw error;

                await logAction('update_config', 'platform_config', config.id, config.config_key);
            }

            setModifiedItems(new Set());
            toast.success('All configurations saved!');
        } catch (error: any) {
            toast.error('Failed to save: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const logAction = async (action: string, entityType: string, entityId: string, details?: string) => {
        try {
            await supabase.from('admin_audit_log').insert({
                admin_id: '00000000-0000-0000-0000-000000000000', // Replace with actual admin ID
                admin_email: 'admin@wenvex.online', // Replace with actual email
                action,
                entity_type: entityType,
                entity_id: entityId,
                new_value: { details }
            });
        } catch (error) {
            console.error('Failed to log action:', error);
        }
    };

    const filteredFeatures = featureFlags.filter(f => {
        const matchesSearch = f.feature_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const filteredPermissions = permissions.filter(p => {
        const matchesSearch = p.permission_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = selectedRole === 'all' || p.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    const groupedConfigs = platformConfigs.reduce((acc, config) => {
        const cat = config.category || 'general';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(config);
        return acc;
    }, {} as Record<string, PlatformConfig[]>);

    const featureCategories = [...new Set(featureFlags.map(f => f.category))];

    return (
        <div className="p-6 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                        <Shield className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Access Control Center</h1>
                        <p className="text-gray-400">Manage all platform access without touching code</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={loadData}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:border-gray-600 transition-all"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                    {activeTab === 'config' && modifiedItems.size > 0 && (
                        <button
                            onClick={saveAllConfigs}
                            disabled={isSaving}
                            className="btn-primary gap-2"
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Save {modifiedItems.size} Changes
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 p-2 bg-gray-900/50 rounded-2xl border border-gray-800">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            setSearchQuery('');
                            setSelectedCategory('all');
                        }}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* Search and Filters */}
            {(activeTab === 'features' || activeTab === 'permissions') && (
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex-1 min-w-[250px] relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="input w-full pl-12"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {activeTab === 'features' && (
                        <select
                            className="input w-48"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            {featureCategories.map(cat => (
                                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                            ))}
                        </select>
                    )}
                    {activeTab === 'permissions' && (
                        <select
                            className="input w-48"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            <option value="BUYER">Buyer</option>
                            <option value="VENDOR">Vendor</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                    )}
                </div>
            )}

            {/* Content */}
            {isLoading ? (
                <div className="card py-20 text-center">
                    <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading access control settings...</p>
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    {/* Feature Flags Tab */}
                    {activeTab === 'features' && (
                        <motion.div
                            key="features"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                        >
                            {filteredFeatures.length === 0 ? (
                                <div className="col-span-full card py-16 text-center">
                                    <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-white mb-2">No Feature Flags Found</h3>
                                    <p className="text-gray-400">Run the PLATFORM_ACCESS_CONTROL.sql script first</p>
                                </div>
                            ) : (
                                filteredFeatures.map((flag, index) => {
                                    const CategoryIcon = categoryIcons[flag.category] || Globe;
                                    return (
                                        <motion.div
                                            key={flag.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="card p-5 hover:border-gray-600 transition-all"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${flag.is_enabled ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-500'
                                                        }`}>
                                                        <CategoryIcon className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-white text-sm">{flag.feature_name}</h3>
                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{flag.description}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                                                                {flag.category}
                                                            </span>
                                                            <span className="w-1 h-1 rounded-full bg-gray-700" />
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                                                                {flag.applies_to}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => toggleFeatureFlag(flag)}
                                                    className={`flex-shrink-0 w-14 h-8 rounded-full p-1 transition-all ${flag.is_enabled
                                                            ? 'bg-green-500'
                                                            : 'bg-gray-700'
                                                        }`}
                                                >
                                                    <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${flag.is_enabled ? 'translate-x-6' : 'translate-x-0'
                                                        }`} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </motion.div>
                    )}

                    {/* Role Permissions Tab */}
                    {activeTab === 'permissions' && (
                        <motion.div
                            key="permissions"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {['BUYER', 'VENDOR', 'SUPER_ADMIN'].filter(role => selectedRole === 'all' || selectedRole === role).map(role => {
                                const rolePerms = filteredPermissions.filter(p => p.role === role);
                                if (rolePerms.length === 0) return null;

                                return (
                                    <div key={role} className="mb-8">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColors[role]} flex items-center justify-center text-white shadow-lg`}>
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-white">{role.replace('_', ' ')}</h2>
                                                <p className="text-xs text-gray-500">{rolePerms.length} permissions</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {rolePerms.map((perm, index) => (
                                                <motion.div
                                                    key={perm.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.02 }}
                                                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${perm.is_allowed
                                                            ? 'bg-green-500/5 border-green-500/20'
                                                            : 'bg-gray-800/50 border-gray-700'
                                                        }`}
                                                >
                                                    <div>
                                                        <h4 className="font-medium text-white text-sm">{perm.permission_name}</h4>
                                                        <p className="text-xs text-gray-500">{perm.description}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => togglePermission(perm)}
                                                        disabled={role === 'SUPER_ADMIN'}
                                                        className={`flex-shrink-0 ${role === 'SUPER_ADMIN' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {perm.is_allowed ? (
                                                            <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center">
                                                                <Check className="w-4 h-4" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                                                                <Lock className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}

                    {/* Platform Config Tab */}
                    {activeTab === 'config' && (
                        <motion.div
                            key="config"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            {Object.entries(groupedConfigs).map(([category, configs]) => (
                                <div key={category} className="card p-6">
                                    <h3 className="text-lg font-bold text-white mb-4 capitalize flex items-center gap-2">
                                        <Database className="w-5 h-5 text-primary-400" />
                                        {category} Settings
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {configs.map(config => (
                                            <div key={config.id} className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                    {config.label}
                                                    {config.is_sensitive && <EyeOff className="w-3 h-3" />}
                                                    {modifiedItems.has(config.id) && (
                                                        <span className="text-amber-400 text-[10px] font-normal">Modified</span>
                                                    )}
                                                </label>
                                                {config.config_type === 'boolean' ? (
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => updateConfig(config, config.config_value === 'true' ? 'false' : 'true')}
                                                            className={`w-14 h-8 rounded-full p-1 transition-all ${config.config_value === 'true'
                                                                    ? 'bg-green-500'
                                                                    : 'bg-gray-700'
                                                                }`}
                                                        >
                                                            <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${config.config_value === 'true' ? 'translate-x-6' : 'translate-x-0'
                                                                }`} />
                                                        </button>
                                                        <span className="text-sm text-gray-400">
                                                            {config.config_value === 'true' ? 'Enabled' : 'Disabled'}
                                                        </span>
                                                    </div>
                                                ) : config.config_type === 'number' ? (
                                                    <input
                                                        type="number"
                                                        className="input w-full"
                                                        value={config.config_value || ''}
                                                        onChange={(e) => updateConfig(config, e.target.value)}
                                                    />
                                                ) : (
                                                    <input
                                                        type={config.is_sensitive ? 'password' : 'text'}
                                                        className="input w-full"
                                                        value={config.config_value || ''}
                                                        onChange={(e) => updateConfig(config, e.target.value)}
                                                    />
                                                )}
                                                {config.description && (
                                                    <p className="text-xs text-gray-600">{config.description}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {Object.keys(groupedConfigs).length === 0 && (
                                <div className="card py-16 text-center">
                                    <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-white mb-2">No Configurations Found</h3>
                                    <p className="text-gray-400">Run the PLATFORM_ACCESS_CONTROL.sql script first</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Navigation Tab */}
                    {activeTab === 'navigation' && (
                        <motion.div
                            key="navigation"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                        >
                            {['header', 'footer'].map(location => {
                                const items = navigationMenus.filter(n => n.menu_location === location);
                                return (
                                    <div key={location} className="card p-6">
                                        <h3 className="text-lg font-bold text-white mb-4 capitalize flex items-center gap-2">
                                            <Menu className="w-5 h-5 text-primary-400" />
                                            {location} Navigation
                                        </h3>
                                        <div className="space-y-2">
                                            {items.map((item, index) => (
                                                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 border border-gray-700">
                                                    <span className="text-xs text-gray-500 font-mono">{index + 1}</span>
                                                    <input
                                                        type="text"
                                                        className="input flex-1"
                                                        value={item.label}
                                                        onChange={(e) => {
                                                            setNavigationMenus(prev => prev.map(n =>
                                                                n.id === item.id ? { ...n, label: e.target.value } : n
                                                            ));
                                                        }}
                                                    />
                                                    <input
                                                        type="text"
                                                        className="input flex-1"
                                                        value={item.url}
                                                        placeholder="/path"
                                                        onChange={(e) => {
                                                            setNavigationMenus(prev => prev.map(n =>
                                                                n.id === item.id ? { ...n, url: e.target.value } : n
                                                            ));
                                                        }}
                                                    />
                                                    <button
                                                        onClick={async () => {
                                                            await supabase
                                                                .from('navigation_menus')
                                                                .update({ is_visible: !item.is_visible })
                                                                .eq('id', item.id);
                                                            setNavigationMenus(prev => prev.map(n =>
                                                                n.id === item.id ? { ...n, is_visible: !n.is_visible } : n
                                                            ));
                                                        }}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.is_visible ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'
                                                            }`}
                                                    >
                                                        {item.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}

                    {/* Announcements Tab */}
                    {activeTab === 'announcements' && (
                        <motion.div
                            key="announcements"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            <div className="card p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Megaphone className="w-5 h-5 text-primary-400" />
                                    Create New Announcement
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">Site-wide banners that appear at the top of the page</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="text" className="input" placeholder="Announcement Title" />
                                    <select className="input">
                                        <option value="info">Info (Blue)</option>
                                        <option value="success">Success (Green)</option>
                                        <option value="warning">Warning (Yellow)</option>
                                        <option value="error">Error (Red)</option>
                                    </select>
                                </div>
                                <textarea className="input w-full mt-4" rows={3} placeholder="Announcement message..." />
                                <button className="btn-primary mt-4">Create Announcement</button>
                            </div>

                            {announcements.map(ann => (
                                <div key={ann.id} className="card p-4 flex items-center gap-4"
                                    style={{ borderLeftWidth: 4, borderLeftColor: ann.bg_color }}>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white">{ann.title}</h4>
                                        <p className="text-sm text-gray-400">{ann.message}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${ann.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'
                                        }`}>
                                        {ann.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {/* Audit Log Tab */}
                    {activeTab === 'audit' && (
                        <motion.div
                            key="audit"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="card overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-800">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <History className="w-5 h-5 text-primary-400" />
                                    Admin Activity Log
                                </h3>
                                <p className="text-gray-400 text-sm">Track all administrative actions</p>
                            </div>
                            <div className="divide-y divide-gray-800">
                                {auditLogs.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <History className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                        <p className="text-gray-400">No activity logs yet</p>
                                    </div>
                                ) : (
                                    auditLogs.map(log => (
                                        <div key={log.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-800/50">
                                            <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center">
                                                <ShieldCheck className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-white">{log.action}</span>
                                                    <span className="text-xs text-gray-500">on {log.entity_type}</span>
                                                </div>
                                                <p className="text-sm text-gray-500">{log.admin_email}</p>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(log.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* Info Banner */}
            <div className="mt-8 p-4 bg-primary-500/10 border border-primary-500/20 rounded-2xl flex items-start gap-4">
                <Info className="w-6 h-6 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold text-white">Complete Access Control</h4>
                    <p className="text-sm text-gray-400 mt-1">
                        All changes made here are applied immediately across the platform. Feature flags, permissions,
                        and configurations control buyer, vendor, and admin experiences without requiring code changes.
                    </p>
                </div>
            </div>
        </div>
    );
}
