import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Database, Monitor, Save } from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      siteName: 'MES Resource Management',
      timezone: 'UTC-5',
      dateFormat: 'MM/DD/YYYY',
      language: 'English'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      resourceAlerts: true,
      maintenanceReminders: true,
      conflictAlerts: true
    },
    display: {
      theme: 'dark',
      compactMode: false,
      showAdvancedFeatures: true,
      autoRefresh: true,
      refreshInterval: 30
    },
    security: {
      sessionTimeout: 120,
      twoFactorAuth: false,
      auditLogging: true,
      dataEncryption: true
    }
  });

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'display', label: 'Display', icon: Monitor },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    // Save settings logic would go here
    console.log('Saving settings:', settings);
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Configure system preferences and behavior</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            {activeTab === 'general' && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">General Settings</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={settings.general.siteName}
                      onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Timezone
                      </label>
                      <select
                        value={settings.general.timezone}
                        onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="UTC-5">Eastern Time (UTC-5)</option>
                        <option value="UTC-6">Central Time (UTC-6)</option>
                        <option value="UTC-7">Mountain Time (UTC-7)</option>
                        <option value="UTC-8">Pacific Time (UTC-8)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Date Format
                      </label>
                      <select
                        value={settings.general.dateFormat}
                        onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      value={settings.general.language}
                      onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">Notification Settings</h3>
                <div className="space-y-6">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <p className="text-sm text-gray-400 mt-1">
                          {key === 'emailNotifications' && 'Receive email notifications for important events'}
                          {key === 'pushNotifications' && 'Show browser push notifications'}
                          {key === 'resourceAlerts' && 'Get alerts when resources are over/under utilized'}
                          {key === 'maintenanceReminders' && 'Receive maintenance schedule reminders'}
                          {key === 'conflictAlerts' && 'Alert when resource conflicts are detected'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value as boolean}
                          onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'display' && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">Display Settings</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Theme
                    </label>
                    <select
                      value={settings.display.theme}
                      onChange={(e) => handleSettingChange('display', 'theme', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Compact Mode</h4>
                      <p className="text-sm text-gray-400 mt-1">Reduce spacing and padding for more content</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.display.compactMode}
                        onChange={(e) => handleSettingChange('display', 'compactMode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Show Advanced Features</h4>
                      <p className="text-sm text-gray-400 mt-1">Display advanced controls and options</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.display.showAdvancedFeatures}
                        onChange={(e) => handleSettingChange('display', 'showAdvancedFeatures', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Auto Refresh</h4>
                      <p className="text-sm text-gray-400 mt-1">Automatically refresh data</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.display.autoRefresh}
                        onChange={(e) => handleSettingChange('display', 'autoRefresh', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  {settings.display.autoRefresh && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Refresh Interval (seconds)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="300"
                        value={settings.display.refreshInterval}
                        onChange={(e) => handleSettingChange('display', 'refreshInterval', parseInt(e.target.value))}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">Security Settings</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="480"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-400 mt-1">Require additional verification for login</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactorAuth}
                        onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Audit Logging</h4>
                      <p className="text-sm text-gray-400 mt-1">Log all user actions for security monitoring</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.auditLogging}
                        onChange={(e) => handleSettingChange('security', 'auditLogging', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Data Encryption</h4>
                      <p className="text-sm text-gray-400 mt-1">Encrypt sensitive data at rest and in transit</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.dataEncryption}
                        onChange={(e) => handleSettingChange('security', 'dataEncryption', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <button
                onClick={handleSaveSettings}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;