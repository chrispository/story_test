import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_PATH || './data/stories.db';
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    variables TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    scene_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    choices TEXT NOT NULL,
    images TEXT,
    genre TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, scene_number)
  );

  CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    story_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    orientation TEXT NOT NULL CHECK(orientation IN ('landscape', 'portrait')),
    prompt TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (story_id) REFERENCES stories(id)
  );

  CREATE INDEX IF NOT EXISTS idx_stories_session ON stories(session_id);
  CREATE INDEX IF NOT EXISTS idx_images_story ON images(story_id);
`);

const defaultPrompts = [
  {
    name: 'system_prompt',
    content: `You are a master storyteller creating immersive choose-your-own-adventure stories. 
    Create compelling narratives with rich descriptions and meaningful choices that impact the story.
    Each scene should be 2-3 paragraphs with exactly 3 choices for the reader.
    Maintain consistency with previous scenes and character development.`,
    variables: JSON.stringify(['genre', 'previous_scenes', 'choice_made']),
    description: 'Main system prompt for story generation'
  },
  {
    name: 'scene_prompt',
    content: `Genre: {genre}
    Previous scenes: {previous_scenes}
    User chose: {choice_made}
    
    Continue the story based on the choice made. Create an engaging scene that:
    1. Directly follows from the choice
    2. Advances the plot meaningfully
    3. Introduces new elements or complications
    4. Ends with 3 distinct, impactful choices
    
    Format your response as:
    SCENE: [2-3 paragraphs of story content]
    
    CHOICES:
    1. [First choice]
    2. [Second choice]
    3. [Third choice]`,
    variables: JSON.stringify(['genre', 'previous_scenes', 'choice_made']),
    description: 'Template for generating story scenes'
  },
  {
    name: 'image_prompt',
    content: `Create a detailed visual description for this story scene:
    {scene_content}
    
    Style: Cinematic, {genre} genre, dramatic lighting, high detail
    Focus on key visual elements and atmosphere.
    Avoid text or words in the image.`,
    variables: JSON.stringify(['scene_content', 'genre']),
    description: 'Template for generating image prompts'
  },
  {
    name: 'opening_scene',
    content: `Create an opening scene for a {genre} story.
    Set the tone, introduce the protagonist, and establish the world.
    End with 3 choices that will shape the character's journey.
    
    Format your response as:
    SCENE: [2-3 paragraphs of story content]
    
    CHOICES:
    1. [First choice]
    2. [Second choice]
    3. [Third choice]`,
    variables: JSON.stringify(['genre']),
    description: 'Template for generating the opening scene'
  }
];

const defaultSettings = [
  { key: 'max_story_length', value: '20' },
  { key: 'temperature', value: '0.8' },
  { key: 'max_tokens', value: '1000' },
  { key: 'image_style', value: 'cinematic' },
  { key: 'image_quality', value: 'high' },
  { key: 'cache_duration', value: '86400' }
];

const initPrompts = db.prepare(`
  INSERT OR IGNORE INTO prompts (name, content, variables, description)
  VALUES (?, ?, ?, ?)
`);

const initSettings = db.prepare(`
  INSERT OR IGNORE INTO settings (key, value)
  VALUES (?, ?)
`);

defaultPrompts.forEach(prompt => {
  initPrompts.run(prompt.name, prompt.content, prompt.variables, prompt.description);
});

defaultSettings.forEach(setting => {
  initSettings.run(setting.key, setting.value);
});

export default db;