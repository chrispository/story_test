import { NextRequest, NextResponse } from 'next/server'
import { openDb } from '@/lib/db'

export async function GET() {
  try {
    const db = await openDb()
    const prompts = await db.all('SELECT * FROM prompts ORDER BY type, name')
    return NextResponse.json(prompts)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load prompts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, type, content } = await request.json()
    const db = await openDb()
    
    await db.run(
      'INSERT INTO prompts (name, type, content) VALUES (?, ?, ?)',
      [name, type, content]
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, type, content } = await request.json()
    const db = await openDb()
    
    await db.run(
      'UPDATE prompts SET name = ?, type = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, type, content, id]
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    const db = await openDb()
    await db.run('DELETE FROM prompts WHERE id = ?', [id])
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 })
  }
}