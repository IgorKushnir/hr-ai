import { drizzle } from 'drizzle-orm/neon-serverless'
import { eq } from 'drizzle-orm'
import { cv, report } from '@/db/schema'
import { stackServerApp } from '@/stack'
import { ApplicantsTableClient } from './ApplicantsTableClient'
import { Box, Text } from '@chakra-ui/react'

const db = drizzle(process.env.DATABASE_URL!)

export const ApplicantsTable = async () => {
  try {
    // Get the current user from Stack authentication
    const user = await stackServerApp.getUser({ or: 'redirect' })

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

    // Pass the fetched data to the client component
    return <ApplicantsTableClient cvs={userCVs} />
  } catch (error) {
    console.error('Error retrieving CVs:', error)
    return (
      <Box
        p={4}
        borderRadius="md"
        bg="red.50"
        border="1px solid"
        borderColor="red.200"
      >
        <Text fontSize="sm" color="red.800">
          <strong>Error:</strong> Failed to load CVs. Please try again later.
        </Text>
      </Box>
    )
  }
}
