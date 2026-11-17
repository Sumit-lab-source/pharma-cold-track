// Pharma Cold Track - Settings Page
// Application settings, user preferences, and system configuration

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Key,
  Database,
  Server,
  Mail,
  Phone,
  Save,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Trash2,
  Download,
  Upload,
  Cpu,
  HardDrive,
  Wifi,
  Zap,
  Layers,
  Sun,
  Moon,
} from 'lucide-react';
import clsx from 'clsx';
import { UserRole } from '../types';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'api', label: 'API & Integrations', icon: Server },
  { id: 'system', label: 'System', icon: Cpu },
];

export default function Settings() {
  const { user, updatePreferences, logout } = useAuth();
  const { connectionStatus } = useData();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  interface SettingsFormData {
    name: string;
    email: string;
    phone: string;
    timezone: string;
    language: string;
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    excursionAlerts: boolean;
    dailySummary: boolean;
    weeklyReport: boolean;
    theme: 'light' | 'dark' | 'system';
    temperatureUnit: 'C' | 'F';
    mapStyle: 'standard' | 'satellite' | 'dark';
    autoRefresh: number;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    mfaEnabled: boolean;
    sessionTimeout: number;
    apiKey: string;
    webhookUrl: string;
    webhookEvents: string[];
    logLevel: string;
    dataRetention: string;
    backupFrequency: string;
  }

  const [formData, setFormData] = useState<SettingsFormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    timezone: 'America/New_York',
    language: 'en',
    emailEnabled: user?.preferences.notifications.email ?? true,
    smsEnabled: user?.preferences.notifications.sms ?? true,
    pushEnabled: user?.preferences.notifications.push ?? true,
    excursionAlerts: user?.preferences.notifications.excursion_alerts ?? true,
    dailySummary: user?.preferences.notifications.daily_summary ?? true,
    weeklyReport: user?.preferences.notifications.weekly_report ?? false,
    theme: user?.preferences.theme || 'system',
    temperatureUnit: user?.preferences.temperature_unit || 'C',
    mapStyle: user?.preferences.map_style || 'standard',
    autoRefresh: user?.preferences.auto_refresh_interval || 30,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    mfaEnabled: user?.mfa_enabled ?? false,
    sessionTimeout: 60,
    apiKey: 'phct_live_7x89_4k21_90ab_9234',
    webhookUrl: '',
    webhookEvents: ['excursion_created', 'excursion_resolved', 'shipment_delivered'],
    logLevel: 'info',
    dataRetention: '10',
    backupFrequency: 'daily',
  });

  const handleChange = <K extends keyof SettingsFormData>(key: K, value: SettingsFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePreferences({
        theme: formData.theme,
        temperature_unit: formData.temperatureUnit,
        notifications: {
          email: formData.emailEnabled,
          sms: formData.smsEnabled,
          push: formData.pushEnabled,
          excursion_alerts: formData.excursionAlerts,
          daily_summary: formData.dailySummary,
          weekly_report: formData.weeklyReport,
        },
        map_style: formData.mapStyle,
        auto_refresh_interval: formData.autoRefresh,
      });

      await new Promise(resolve => setTimeout(resolve, 600));
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-5 max-w-3xl">
      <div className="bg-[#0a0e17] rounded-xl border border-white/[0.06] p-6">
        <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
          <User className="w-4 h-4 text-teal-400" />
          Profile Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2 flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
            <div className="w-14 h-14 rounded-xl gradient-brand flex items-center justify-center font-bold text-white text-lg shadow-md shadow-teal-500/20">
              {formData.name.charAt(0) || 'D'}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">{formData.name}</h4>
              <p className="text-slate-400">{formData.email}</p>
              <span className="inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                {user?.role?.replace('_', ' ') || 'Operations Manager'}
              </span>
            </div>
          </div>
          <div>
            <label className="block font-medium text-slate-400 mb-1.5">Full Name</label>
            <input type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full px-3.5 py-2 border border-white/[0.08] rounded-lg bg-white/[0.03] text-white focus:ring-2 focus:ring-teal-500/40" />
          </div>
          <div>
            <label className="block font-medium text-slate-400 mb-1.5">Email Address</label>
            <input type="email" value={formData.email} disabled className="w-full px-3.5 py-2 border border-white/[0.06] rounded-lg bg-white/[0.01] text-slate-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="block font-medium text-slate-400 mb-1.5">Phone Number</label>
            <input type="tel" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} className="w-full px-3.5 py-2 border border-white/[0.08] rounded-lg bg-white/[0.03] text-white focus:ring-2 focus:ring-teal-500/40" placeholder="+1 (555) 000-0000" />
          </div>
          <div>
            <label className="block font-medium text-slate-400 mb-1.5">Timezone</label>
            <select value={formData.timezone} onChange={(e) => handleChange('timezone', e.target.value)} className="w-full px-3.5 py-2 border border-white/[0.08] rounded-lg bg-white/[0.03] text-white focus:ring-2 focus:ring-teal-500/40">
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT/BST)</option>
              <option value="Europe/Paris">Paris (CET/CEST)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-[#0a0e17] rounded-xl border border-white/[0.06] p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-400" />
          GxP Role Permissions &amp; Entitlements
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {[
            { perm: 'View Dashboard', desc: 'Real-time telemetry & metrics' },
            { perm: 'Manage Fleet', desc: 'Vehicle positioning & status' },
            { perm: 'Manage Shipments', desc: 'Creation, tracking, dispatch' },
            { perm: 'Handle Excursions', desc: 'Breach review & sign-off' },
            { perm: 'Generate Reports', desc: 'PDF compliance dossier export' },
            { perm: 'Audit Trails', desc: 'Immutable 21 CFR Part 11 log' },
          ].map(p => (
            <div key={p.perm} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.04] rounded-lg">
              <div>
                <p className="font-medium text-white">{p.perm}</p>
                <p className="text-[10px] text-slate-500">{p.desc}</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                Active
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-5 max-w-3xl">
      <div className="bg-[#0a0e17] rounded-xl border border-white/[0.06] p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-teal-400" />
          Alert Channels
        </h3>
        <div className="space-y-3">
          {[
            { key: 'emailEnabled' as const, label: 'Email Notifications', desc: 'Critical alerts & digests sent to registered email', icon: Mail },
            { key: 'smsEnabled' as const, label: 'SMS Notifications', desc: 'High-priority S1 Critical breach alerts via SMS', icon: Phone },
            { key: 'pushEnabled' as const, label: 'In-App Web Push', desc: 'Browser notifications for immediate operator intervention', icon: Bell },
          ].map(item => (
            <label key={item.key} className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-xl cursor-pointer hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs font-medium text-white">{item.label}</p>
                  <p className="text-[11px] text-slate-500">{item.desc}</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData[item.key]}
                onChange={(e) => handleChange(item.key, e.target.checked)}
                className="w-4 h-4 text-teal-500 rounded bg-white/5 border-white/10 focus:ring-teal-500"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="bg-[#0a0e17] rounded-xl border border-white/[0.06] p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-teal-400" />
          Event Subscriptions
        </h3>
        <div className="space-y-3">
          {[
            { key: 'excursionAlerts' as const, label: 'Temperature Excursions', desc: 'Instant warning for S1/S2/S3 thermal breaches' },
            { key: 'dailySummary' as const, label: 'Daily Operations Digest', desc: 'End-of-day summary of fleet operations & compliance status' },
            { key: 'weeklyReport' as const, label: 'Weekly Quality Audit Pack', desc: 'Summarized validation pack for QA and auditors' },
          ].map(item => (
            <label key={item.key} className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-xl cursor-pointer hover:bg-white/[0.04] transition-colors">
              <div>
                <p className="text-xs font-medium text-white">{item.label}</p>
                <p className="text-[11px] text-slate-500">{item.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={formData[item.key]}
                onChange={(e) => handleChange(item.key, e.target.checked)}
                className="w-4 h-4 text-teal-500 rounded bg-white/5 border-white/10 focus:ring-teal-500"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-5 max-w-3xl">
      <div className="bg-[#0a0e17] rounded-xl border border-white/[0.06] p-6">
        <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
          <Palette className="w-4 h-4 text-teal-400" />
          Visual Theme &amp; Display
        </h3>
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2.5">Theme Selection</label>
            <div className="grid grid-cols-3 gap-3">
              {(['dark', 'light', 'system'] as const).map(theme => (
                <label key={theme} className={clsx(
                  'p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col items-center gap-2',
                  formData.theme === theme ? 'border-teal-500/50 bg-teal-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]'
                )}>
                  <input type="radio" name="theme" value={theme} checked={formData.theme === theme} onChange={(e) => handleChange('theme', e.target.value as any)} className="sr-only" />
                  {theme === 'dark' && <Moon className="w-5 h-5 text-teal-400" />}
                  {theme === 'light' && <Sun className="w-5 h-5 text-amber-400" />}
                  {theme === 'system' && <Layers className="w-5 h-5 text-slate-400" />}
                  <span className="text-xs font-semibold capitalize text-white">{theme}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-400 mb-1.5">Temperature Metric</label>
              <select value={formData.temperatureUnit} onChange={(e) => handleChange('temperatureUnit', e.target.value as any)} className="w-full px-3.5 py-2 border border-white/[0.08] rounded-lg bg-white/[0.03] text-white">
                <option value="C">Celsius (°C) [Standard]</option>
                <option value="F">Fahrenheit (°F)</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-400 mb-1.5">Map Display Style</label>
              <select value={formData.mapStyle} onChange={(e) => handleChange('mapStyle', e.target.value as any)} className="w-full px-3.5 py-2 border border-white/[0.08] rounded-lg bg-white/[0.03] text-white">
                <option value="dark">Dark Matter (Recommended)</option>
                <option value="standard">Standard Carto</option>
                <option value="satellite">Satellite Hybrid</option>
              </select>
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-medium text-slate-400 mb-1.5">Live Telemetry Refresh Interval</label>
            <select value={formData.autoRefresh} onChange={(e) => handleChange('autoRefresh', parseInt(e.target.value))} className="w-full sm:w-48 px-3.5 py-2 border border-white/[0.08] rounded-lg bg-white/[0.03] text-white">
              <option value="15">15 seconds (High Frequency)</option>
              <option value="30">30 seconds (Default)</option>
              <option value="60">1 minute</option>
              <option value="300">5 minutes</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-5 max-w-3xl">
      <div className="bg-[#0a0e17] rounded-xl border border-white/[0.06] p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Key className="w-4 h-4 text-teal-400" />
          Authentication &amp; Session Security
        </h3>
        <div className="space-y-5">
          <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Multi-Factor Authentication (MFA)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Required for GxP electronic signature authority</p>
            </div>
            <input
              type="checkbox"
              checked={formData.mfaEnabled}
              onChange={(e) => handleChange('mfaEnabled', e.target.checked)}
              className="w-4 h-4 text-teal-500 rounded bg-white/5 border-white/10 focus:ring-teal-500"
            />
          </div>

          <div className="border-t border-white/[0.06] pt-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Update Password</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => handleChange('currentPassword', e.target.value)}
                    className="w-full px-3.5 py-2 pr-10 border border-white/[0.08] rounded-lg bg-white/[0.03] text-white"
                    placeholder="Enter current password"
                  />
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                    {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">New Password</label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => handleChange('newPassword', e.target.value)}
                  className="w-full px-3.5 py-2 border border-white/[0.08] rounded-lg bg-white/[0.03] text-white"
                  placeholder="Min 8 chars, 1 number, 1 symbol"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Confirm Password</label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className="w-full px-3.5 py-2 border border-white/[0.08] rounded-lg bg-white/[0.03] text-white"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0a0e17] rounded-xl border border-rose-500/20 p-5">
        <h3 className="text-xs font-semibold text-rose-400 mb-2 flex items-center gap-1.5">
          <Trash2 className="w-4 h-4" /> Danger Zone
        </h3>
        <p className="text-xs text-slate-400 mb-3">Permanent decommission of this user account and its signing keys.</p>
        <button className="px-3.5 py-1.5 text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg transition-colors">
          Decommission Account
        </button>
      </div>
    </div>
  );

  const renderApiTab = () => (
    <div className="space-y-5 max-w-3xl">
      <div className="bg-[#0a0e17] rounded-xl border border-white/[0.06] p-6 text-xs">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Server className="w-4 h-4 text-teal-400" /> API Authentication
        </h3>
        <div>
          <label className="block text-slate-400 mb-1.5 font-medium">Production API Token</label>
          <div className="flex gap-2">
            <input type="text" value={formData.apiKey} readOnly className="flex-1 px-3.5 py-2 font-mono border border-white/[0.08] rounded-lg bg-white/[0.02] text-teal-400" />
            <button onClick={() => alert('API Key copied to clipboard')} className="px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white rounded-lg font-medium">Copy</button>
            <button onClick={() => alert('Token regenerated')} className="px-3.5 py-2 gradient-brand text-white rounded-lg font-medium">Regenerate</button>
          </div>
        </div>
      </div>

      <div className="bg-[#0a0e17] rounded-xl border border-white/[0.06] p-6 text-xs">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-teal-400" /> Webhook Integration
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Endpoint URL</label>
            <input type="url" value={formData.webhookUrl} onChange={(e) => handleChange('webhookUrl', e.target.value)} placeholder="https://api.yourorganization.com/pharma/telemetry" className="w-full px-3.5 py-2 border border-white/[0.08] rounded-lg bg-white/[0.03] text-white" />
          </div>
          <div>
            <label className="block text-slate-400 mb-2 font-medium">Event Triggers</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
              {['excursion_created', 'excursion_resolved', 'shipment_delivered', 'device_offline'].map(evt => (
                <label key={evt} className="flex items-center gap-2 p-2.5 bg-white/[0.02] rounded-lg border border-white/[0.04] cursor-pointer">
                  <input type="checkbox" checked={formData.webhookEvents.includes(evt)} onChange={(e) => handleChange('webhookEvents', e.target.checked ? [...formData.webhookEvents, evt] : formData.webhookEvents.filter(x => x !== evt))} className="w-3.5 h-3.5 text-teal-500 rounded bg-white/5 border-white/10" />
                  <span className="text-slate-300">{evt}</span>
                </label>
              ))}
            </div>
          </div>
          <button onClick={() => alert('Webhook test ping sent')} className="px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white rounded-lg font-medium">Send Test Ping</button>
        </div>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-5 max-w-3xl">
      <div className="bg-[#0a0e17] rounded-xl border border-white/[0.06] p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-teal-400" /> Infrastructure Node Status
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {[
            { name: 'Telemetry Broker', status: 'Healthy', val: 'MQTT 8883 (TLS)' },
            { name: 'GraphQL Engine', status: 'Healthy', val: '42ms avg ping' },
            { name: 'GxP Audit Vault', status: 'Active', val: 'WORM Immutable' },
            { name: 'Storage Replicas', status: 'Synced', val: '3 AZ redundancy' },
          ].map(node => (
            <div key={node.name} className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mb-1.5" />
              <p className="font-semibold text-white">{node.name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{node.val}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#0a0e17] rounded-xl border border-white/[0.06] p-6 text-xs">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Download className="w-4 h-4 text-teal-400" /> Regulatory Export
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <button className="px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white rounded-lg font-medium flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Full Audit Trail (.CSV)
          </button>
          <button className="px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white rounded-lg font-medium flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Excursion Signatures (.PDF)
          </button>
        </div>
      </div>
    </div>
  );

  const renderTab = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab();
      case 'notifications': return renderNotificationsTab();
      case 'appearance': return renderAppearanceTab();
      case 'security': return renderSecurityTab();
      case 'api': return renderApiTab();
      case 'system': return renderSystemTab();
      default: return renderProfileTab();
    }
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0f1419] p-5 rounded-2xl border border-white/[0.06]">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">System Configuration &amp; Preferences</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage operator security, notification thresholds, and API keys</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 gradient-brand text-white rounded-xl text-xs font-semibold shadow-lg shadow-teal-600/15 hover:opacity-90 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-[#0f1419] rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="border-b border-white/[0.06] px-2">
          <nav className="flex -mb-px overflow-x-auto" aria-label="Settings tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-2 px-5 py-3.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors',
                  activeTab === tab.id
                    ? 'border-teal-400 text-teal-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {renderTab()}
        </div>
      </div>
    </div>
  );
}
