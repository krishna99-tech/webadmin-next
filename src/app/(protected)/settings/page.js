'use client';


import React, { useState } from 'react';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import {
  Settings as SettingsIcon,
  Mail,
  Shield,
  Database,
  Save
} from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('email');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    alert('Settings saved successfully!');
  };

  return (
    <div className="settings-page animate-fadeInUp">
      {/* Header */}
      <div className="settings-header">
        <h2 className="settings-title">
          <SettingsIcon />
          System Settings
        </h2>
        <p className="settings-subtitle">
          Configure system preferences and options
        </p>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        <button
          onClick={() => setActiveTab('email')}
          className={`settings-tab ${activeTab === 'email' ? 'active' : ''}`}
        >
          <Mail size={16} />
          Email
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
        >
          <Shield size={16} />
          Security
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`settings-tab ${activeTab === 'system' ? 'active' : ''}`}
        >
          <Database size={16} />
          System
        </button>
      </div>

      {/* EMAIL */}
      {activeTab === 'email' && (
        <Card>
          <h3 className="card-title">Email Configuration</h3>

          <div className="settings-form">
            <Input label="SMTP Host" placeholder="smtp.gmail.com" disabled />
            <Input label="SMTP Port" type="number" placeholder="587" disabled />
            <Input
              label="From Email"
              type="email"
              placeholder="noreply@thingsnxt.com"
              disabled
            />

            <div className="settings-info">
              <strong>Note:</strong> Email settings are managed through backend
              environment variables. Contact your administrator to change them.
            </div>
          </div>
        </Card>
      )}

      {/* SECURITY */}
      {activeTab === 'security' && (
        <Card>
          <h3 className="card-title">Security Preferences</h3>

          <div className="settings-list">
            <div className="settings-row">
              <div>
                <p className="settings-row-title">Two-Factor Authentication</p>
                <p className="settings-row-desc">
                  Add an extra layer of security
                </p>
              </div>
              <span className="settings-badge">Coming soon</span>
            </div>

            <div className="settings-row">
              <div>
                <p className="settings-row-title">Session Timeout</p>
                <p className="settings-row-desc">
                  Auto-logout after inactivity
                </p>
              </div>
              <select className="settings-select">
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>2 hours</option>
                <option>Never</option>
              </select>
            </div>

            <div className="settings-row">
              <div>
                <p className="settings-row-title">Login Notifications</p>
                <p className="settings-row-desc">
                  Email alerts for new logins
                </p>
              </div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider" />
              </label>
            </div>
          </div>
        </Card>
      )}

      {/* SYSTEM */}
      {activeTab === 'system' && (
        <Card>
          <h3 className="card-title">System Information</h3>

          <div className="settings-system-grid">
            <div>
              <span>Platform Version</span>
              <strong>v1.0.0</strong>
            </div>
            <div>
              <span>Database</span>
              <strong className="text-success">● Connected</strong>
            </div>
            <div>
              <span>API Status</span>
              <strong className="text-success">● Operational</strong>
            </div>
            <div>
              <span>Last Backup</span>
              <strong className="mono">2024-01-28 14:30 UTC</strong>
            </div>
          </div>

          <div className="settings-actions">
            <Button variant="secondary">
              <Database size={16} />
              Backup Database
            </Button>
            <Button variant="secondary">
              Clear Cache
            </Button>
          </div>
        </Card>
      )}

      {/* SAVE */}
      <div className="settings-save">
        <Button onClick={handleSave} loading={saving}>
          <Save size={16} />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
