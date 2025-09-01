import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const prompts = db.prepare('SELECT * FROM prompts ORDER BY id').all();
    
    return NextResponse.json({
      success: true,
      prompts
    });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const prompt = await request.json();
    
    const update = db.prepare(`
      UPDATE prompts 
      SET content = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    update.run(prompt.content, prompt.id);
    
    return NextResponse.json({
      success: true,
      message: 'Prompt updated successfully'
    });
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update prompt' },
      { status: 500 }
    );
  }
}