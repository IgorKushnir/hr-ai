import { NextRequest, NextResponse } from 'next/server'
import { drizzle } from 'drizzle-orm/neon-serverless'
import pdfParse from 'pdf-parse'
import { cv } from '@/db/schema'

const db = drizzle(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 })
    }

    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { message: 'Only PDF files are allowed' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Parse PDF
    const pdfDocument = await pdfParse(buffer)

    const userId = formData.get('userId') as string
    const savedCV = await db
      .insert(cv)
      .values({
        text: pdfDocument.text.trim(),
        fileName: file.name,
        userId: userId,
      })
      .returning()

    return NextResponse.json({
      message: 'PDF parsed successfully',
      data: savedCV
    })
  } catch (error) {
    console.error('Error parsing PDF:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
