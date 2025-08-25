import {
  Box,
  Heading,
  Text,
  Card,
  Badge,
  VStack,
  Separator,
} from '@chakra-ui/react'

export const ReportClient = ({
  reportRecord,
}: {
  reportRecord: {
    id: number
    text: string
    createdAt: Date
    cvId: number
    cvText: string
  }
}) => (
  <Box maxW="4xl" mx="auto" p={6}>
    <VStack align="stretch" gap={6}>
      {/* Header */}
      <Box>
        <Heading size="2xl" mb={2}>
          CV Analysis Report
        </Heading>
      </Box>

      {/* Report Info */}
      <Card.Root p={4}>
        <Card.Body>
          <VStack align="stretch" gap={3}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Text fontSize="sm" color="gray.500">
                Report ID: #{reportRecord.id}
              </Text>
              <Badge colorScheme="green">Generated</Badge>
            </Box>

            <Text fontSize="sm" color="gray.500">
              Created:{' '}
              {new Date(reportRecord.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </VStack>
        </Card.Body>
      </Card.Root>

      <Separator />

      <Card.Root>
        <Card.Header>
          <Heading size="lg">Analysis Results</Heading>
        </Card.Header>
        <Card.Body>
          <Box
            whiteSpace="pre-wrap"
            lineHeight="1.7"
            fontSize="md"
            color="gray.700"
          >
            {reportRecord.text}
          </Box>
        </Card.Body>
      </Card.Root>

      <Separator />

      <Card.Root>
        <Card.Header>
          <Heading size="lg">RAW data</Heading>
        </Card.Header>
        <Card.Body>
          <Box
            whiteSpace="pre-wrap"
            lineHeight="1.7"
            fontSize="md"
            color="gray.700"
          >
            {reportRecord.cvText}
          </Box>
        </Card.Body>
      </Card.Root>
    </VStack>
  </Box>
)
