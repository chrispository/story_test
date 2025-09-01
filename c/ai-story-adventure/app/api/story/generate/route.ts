import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import db from '@/lib/db';
import crypto from 'crypto';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { genre, sessionId, sceneNumber, choice } = await request.json();

    const newSessionId = sessionId || crypto.randomUUID();
    
    const getPrompt = db.prepare('SELECT content, variables FROM prompts WHERE name = ?');
    const getSetting = db.prepare('SELECT value FROM settings WHERE key = ?');
    
    const temperature = parseFloat((getSetting.get('temperature') as any)?.value || '0.8');
    const maxTokens = parseInt((getSetting.get('max_tokens') as any)?.value || '1000');
    
    let promptTemplate;
    let promptVariables: any = { genre };
    
    if (sceneNumber === 0) {
      const openingPrompt = getPrompt.get('opening_scene') as any;
      promptTemplate = openingPrompt?.content;
    } else {
      const scenePrompt = getPrompt.get('scene_prompt') as any;
      promptTemplate = scenePrompt?.content;
      
      const getPreviousScenes = db.prepare(`
        SELECT content FROM stories 
        WHERE session_id = ? 
        ORDER BY scene_number DESC 
        LIMIT 3
      `);
      const previousScenes = (getPreviousScenes.all(newSessionId) as any[])
        .map(s => s.content)
        .reverse()
        .join('\n\n');
      
      promptVariables.previous_scenes = previousScenes;
      promptVariables.choice_made = choice;
    }
    
    let finalPrompt = promptTemplate || '';
    Object.keys(promptVariables).forEach(key => {
      finalPrompt = finalPrompt.replace(new RegExp(`{${key}}`, 'g'), promptVariables[key]);
    });
    
    const systemPrompt = getPrompt.get('system_prompt') as any;
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      }
    });
    
    const result = await model.generateContent([
      systemPrompt?.content || '',
      finalPrompt
    ].join('\n\n'));
    
    const response = await result.response;
    const text = response.text();
    
    const sceneMatch = text.match(/SCENE:\s*([\s\S]*?)(?=CHOICES:|$)/);
    const choicesMatch = text.match(/CHOICES:\s*([\s\S]*?)$/);
    
    const sceneContent = sceneMatch ? sceneMatch[1].trim() : text;
    const choicesText = choicesMatch ? choicesMatch[1].trim() : '';
    
    const choicesList = choicesText
      .split(/\d+\.\s*/)
      .filter(c => c.trim())
      .slice(0, 3)
      .map(c => c.trim());
    
    if (choicesList.length < 3) {
      choicesList.push(
        'Continue exploring',
        'Try a different approach',
        'Return to safety'
      );
    }
    
    const insertStory = db.prepare(`
      INSERT INTO stories (session_id, scene_number, content, choices, genre)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(session_id, scene_number) 
      DO UPDATE SET content = excluded.content, choices = excluded.choices
      RETURNING id
    `);
    
    const story = insertStory.get(
      newSessionId,
      sceneNumber,
      sceneContent,
      JSON.stringify(choicesList),
      genre
    ) as any;
    
    return NextResponse.json({
      success: true,
      sessionId: newSessionId,
      sceneNumber,
      content: sceneContent,
      choices: choicesList,
      storyId: story.id
    });
    
  } catch (error) {
    console.error('Story generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate story' },
      { status: 500 }
    );
  }
}