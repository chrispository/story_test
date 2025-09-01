import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export async function openDb() {
  return open({
    filename: path.join(process.cwd(), 'data', 'story.db'),
    driver: sqlite3.Database
  });
}

export async function initDb() {
  const db = await openDb();
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS story_screens (
      screen_id TEXT PRIMARY KEY,
      parent_id TEXT,
      story_text TEXT NOT NULL,
      image_portrait TEXT,
      image_landscape TEXT,
      user_choices TEXT,
      genre TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      type TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  const defaultSettings = [
    { key: 'ai_temperature', value: '0.8' },
    { key: 'max_tokens', value: '1000' },
    { key: 'animation_speed', value: '300' },
    { key: 'story_length', value: 'medium' },
    { key: 'image_style', value: 'cinematic' }
  ];
  
  for (const setting of defaultSettings) {
    await db.run(
      'INSERT OR IGNORE INTO app_settings (key, value) VALUES (?, ?)',
      [setting.key, setting.value]
    );
  }
  
  const defaultPrompts = [
    {
      name: 'military_scifi_start',
      type: 'story',
      content: 'You are a creative military science fiction storyteller. Generate an engaging opening scene for a military sci-fi adventure. Include vivid descriptions and end with 2-3 compelling choices for the reader.'
    },
    {
      name: 'space_opera_start',
      type: 'story',
      content: 'You are a creative space opera storyteller. Generate an epic opening scene for a space opera adventure. Include grand descriptions of cosmic settings and end with 2-3 dramatic choices for the reader.'
    },
    {
      name: 'space_tech_thriller_start',
      type: 'story',
      content: 'You are a creative tech thriller storyteller. Generate a suspenseful opening scene for a space technology thriller. Include technical details and mysteries, ending with 2-3 intriguing choices for the reader.'
    },
    {
      name: 'continue_story',
      type: 'story',
      content: 'Continue the story based on the previous context and the user\'s choice. Maintain narrative consistency and generate 2-3 new choices.'
    },
    {
      name: 'image_generation',
      type: 'image',
      content: 'Create a cinematic, futuristic scene depicting: [SCENE_DESCRIPTION]. Style: photorealistic, dramatic lighting, sci-fi aesthetic.'
    }
  ];
  
  for (const prompt of defaultPrompts) {
    await db.run(
      'INSERT OR IGNORE INTO prompts (name, type, content) VALUES (?, ?, ?)',
      [prompt.name, prompt.type, prompt.content]
    );
  }
  
  return db;
}