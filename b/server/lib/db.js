import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'node:path';
import fs from 'node:fs';

let db;

export function initDB(filePath) {
  // We will manage three JSON files: parameters, prompts, screens
  const baseDir = path.dirname(filePath);
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

  const paramsAdapter = new JSONFile(path.join(baseDir, 'parameters.json'));
  const promptsAdapter = new JSONFile(path.join(baseDir, 'prompts.json'));
  const screensAdapter = new JSONFile(path.join(baseDir, 'screens.json'));

  db = {
    params: new Low(paramsAdapter, {}),
    prompts: new Low(promptsAdapter, []),
    screens: new Low(screensAdapter, [])
  };
}

export async function seedDefaults() {
  await db.params.read();
  await db.prompts.read();
  await db.screens.read();

  db.params.data ||= {};
  db.prompts.data ||= [];
  db.screens.data ||= [];

  const defaults = {
    MODEL_ID: process.env.MODEL_ID || 'gemini-1.5-flash',
    TEMPERATURE: process.env.TEMPERATURE || '0.8',
    MAX_TOKENS: process.env.MAX_TOKENS || '600',
    MOCK_MODE: process.env.MOCK_MODE || 'true',
    THEME: 'system',
    IMAGE_ASPECT: 'landscape'
  };
  for (const [k, v] of Object.entries(defaults)) {
    if (!(k in db.params.data)) db.params.data[k] = String(v);
  }
  await db.params.write();

  if ((db.prompts.data || []).length === 0) {
    const now = new Date().toISOString();
    db.prompts.data.push(
      {
        id: 'style-meta',
        name: 'Narrative Style',
        type: 'meta',
        content: 'Write immersive second-person sci-fi with crisp pacing, vivid sensory detail, and tight scene framing. Keep paragraphs short and choices concrete. Avoid overly florid prose.',
        updatedAt: now
      },
      {
        id: 'initial-template',
        name: 'Initial Screen Template',
        type: 'template',
        content: 'Genre: {{genre}}. Begin an engaging scene that ends with 2-3 actionable choices for the reader.',
        updatedAt: now
      },
      {
        id: 'continuation-template',
        name: 'Continuation Template',
        type: 'template',
        content: 'Continue the story. Prior text: "{{parentText}}". The reader chose: "{{choice}}". Advance the scene with consequence and end with 2-3 new choices.',
        updatedAt: now
      },
      {
        id: 'image-template',
        name: 'Image Prompt Template',
        type: 'template',
        content: 'Cinematic sci-fi concept art of the current scene: {{summary}}. Futuristic, high detail, moody lighting.',
        updatedAt: now
      }
    );
    await db.prompts.write();
  }
}

export async function saveScreen(screen) {
  await db.screens.read();
  db.screens.data.push(screen);
  await db.screens.write();
}

export async function getScreenById(id) {
  await db.screens.read();
  return db.screens.data.find(s => s.screenID === id) || null;
}

export async function getParameters() {
  await db.params.read();
  return db.params.data || {};
}

export async function setParameters(updates) {
  await db.params.read();
  db.params.data ||= {};
  for (const [k, v] of Object.entries(updates)) db.params.data[k] = String(v);
  await db.params.write();
}

export async function listPrompts() {
  await db.prompts.read();
  return db.prompts.data || [];
}

export async function createPrompt({ id, name, type, content }) {
  await db.prompts.read();
  const rec = { id: id || cryptoRandomId(), name, type, content, updatedAt: new Date().toISOString() };
  db.prompts.data.push(rec);
  await db.prompts.write();
  return rec;
}

export async function updatePrompt(id, { name, type, content }) {
  await db.prompts.read();
  const rec = db.prompts.data.find(p => p.id === id);
  if (!rec) return null;
  if (name != null) rec.name = name;
  if (type != null) rec.type = type;
  if (content != null) rec.content = content;
  rec.updatedAt = new Date().toISOString();
  await db.prompts.write();
  return rec;
}

export async function deletePrompt(id) {
  await db.prompts.read();
  db.prompts.data = db.prompts.data.filter(p => p.id !== id);
  await db.prompts.write();
}

function cryptoRandomId() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}
