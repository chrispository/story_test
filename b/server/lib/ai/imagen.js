import { buildImagePrompt } from '../prompts.js';

function isTrue(v) {
  return String(v).toLowerCase() === 'true';
}

export async function generateImageURLs({ prompt, params }) {
  const mockMode = isTrue(params.MOCK_MODE ?? process.env.MOCK_MODE ?? 'true');
  const finalPrompt = await buildImagePrompt(prompt);
  if (mockMode) {
    const seed = Math.abs(hashCode(finalPrompt));
    return {
      landscape: `https://picsum.photos/seed/${seed}/960/540`,
      portrait: `https://picsum.photos/seed/${seed + 1}/540/960`
    };
  }
  // TODO: Implement Google Imagen via Vertex AI when configured.
  const seed = Math.abs(hashCode(finalPrompt));
  return {
    landscape: `https://picsum.photos/seed/${seed}/960/540`,
    portrait: `https://picsum.photos/seed/${seed + 1}/540/960`
  };
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  return h;
}
