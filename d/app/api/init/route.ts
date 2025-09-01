import { NextResponse } from 'next/server'
import { initDb } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const db = await initDb()
    
    const adminExists = await db.get('SELECT * FROM admin_users WHERE username = ?', ['admin'])
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      await db.run(
        'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)',
        ['admin', hashedPassword]
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully',
      defaultAdmin: !adminExists ? 'admin/admin123' : 'existing'
    })
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 })
  }
}