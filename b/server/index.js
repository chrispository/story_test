import path from 'node:path';
import fs from 'node:fs';
import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { v4 as uuidv4 } from 'uuid';

import { initDB, saveScreen, getScreenById, seedDefaults, getParameters, setParameters, listPrompts, createPrompt, updatePrompt, deletePrompt } from './lib/db.js';
import { generateStorySegment } from './lib/ai/gemini.js';
import { generateImageURLs } from './lib/ai/imagen.js';
import { buildInitialPrompt, buildContinuationPrompt } from './lib/prompts.js';
import { requireAdmin } from './lib/security.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize DB and seed defaults
initDB(path.join(dataDir, 'app.db'));
await seedDefaults();

// Static public app
app.use('/', express.static(path.join(__dirname, '..', 'public')));

// Protected admin static
app.use('/admin', requireAdmin, express.static(path.join(__dirname, '..', 'admin')));

// Health
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
});

// Parameters (admin)
app.get('/api/admin/parameters', requireAdmin, async (_req, res) => {
  const params = await getParameters();
  res.json(params);
});

app.put('/api/admin/parameters', requireAdmin, async (req, res) => {
  await setParameters(req.body || {});
  const params = await getParameters();
  res.json(params);
});

// Prompts (admin)
app.get('/api/admin/prompts', requireAdmin, async (_req, res) => {
  const prompts = await listPrompts();
  res.json(prompts);
});

app.post('/api/admin/prompts', requireAdmin, async (req, res) => {
  const prompt = await createPrompt(req.body);
  res.status(201).json(prompt);
});

app.put('/api/admin/prompts/:id', requireAdmin, async (req, res) => {
  const prompt = await updatePrompt(req.params.id, req.body);
  res.json(prompt);
});

app.delete('/api/admin/prompts/:id', requireAdmin, async (req, res) => {
  await deletePrompt(req.params.id);
  res.status(204).end();
});

// Story APIs
app.post('/api/start-story', async (req, res) => {
  try {
    const { genre } = req.body || {};
    if (!genre) return res.status(400).json({ error: 'genre is required' });

    const params = await getParameters();
    const initialPrompt = await buildInitialPrompt({ genre });
    const result = await generateStorySegment({ prompt: initialPrompt, params });
    const screenID = uuidv4();
    const img = await generateImageURLs({ prompt: result.imagePrompt || result.storyText, params });
    const screen = {
      screenID,
      storyText: result.storyText,
      portraitURL: img.portrait,
      landscapeURL: img.landscape,
      userChoices: JSON.stringify(result.choices || []),
      createdAt: new Date().toISOString(),
      parentID: null,
      genre: genre
    };
    await saveScreen(screen);
    res.json({ ...screen, userChoices: JSON.parse(screen.userChoices) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to start story' });
  }
});

app.post('/api/advance-story', async (req, res) => {
  try {
    const { parentScreenID, choice } = req.body || {};
    if (!parentScreenID || !choice) return res.status(400).json({ error: 'parentScreenID and choice are required' });
    const parent = await getScreenById(parentScreenID);
    if (!parent) return res.status(404).json({ error: 'Parent screen not found' });

    const params = await getParameters();
    const continuationPrompt = await buildContinuationPrompt({
      genre: parent.genre,
      parentText: parent.storyText,
      choice: typeof choice === 'string' ? choice : (choice.text || JSON.stringify(choice))
    });
    const result = await generateStorySegment({ prompt: continuationPrompt, params });
    const screenID = uuidv4();
    const img = await generateImageURLs({ prompt: result.imagePrompt || result.storyText, params });
    const screen = {
      screenID,
      storyText: result.storyText,
      portraitURL: img.portrait,
      landscapeURL: img.landscape,
      userChoices: JSON.stringify(result.choices || []),
      createdAt: new Date().toISOString(),
      parentID: parent.screenID,
      genre: parent.genre
    };
    await saveScreen(screen);
    res.json({ ...screen, userChoices: JSON.parse(screen.userChoices) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to advance story' });
  }
});

app.get('/api/screen/:id', async (req, res) => {
  try {
    const screen = await getScreenById(req.params.id);
    if (!screen) return res.status(404).json({ error: 'Not found' });
    res.json({ ...screen, userChoices: JSON.parse(screen.userChoices || '[]') });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch screen' });
  }
});

app.listen(PORT, () => {
  console.log(`AI CYOA server running on http://localhost:${PORT}`);
});

