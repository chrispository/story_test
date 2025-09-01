import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

export function initGemini(apiKey: string) {
  genAI = new GoogleGenerativeAI(apiKey);
}

export async function generateStory(
  prompt: string,
  temperature: number = 0.8,
  maxTokens: number = 1000
) {
  if (!genAI) {
    throw new Error('Gemini AI not initialized. Please set API key.');
  }
  
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-pro',
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    }
  });
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function generateImage(prompt: string) {
  const apiKey = process.env.GOOGLE_IMAGEN_API_KEY;
  
  if (!apiKey) {
    console.warn('Google Imagen API key not set. Returning placeholder image.');
    return {
      portrait: 'https://via.placeholder.com/768x1024',
      landscape: 'https://via.placeholder.com/1024x768'
    };
  }
  
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/imagen-3/generateImage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt,
        numberOfImages: 2,
        aspectRatio: ['9:16', '16:9']
      })
    });
    
    if (!response.ok) {
      throw new Error('Image generation failed');
    }
    
    const data = await response.json();
    return {
      portrait: data.images[0].url,
      landscape: data.images[1].url
    };
  } catch (error) {
    console.error('Image generation error:', error);
    return {
      portrait: 'https://via.placeholder.com/768x1024',
      landscape: 'https://via.placeholder.com/1024x768'
    };
  }
}