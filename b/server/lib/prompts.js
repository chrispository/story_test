import { listPrompts } from './db.js';

function applyTemplate(tpl, vars) {
  return tpl.replace(/\{\{(.*?)\}\}/g, (_m, key) => (vars[key.trim()] ?? ''));
}

async function getPromptMap() {
  const prompts = await listPrompts();
  const map = {};
  for (const p of prompts) map[p.id] = p.content;
  return map;
}

export async function buildInitialPrompt({ genre }) {
  const map = await getPromptMap();
  const style = map['style-meta'] || '';
  const tpl = map['initial-template'] || 'Begin a story in {{genre}}.';
  const body = applyTemplate(tpl, { genre });
  return `You are an expert interactive fiction generator.\n${style}\n\nTask: Write the next screen.\n\n${body}\n\nReturn JSON with keys: storyText (string), choices (array of 2-3 strings), imagePrompt (string).`;
}

export async function buildContinuationPrompt({ genre, parentText, choice }) {
  const map = await getPromptMap();
  const style = map['style-meta'] || '';
  const tpl = map['continuation-template'] || 'Continue based on prior text and the chosen action.';
  const body = applyTemplate(tpl, { genre, parentText, choice });
  return `You are an expert interactive fiction generator.\n${style}\n\nTask: Continue the story.\n\n${body}\n\nReturn JSON with keys: storyText (string), choices (array of 2-3 strings), imagePrompt (string).`;
}

export async function buildImagePrompt(summary) {
  const map = await getPromptMap();
  const tpl = map['image-template'] || 'Illustrate: {{summary}}';
  return applyTemplate(tpl, { summary });
}

