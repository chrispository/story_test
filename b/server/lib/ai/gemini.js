import { GoogleGenerativeAI } from '@google/generative-ai';

function isTrue(v) {
  return String(v).toLowerCase() === 'true';
}

export async function generateStorySegment({ prompt, params }) {
  const mockMode = isTrue(params.MOCK_MODE ?? process.env.MOCK_MODE ?? 'true') || !process.env.GOOGLE_API_KEY;
  if (mockMode) {
    return mockGenerate(prompt);
  }

  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const modelId = params.MODEL_ID || 'gemini-1.5-flash';
    const temperature = Number(params.TEMPERATURE ?? 0.8);
    const maxOutputTokens = Number(params.MAX_TOKENS ?? 600);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelId });
    const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }]}], generationConfig: { temperature, maxOutputTokens } });
    const text = result?.response?.text?.() || '';
    let parsed;
    try {
      parsed = JSON.parse(extractJSON(text));
    } catch {
      parsed = { storyText: text.trim(), choices: defaultChoicesFromText(text), imagePrompt: text.slice(0, 200) };
    }
    if (!parsed.choices || parsed.choices.length === 0) parsed.choices = defaultChoicesFromText(parsed.storyText);
    return parsed;
  } catch (e) {
    console.error('Gemini error, falling back to mock:', e?.message || e);
    return mockGenerate(prompt);
  }
}

function extractJSON(s) {
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start >= 0 && end >= start) return s.slice(start, end + 1);
  return s;
}

function defaultChoicesFromText(text) {
  // naive choices when none provided
  return [
    'Press forward',
    'Pause and observe',
    'Retreat and rethink'
  ];
}

function mockGenerate(prompt) {
  const hash = hashCode(prompt);
  const scene = sample([
    'corridor lit by pulsing blue strips',
    'hangar bay humming with distant engines',
    'command deck awash in holograms',
    'observation dome above a storm-wracked gas giant'
  ], hash);
  const storyText = `You steady your breath. The ${scene} sharpens into focus. Systems whisper status updates along your HUD as the ship drifts. Ahead, a decision waits.`;
  return {
    storyText,
    choices: [
      'Route power to scanners',
      'Call the bridge',
      'Slip into the maintenance shaft'
    ],
    imagePrompt: `cinematic sci-fi still of ${scene}`
  };
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  return Math.abs(h);
}

function sample(arr, seed) {
  return arr[seed % arr.length];
}

