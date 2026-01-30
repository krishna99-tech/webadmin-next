'use client';

import React, { useState, useEffect, useContext } from 'react';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import {
  Settings as SettingsIcon,
  Mail,
  Shield,
  Database,
  Save,
  Palette,
  Key,
  Activity,
  Trash2,
  RefreshCw,
  Zap,
  Globe,
  Lock,
  Cpu
} from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import useWebSocket from '@/hooks/useWebSocket';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('appearance');
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState('onyx');
  const [density, setDensity] = useState('comfortable');
  const { currentUser } = useContext(AuthContext);
  const { connected, latency } = useWebSocket();

  // Handle theme change locally (mock)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    alert('Administrative preferences synchronized across clusters.');
  };

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'api', label: 'API Management', icon: Key },
    { id: 'maintenance', label: 'Maintenance', icon: SettingsIcon },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'system', label: 'System', icon: Database },
  ];

  return (
    <div className="settings-page animate-fadeInUp">
      {/* Header */}
      <div className="settings-header">
        <h2 className="settings-title">
          <SettingsIcon className="icon-glow" />
          Settings Console
        </h2>
        <p className="settings-subtitle">
          Orchestrate platform-wide configurations and administrative protocols
        </p>
      </div>

      {/* Tabs */}
      <div className="settings-tabs !mb-8 !flex-wrap gap-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        {/* Main Content Pane */}
        <div className="lg:col-span-8">

          {/* APPEARANCE */}
          {activeTab === 'appearance' && (
            <Card className="animate-fadeIn">
              <h3 className="card-title flex items-center gap-2 mb-6">
                <Palette size={18} className="text-blue-400" />
                Interface Aesthetics
              </h3>

              <div className="space-y-8">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-dim mb-4 block">Visual Theme Dimension</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'onyx', label: 'Onyx Dark', class: 'theme-swatch-onyx' },
                      { id: 'deep-sea', label: 'Deep Sea', class: 'theme-swatch-sea' },
                      { id: 'emerald', label: 'Emerald City', class: 'theme-swatch-emerald' }
                    ].map(t => (
                      <div
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`theme-swatch ${t.class} ${theme === t.id ? 'active' : ''}`}
                      >
                        {theme === t.id && <Zap size={16} className="text-white icon-glow" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-dim mb-4 block">UI Density Control</label>
                  <div className="settings-toggle-group">
                    {['compact', 'comfortable', 'spacious'].map(d => (
                      <button
                        key={d}
                        onClick={() => setDensity(d)}
                        className={`settings-toggle-btn ${density === d ? 'active' : ''}`}
                      >
                        {d.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* SECURITY */}
          {activeTab === 'security' && (
            <Card className="animate-fadeIn">
              <h3 className="card-title flex items-center gap-2 mb-6">
                <Lock size={18} className="text-red-400" />
                Security Protocols
              </h3>

              <div className="settings-list">
                <div className="settings-row p-4 !bg-white/5 rounded-xl mb-4 border border-white/5">
                  <div>
                    <p className="settings-row-title">IP Access Restriction</p>
                    <p className="settings-row-desc">Limit admin access to specific network signatures</p>
                  </div>
                  <Input placeholder="192.168.1.0/24" className="!w-48 !mb-0" />
                </div>

                <div className="settings-row">
                  <div>
                    <p className="settings-row-title">Advanced Session Pinning</p>
                    <p className="settings-row-desc">Bind tokens to specific hardware IDs</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider" />
                  </label>
                </div>

                <div className="settings-row">
                  <div>
                    <p className="settings-row-title">Login Attempt Hardcap</p>
                    <p className="settings-row-desc">Auto-lock account after 5 failed pulses</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider" />
                  </label>
                </div>
              </div>
            </Card>
          )}

          {/* API MANAGEMENT */}
          {activeTab === 'api' && (
            <Card className="animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h3 className="card-title flex items-center gap-2">
                  <Key size={18} className="text-purple-400" />
                  Access Tokens
                </h3>
                <Button className="!py-1.5 !px-3 font-bold !text-[10px]">Generate New Key</Button>
              </div>

              <div className="settings-list space-y-4">
                <div className="p-4 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <Globe size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">External API v1</p>
                      <p className="text-[10px] text-dim font-mono">tnxt_live_49f...8a2</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-dim hover:text-white transition-colors"><RefreshCw size={14} /></button>
                    <button className="p-2 text-red-500/50 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* MAINTENANCE */}
          {activeTab === 'maintenance' && (
            <Card className="animate-fadeIn">
              <h3 className="card-title flex items-center gap-2 mb-6">
                <Activity size={18} className="text-green-400" />
                Advanced Maintenance
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 group hover:border-blue-500/30 transition-all cursor-pointer">
                  <RefreshCw size={24} className="text-blue-400 mb-3 group-hover:rotate-180 transition-transform duration-500" />
                  <p className="font-bold text-sm">Purge Redis Cache</p>
                  <p className="text-[10px] text-dim">Invalidate all system-level cache keys</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 group hover:border-purple-500/30 transition-all cursor-pointer">
                  <Database size={24} className="text-purple-400 mb-3" />
                  <p className="font-bold text-sm">Prune Audit Logs</p>
                  <p className="text-[10px] text-dim">Remove logs older than 90 cycles</p>
                </div>
              </div>
            </Card>
          )}

          {/* Legacy Tabs fallback */}
          {['email', 'system'].includes(activeTab) && (
            <Card className="opacity-60 grayscale-[0.5] animate-fadeIn">
              <div className="py-10 text-center">
                <Database size={32} className="mx-auto mb-4 text-dim" />
                <p className="text-sm font-bold">Legacy Protocol Interface</p>
                <p className="text-xs text-dim italic">This module is currently being migrated to the new core system.</p>
              </div>
            </Card>
          )}

        </div>

        {/* Sidebar Info Pane */}
        <div className="lg:col-span-4 space-y-6">
          <Card noPadding className="!bg-blue-500/5 border-blue-500/20 overflow-hidden">
            <div className="p-5 bg-blue-500/10 border-b border-blue-500/10">
              <h4 className="text-xs font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
                <Zap size={14} /> System Heartbeat
              </h4>
            </div>
            <div className="p-5 space-y-4">
              <div className="settings-metric-card">
                <span className="settings-metric-label">Network Latency</span>
                <span className="settings-metric-value">{latency || '14'} ms</span>
              </div>
              <div className="settings-metric-card">
                <span className="settings-metric-label">WebSocket State</span>
                <span className={`settings-metric-value ${connected ? 'text-green-400' : 'text-red-400'}`}>
                  {connected ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>
              <div className="settings-metric-card">
                <span className="settings-metric-label">Cluster Load</span>
                <span className="settings-metric-value">12.4%</span>
              </div>
            </div>
          </Card>

          <Card className="border-white/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-blue-400 shadow-inner">
                <Cpu size={24} className="icon-glow" />
              </div>
              <div>
                <p className="text-xs font-bold">Kernel v{process.env.NEXT_PUBLIC_VERSION || '1.2.4-BETA'}</p>
                <p className="text-[10px] text-dim uppercase tracking-tighter">ThingsNXT Core Engine</p>
              </div>
            </div>
            <p className="text-[10px] text-dim leading-relaxed">
              Platform identity: adm_0x{currentUser?.id?.slice(-8) || 'root_sys_04'}
            </p>
          </Card>
        </div>
      </div>

      {/* SAVE ACTION */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          onClick={handleSave}
          loading={saving}
          className="btn-broadcast-premium shadow-primary scale-110 !px-8"
        >
          <Save size={18} />
          Synchronize Configuration
        </Button>
      </div>
    </div>
  );
}
