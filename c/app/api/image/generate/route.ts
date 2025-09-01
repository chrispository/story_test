import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import db from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { sceneContent, genre, storyId, orientation = 'landscape' } = await request.json();
    
    const getPrompt = db.prepare('SELECT content FROM prompts WHERE name = ?');
    const imagePromptTemplate = (getPrompt.get('image_prompt') as any)?.content;
    
    let imagePrompt = imagePromptTemplate || `Create a detailed visual description for: ${sceneContent}`;
    imagePrompt = imagePrompt
      .replace('{scene_content}', sceneContent)
      .replace('{genre}', genre);
    
    const aspectRatio = orientation === 'landscape' ? '16:9' : '9:16';
    imagePrompt += `\nAspect ratio: ${aspectRatio}`;
    
    const simulatedImageUrl = `data:image/svg+xml;base64,${Buffer.from(`
      <svg width="${orientation === 'landscape' ? 1920 : 1080}" height="${orientation === 'landscape' ? 1080 : 1920}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#7c3aed;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#db2777;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">
          ${genre.toUpperCase()} SCENE
        </text>
      </svg>
    `).toString('base64')}`;
    
    if (storyId) {
      const insertImage = db.prepare(`
        INSERT INTO images (story_id, url, orientation, prompt)
        VALUES (?, ?, ?, ?)
      `);
      
      insertImage.run(storyId, simulatedImageUrl, orientation, imagePrompt);
    }
    
    return NextResponse.json({
      success: true,
      imageUrl: simulatedImageUrl,
      prompt: imagePrompt
    });
    
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}