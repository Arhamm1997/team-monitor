import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase/client';
import { Settings as SettingsIcon, Save, Clock, Trash2, Shield, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';

export function Settings() {
  const [settings, setSettings] = useState({
    screenshot_interval: 5,
    retention_days: 30,
    privacy_mode: false,
    admin_email: '',
    notifications_enabled: true,
    auto_delete: false,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings({
          screenshot_interval: data.screenshot_interval || 5,
          retention_days: data.retention_days || 30,
          privacy_mode: data.privacy_mode || false,
          admin_email: data.admin_email || '',
          notifications_enabled: true,
          auto_delete: false,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const { data: existing } = await supabase
        .from('system_settings')
        .select('*')
        .limit(1)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('system_settings')
          .update({
            screenshot_interval: settings.screenshot_interval,
            retention_days: settings.retention_days,
            privacy_mode: settings.privacy_mode,
            admin_email: settings.admin_email,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('system_settings').insert([
          {
            screenshot_interval: settings.screenshot_interval,
            retention_days: settings.retention_days,
            privacy_mode: settings.privacy_mode,
            admin_email: settings.admin_email,
          },
        ]);

        if (error) throw error;
      }

      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleClearOldData = async () => {
    if (!confirm('Are you sure you want to delete old screenshots? This cannot be undone.')) return;

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - settings.retention_days);

      const { error } = await supabase
        .from('screenshots')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (error) throw error;

      setMessage({ type: 'success', text: 'Old data cleared successfully!' });
    } catch (error: any) {
      console.error('Error clearing data:', error);
      setMessage({ type: 'error', text: 'Failed to clear old data' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 dark:text-white mb-2">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Configure system preferences and monitoring options
        </p>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Capture Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Capture Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="interval">Screenshot Interval (minutes)</Label>
            <div className="mt-3 space-y-4">
              <Slider
                id="interval"
                min={1}
                max={60}
                step={1}
                value={[settings.screenshot_interval]}
                onValueChange={(value) =>
                  setSettings({ ...settings, screenshot_interval: value[0] })
                }
              />
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">1 minute</span>
                <Badge variant="secondary" className="text-slate-900 dark:text-white">
                  {settings.screenshot_interval} minutes
                </Badge>
                <span className="text-slate-600 dark:text-slate-400">60 minutes</span>
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              How often the client captures screenshots
            </p>
          </div>

          <div>
            <Label htmlFor="retention">Data Retention (days)</Label>
            <div className="mt-3 space-y-4">
              <Slider
                id="retention"
                min={7}
                max={365}
                step={1}
                value={[settings.retention_days]}
                onValueChange={(value) =>
                  setSettings({ ...settings, retention_days: value[0] })
                }
              />
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">7 days</span>
                <Badge variant="secondary" className="text-slate-900 dark:text-white">
                  {settings.retention_days} days
                </Badge>
                <span className="text-slate-600 dark:text-slate-400">365 days</span>
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Screenshots older than this will be automatically deleted
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="privacy">Privacy Mode</Label>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Blur sensitive information in screenshots
              </p>
            </div>
            <Switch
              id="privacy"
              checked={settings.privacy_mode}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, privacy_mode: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="notifications">Enable Notifications</Label>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Receive alerts for system events
              </p>
            </div>
            <Switch
              id="notifications"
              checked={settings.notifications_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, notifications_enabled: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="auto-delete">Auto-Delete Old Screenshots</Label>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Automatically remove screenshots after retention period
              </p>
            </div>
            <Switch
              id="auto-delete"
              checked={settings.auto_delete}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, auto_delete: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Admin Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Administrator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="admin_email">Admin Email</Label>
            <Input
              id="admin_email"
              type="email"
              value={settings.admin_email}
              onChange={(e) => setSettings({ ...settings, admin_email: e.target.value })}
              placeholder="admin@company.com"
              className="mt-1.5"
            />
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Receive system notifications and alerts
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <h3 className="text-orange-900 dark:text-orange-100 mb-2">
              Clear Old Data
            </h3>
            <p className="text-orange-700 dark:text-orange-300 mb-4">
              Delete all screenshots older than {settings.retention_days} days. This action cannot be undone.
            </p>
            <Button variant="outline" onClick={handleClearOldData}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Old Screenshots
            </Button>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-slate-900 dark:text-white mb-2">
              Storage Information
            </h3>
            <div className="space-y-2 text-slate-600 dark:text-slate-400">
              <p>Total Screenshots: Loading...</p>
              <p>Storage Used: Loading...</p>
              <p>Available Space: Loading...</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={loadSettings}>
          Reset
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
