import { NextRequest, NextResponse } from 'next/server'
import { openDb } from '@/lib/db'
import { generateStory, generateImage, initGemini } from '@/lib/gemini'
import { randomUUID } from 'crypto'

initGemini(process.env.GOOGLE_GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { genre, choiceId, screenId } = await request.json()
    const db = await openDb()
    
    const settings = await db.all('SELECT * FROM app_settings')
    const settingsMap = settings.reduce((acc: any, s: any) => {
      acc[s.key] = s.value
      return acc
    }, {})
    
    let prompt = ''
    let parentId = screenId || null
    
    if (!screenId) {
      const startPrompt = await db.get(
        'SELECT content FROM prompts WHERE name = ?',
        [`${genre}_start`]
      )
      prompt = startPrompt?.content || 'Start a new adventure story.'
    } else {
      const continuePrompt = await db.get(
        'SELECT content FROM prompts WHERE name = ?',
        ['continue_story']
      )
      
      const previousScreen = await db.get(
        'SELECT * FROM story_screens WHERE screen_id = ?',
        [screenId]
      )
      
      prompt = `${continuePrompt?.content}\n\nPrevious story: ${previousScreen?.story_text}\n\nUser chose: ${choiceId}`
    }
    
    const storyResponse = await generateStory(
      prompt,
      parseFloat(settingsMap.ai_temperature || '0.8'),
      parseInt(settingsMap.max_tokens || '1000')
    )
    
    const storyParts = parseStoryResponse(storyResponse)
    
    const imagePrompt = await db.get(
      'SELECT content FROM prompts WHERE name = ?',
      ['image_generation']
    )
    
    const images = await generateImage(
      imagePrompt?.content.replace('[SCENE_DESCRIPTION]', storyParts.imageDescription) || storyParts.imageDescription
    )
    
    const newScreenId = randomUUID()
    
    await db.run(
      `INSERT INTO story_screens (screen_id, parent_id, story_text, image_portrait, image_landscape, user_choices, genre) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        newScreenId,
        parentId,
        storyParts.text,
        images.portrait,
        images.landscape,
        JSON.stringify(storyParts.choices),
        genre
      ]
    )
    
    return NextResponse.json({
      screenId: newScreenId,
      storyText: storyParts.text,
      choices: storyParts.choices,
      images
    })
  } catch (error) {
    console.error('Story generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate story' },
      { status: 500 }
    )
  }
}

function parseStoryResponse(response: string) {
  const lines = response.split('\n')
  const choices: { id: string; text: string }[] = []
  let storyText = ''
  let imageDescription = ''
  let inChoices = false
  
  for (const line of lines) {
    if (line.toLowerCase().includes('choice') || line.match(/^\d+\./)) {
      inChoices = true
      const choiceText = line.replace(/^\d+\.?\s*/, '').replace(/^choice\s*\d*:?\s*/i, '').trim()
      if (choiceText) {
        choices.push({
          id: randomUUID(),
          text: choiceText
        })
      }
    } else if (line.toLowerCase().includes('image:')) {
      imageDescription = line.replace(/^image:?\s*/i, '').trim()
    } else if (!inChoices && line.trim()) {
      storyText += line + '\n'
    }
  }
  
  storyText = storyText.trim()
  
  if (!imageDescription) {
    imageDescription = storyText.slice(0, 200)
  }
  
  if (choices.length === 0) {
    choices.push(
      { id: randomUUID(), text: 'Continue the adventure' },
      { id: randomUUID(), text: 'Try a different approach' },
      { id: randomUUID(), text: 'Explore your surroundings' }
    )
  }
  
  return {
    text: storyText,
    choices: choices.slice(0, 3),
    imageDescription
  }
}