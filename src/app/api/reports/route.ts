import { NextRequest, NextResponse } from 'next/server'
import { drizzle } from 'drizzle-orm/neon-serverless'
import { eq } from 'drizzle-orm'
import { report, cv } from '@/db/schema'
import { stackServerApp } from '@/stack'

const db = drizzle(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    // Get the current user from Stack authentication
    const user = await stackServerApp.getUser()

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Get report ID from URL search params
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('id')

    if (!reportId) {
      return NextResponse.json(
        { message: 'Report ID is required' },
        { status: 400 }
      )
    }

    // Get the report by ID and ensure it belongs to the current user
    const userReport = await db
      .select()
      .from(report)
      .where(eq(report.id, parseInt(reportId)))
      .limit(1)

    if (userReport.length === 0) {
      return NextResponse.json({ message: 'Report not found' }, { status: 404 })
    }

    // Check if the report belongs to the current user
    if (userReport[0].userId !== user.id) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({
      message: 'Report retrieved successfully',
      data: userReport[0],
    })
  } catch (error) {
    console.error('Error retrieving report:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the current user from Stack authentication
    const user = await stackServerApp.getUser()

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Get CV ID from request body
    const body = await request.json()
    const { cvId } = body

    if (!cvId) {
      return NextResponse.json(
        { message: 'CV ID is required' },
        { status: 400 }
      )
    }

    // Get the CV and verify it belongs to the current user
    const userCV = await db.select().from(cv).where(eq(cv.id, cvId)).limit(1)

    if (userCV.length === 0) {
      return NextResponse.json({ message: 'CV not found' }, { status: 404 })
    }

    if (userCV[0].userId !== user.id) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 })
    }

    // Check if report already exists for this CV
    const existingReport = await db
      .select()
      .from(report)
      .where(eq(report.cvId, cvId))
      .limit(1)

    if (existingReport.length > 0) {
      return NextResponse.json(
        { message: 'Report already exists for this CV' },
        { status: 409 }
      )
    }

    // Generate report using OpenRouter API
    const openRouterResponse = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPEN_ROUTER_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-7b-instruct:free',
          messages: [
            {
              role: 'user',
              content: `Get email from ${userCV[0].text.slice(0, 200)}`,
            },
          ],
        }),
      }
    )

    if (!openRouterResponse.ok) {
      const openAIErrorText = await openRouterResponse.text()
      console.error('OpenRouter API error:', openAIErrorText)
      return NextResponse.json({ message: openAIErrorText }, { status: 500 })
    }

    const openRouterData = await openRouterResponse.json()
    const reportText = openRouterData.choices[0]?.message?.content

    if (!reportText) {
      return NextResponse.json(
        { message: 'No report content generated' },
        { status: 500 }
      )
    }

    // Create new report in database
    const newReport = await db
      .insert(report)
      .values({
        cvId: cvId,
        userId: user.id,
        text: reportText,
      })
      .returning()

    return NextResponse.json({
      message: 'Report generated successfully',
      data: newReport[0],
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
