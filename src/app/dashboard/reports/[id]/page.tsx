import { drizzle } from 'drizzle-orm/neon-serverless'
import { eq } from 'drizzle-orm'
import { report, cv } from '@/db/schema'
import { stackServerApp } from '@/stack'
import { notFound } from 'next/navigation'

import { ReportClient } from '@/app/components/ReportClient'

const db = drizzle(process.env.DATABASE_URL!)

interface ReportPageProps {
  params: {
    id: string
  }
}

export default async function ReportPage({ params }: ReportPageProps) {
  await stackServerApp.getUser({ or: 'redirect' })
  const par = await params

  const reportId = parseInt(par.id)

  if (isNaN(reportId)) {
    notFound()
  }

  // Get the report with CV data using a join
  const reportData = await db
    .select({
      id: report.id,
      text: report.text,
      createdAt: report.createdAt,
      cvId: report.cvId,
      cvText: cv.text,
    })
    .from(report)
    .innerJoin(cv, eq(cv.id, report.cvId))
    .where(eq(report.id, reportId))
    .limit(1)
  console.log('reportData', reportData)

  // Check if report exists
  if (reportData.length === 0) {
    notFound()
  }

  const reportRecord = reportData[0]

  return <ReportClient reportRecord={reportRecord} />
}

// Generate metadata for the page
export async function generateMetadata({ params }: ReportPageProps) {
  return {
    title: `Report #${params.id} - CV Analysis`,
    description: 'AI-generated CV analysis report',
  }
}
