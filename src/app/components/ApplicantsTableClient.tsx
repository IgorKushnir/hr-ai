'use client'

import React from 'react'
import { Table, Button, Box, Text } from '@chakra-ui/react'
import { CVWithReport } from '@/db/schema'
import Link from 'next/link'
import { useState } from 'react'

interface ApplicantsTableClientProps {
  cvs: CVWithReport[]
}

export const ApplicantsTableClient: React.FC<ApplicantsTableClientProps> = ({
  cvs,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [clientCvs, setClientCvs] = useState<CVWithReport[]>(cvs)

  const generateReport = async (cvId: number) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cvId }),
      })

      const result = await response.json()

      if (response.ok) {
        setClientCvs((prevCvs) =>
          prevCvs.map((cv) =>
            cv.id === cvId ? { ...cv, reportId: result.data.id } : cv
          )
        )
      } else {
        console.error('Error:', result.message)
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error:', error?.message)
      }
    } finally {
        setIsLoading(false)
    }
  }

  if (cvs.length === 0) {
    return (
      <Box textAlign="center" p={8}>
        <Text fontSize="lg" color="gray.500">
          No CVs found. Upload your first CV to get started.
        </Text>
      </Box>
    )
  }

  return (
    <Box overflowX="auto">
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>ID</Table.ColumnHeader>
            <Table.ColumnHeader>File Name</Table.ColumnHeader>
            <Table.ColumnHeader>Action</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {clientCvs.map((cv) => (
            <Table.Row key={cv.id}>
              <Table.Cell>{cv.id}</Table.Cell>
              <Table.Cell>
                <Text truncate maxW="300px">
                  {cv.fileName}
                </Text>
              </Table.Cell>
              <Table.Cell>
                {cv.reportId ? (
                  <Link href={`/dashboard/reports/${cv.reportId}`} passHref>
                    <Button size="sm" colorScheme="blue">
                      View Report
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => generateReport(cv.id)}
                  >
                   {isLoading ? 'Generating Report...' : 'Generate Report'}
                  </Button>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  )
}
