"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Lock, Settings, FileText, Sliders } from 'lucide-react';

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('prompts');
  const [prompts, setPrompts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authenticated) {
      fetchData();
    }
  }, [authenticated]);

  const fetchData = async () => {
    try {
      const [promptsRes, settingsRes] = await Promise.all([
        fetch('/api/admin/prompts'),
        fetch('/api/admin/settings')
      ]);
      
      const promptsData = await promptsRes.json();
      const settingsData = await settingsRes.json();
      
      if (promptsData.success) setPrompts(promptsData.prompts);
      if (settingsData.success) setSettings(settingsData.settings);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'changeme123')) {
      setAuthenticated(true);
    } else {
      alert('Invalid password');
    }
  };

  const savePrompt = async (prompt: any) => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt)
      });
      
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveSetting = async (setting: any) => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setting)
      });
      
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error saving setting:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <motion.form
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onSubmit={handleAuth}
          className="bg-gray-800/50 backdrop-blur-md p-8 rounded-2xl border border-gray-700 w-96"
        >
          <Lock className="w-12 h-12 mx-auto mb-4 text-blue-500" />
          <h1 className="text-2xl font-bold text-center mb-6 text-white">Admin Access</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="w-full p-3 rounded-lg bg-gray-900/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="w-full mt-4 p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Authenticate
          </button>
        </motion.form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
        >
          Admin Panel
        </motion.h1>

        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('prompts')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'prompts'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Prompts</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Sliders className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/30 backdrop-blur-md rounded-2xl border border-gray-700 p-6"
        >
          {activeTab === 'prompts' && (
            <div className="space-y-6">
              {prompts.map((prompt) => (
                <div key={prompt.id} className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{prompt.name}</h3>
                      <p className="text-gray-400 text-sm mt-1">{prompt.description}</p>
                    </div>
                    <button
                      onClick={() => savePrompt(prompt)}
                      disabled={saving}
                      className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                  </div>
                  <textarea
                    value={prompt.content}
                    onChange={(e) => {
                      const updated = prompts.map(p =>
                        p.id === prompt.id ? { ...p, content: e.target.value } : p
                      );
                      setPrompts(updated);
                    }}
                    className="w-full h-40 p-4 rounded-lg bg-gray-800 border border-gray-600 text-gray-100 font-mono text-sm resize-none focus:outline-none focus:border-blue-500"
                  />
                  {prompt.variables && (
                    <div className="mt-3 text-sm text-gray-500">
                      Variables: {JSON.parse(prompt.variables).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {settings.map((setting) => (
                <div key={setting.id} className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-white font-medium">
                      {setting.key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </label>
                    <button
                      onClick={() => saveSetting(setting)}
                      disabled={saving}
                      className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type={setting.key.includes('temperature') || setting.key.includes('duration') ? 'number' : 'text'}
                    value={setting.value}
                    onChange={(e) => {
                      const updated = settings.map(s =>
                        s.id === setting.id ? { ...s, value: e.target.value } : s
                      );
                      setSettings(updated);
                    }}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-gray-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}