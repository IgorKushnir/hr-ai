import { NextRequest, NextResponse } from 'next/server'
import { drizzle } from 'drizzle-orm/neon-serverless'
import { eq } from 'drizzle-orm'
import { cv, report } from '@/db/schema'
import { stackServerApp } from '@/stack'

const db = drizzle(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    // Get the current user from Stack authentication
    const user = await stackServerApp.getUser()

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Get all CVs for the current user
    const userCVs = await db
      .select({
        id: cv.id,
        userId: cv.userId,
        fileName: cv.fileName,
        text: cv.text,
        createdAt: cv.createdAt,
        reportId: report.id,
        reportCreatedAt: report.createdAt,
      })
      .from(cv)
      .leftJoin(report, eq(report.cvId, cv.id))
      .where(eq(cv.userId, user.id))
      .orderBy(cv.createdAt)

    return NextResponse.json({
      message: 'CVs retrieved successfully',
      data: userCVs,
      count: userCVs.length,
    })
  } catch (error) {
    console.error('Error retrieving CVs:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
