'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, FileText, Sliders, Save, Plus, Trash2, Edit2 } from 'lucide-react'

interface Setting {
  key: string
  value: string
}

interface Prompt {
  id: number
  name: string
  type: string
  content: string
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'settings' | 'prompts'>('settings')
  const [settings, setSettings] = useState<Setting[]>([])
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadSettings()
    loadPrompts()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const loadPrompts = async () => {
    try {
      const response = await fetch('/api/admin/prompts')
      const data = await response.json()
      setPrompts(data)
    } catch (error) {
      console.error('Failed to load prompts:', error)
    }
  }

  const saveSetting = async (key: string, value: string) => {
    setIsSaving(true)
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      })
      await loadSettings()
    } catch (error) {
      console.error('Failed to save setting:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const savePrompt = async (prompt: Prompt) => {
    setIsSaving(true)
    try {
      await fetch('/api/admin/prompts', {
        method: prompt.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt)
      })
      await loadPrompts()
      setEditingPrompt(null)
    } catch (error) {
      console.error('Failed to save prompt:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const deletePrompt = async (id: number) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return
    
    try {
      await fetch(`/api/admin/prompts?id=${id}`, {
        method: 'DELETE'
      })
      await loadPrompts()
    } catch (error) {
      console.error('Failed to delete prompt:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-400">Manage application settings and prompts</p>
        </motion.div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'settings'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
          <button
            onClick={() => setActiveTab('prompts')}
            className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'prompts'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            <FileText className="w-5 h-5" />
            Prompts
          </button>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-2xl p-8"
        >
          {activeTab === 'settings' ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                <Sliders className="w-6 h-6" />
                Application Settings
              </h2>
              
              {settings.map((setting) => (
                <div key={setting.key} className="space-y-2">
                  <label className="text-gray-300 capitalize">
                    {setting.key.replace(/_/g, ' ')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={setting.value}
                      onChange={(e) => {
                        const newSettings = settings.map(s =>
                          s.key === setting.key ? { ...s, value: e.target.value } : s
                        )
                        setSettings(newSettings)
                      }}
                      className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={() => saveSetting(setting.key, setting.value)}
                      disabled={isSaving}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Prompt Management
                </h2>
                <button
                  onClick={() => setEditingPrompt({ id: 0, name: '', type: 'story', content: '' })}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Prompt
                </button>
              </div>

              {editingPrompt && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-slate-800 rounded-xl space-y-4"
                >
                  <input
                    type="text"
                    placeholder="Prompt Name"
                    value={editingPrompt.name}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
                  />
                  <select
                    value={editingPrompt.type}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, type: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
                  >
                    <option value="story">Story</option>
                    <option value="image">Image</option>
                  </select>
                  <textarea
                    placeholder="Prompt Content"
                    value={editingPrompt.content}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, content: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg h-32 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => savePrompt(editingPrompt)}
                      disabled={isSaving}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingPrompt(null)}
                      className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}

              <div className="space-y-3">
                {prompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="p-4 bg-slate-800 rounded-lg flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{prompt.name}</h3>
                      <p className="text-gray-400 text-sm">{prompt.type}</p>
                      <p className="text-gray-300 mt-2 text-sm line-clamp-2">{prompt.content}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => setEditingPrompt(prompt)}
                        className="p-2 bg-slate-700 text-white rounded hover:bg-slate-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deletePrompt(prompt.id)}
                        className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}