import { NextRequest, NextResponse } from 'next/server'
import { openDb } from '@/lib/db'

export async function GET() {
  try {
    const db = await openDb()
    const settings = await db.all('SELECT * FROM app_settings')
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { key, value } = await request.json()
    const db = await openDb()
    
    await db.run(
      'UPDATE app_settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
      [value, key]
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 })
  }
}