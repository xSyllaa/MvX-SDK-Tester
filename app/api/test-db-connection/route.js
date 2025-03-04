import { NextResponse } from 'next/server'
import { testDatabaseConnection } from '@/lib/test-db-connection'

export async function GET() {
  try {
    const result = await testDatabaseConnection()
    
    if (result.success) {
      return NextResponse.json(
        { message: 'Connection to Supabase successful', data: result.result },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { message: 'Connection to Supabase failed', error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { message: 'An error occurred', error: error.message },
      { status: 500 }
    )
  }
} 