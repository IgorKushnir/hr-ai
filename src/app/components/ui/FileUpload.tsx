'use client'

import React, { useRef, useState } from 'react'
import {
  Box,
  Button,
  Text,
  Stack,
  HStack,
  Icon,
  CloseButton
} from '@chakra-ui/react'
import { FiUpload, FiFile, FiX } from 'react-icons/fi'

export interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number // in bytes
  value?: File[] // Controlled value
  onChange?: (files: File[]) => void // Controlled onChange
  onFileSelect?: (files: File[]) => void // Legacy prop for backward compatibility
  onUpload?: (files: File[]) => Promise<void>
  isLoading?: boolean
  disabled?: boolean
  children?: React.ReactNode
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept = '.pdf',
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB
  value, // Controlled value
  onChange, // Controlled onChange
  onFileSelect, // Legacy prop
  onUpload,
  isLoading = false,
  disabled = false,
  children
}) => {
  // Use internal state only when not controlled
  const [internalFiles, setInternalFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Determine if component is controlled
  const isControlled = value !== undefined
  const selectedFiles = isControlled ? value : internalFiles

  const borderColor = dragActive ? 'blue.500' : 'gray.300'
  const bgColor = dragActive ? 'blue.50' : 'gray.50'

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `File size must be less than ${formatFileSize(maxSize)}`
    }
    return null
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const updateFiles = (newFiles: File[]) => {
    if (isControlled) {
      // Controlled mode: call onChange
      onChange?.(newFiles)
    } else {
      // Uncontrolled mode: update internal state
      setInternalFiles(newFiles)
    }
    // Call legacy callback for backward compatibility
    onFileSelect?.(newFiles)
  }

  const handleFiles = (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    const validFiles: File[] = []
    let errorMessage: string | null = null

    for (const file of fileArray) {
      const validation = validateFile(file)
      if (validation) {
        errorMessage = validation
        break
      }
      validFiles.push(file)
    }

    if (errorMessage) {
      setError(errorMessage)
      return
    }

    setError(null)
    const newFiles = multiple ? [...selectedFiles, ...validFiles] : validFiles
    updateFiles(newFiles)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled || isLoading) return
    
    handleFiles(e.dataTransfer.files)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    updateFiles(newFiles)
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !onUpload) return
    
    try {
      await onUpload(selectedFiles)
      // Clear files after successful upload
      updateFiles([])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  const openFileDialog = () => {
    if (inputRef.current && !disabled && !isLoading) {
      inputRef.current.click()
    }
  }

  return (
    <Stack gap={4} w="full">
      <Box
        w="full"
        border="2px dashed"
        borderColor={borderColor}
        borderRadius="lg"
        p={8}
        textAlign="center"
        cursor={disabled || isLoading ? 'not-allowed' : 'pointer'}
        bg={bgColor}
        transition="all 0.2s"
        _hover={{
          borderColor: !disabled && !isLoading ? 'blue.400' : borderColor,
          bg: !disabled && !isLoading && !dragActive ? 'gray.100' : undefined
        }}
        opacity={disabled ? 0.6 : 1}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          style={{ display: 'none' }}
          disabled={disabled || isLoading}
        />

        <Stack gap={4} align="center">
          <Icon boxSize={12} color="gray.400">
            <FiUpload />
          </Icon>
          
          {children || (
            <Stack gap={2} align="center">
              <Text fontSize="lg" fontWeight="medium">
                Drop files here or click to browse
              </Text>
              <Text fontSize="sm" color="gray.500">
                {accept ? `Accepted formats: ${accept}` : 'All file types accepted'}
                {maxSize && ` • Max size: ${formatFileSize(maxSize)}`}
              </Text>
            </Stack>
          )}
        </Stack>
      </Box>

      {error && (
        <Box
          p={4}
          borderRadius="md"
          bg="red.50"
          border="1px solid"
          borderColor="red.200"
        >
          <HStack>
            <Text fontSize="sm" color="red.800" flex={1}>
              <strong>Upload Error:</strong> {error}
            </Text>
            <CloseButton
              size="sm"
              onClick={() => setError(null)}
            />
          </HStack>
        </Box>
      )}

      {selectedFiles.length > 0 && (
        <Stack gap={2} w="full">
          <Text fontSize="sm" fontWeight="medium">
            Selected Files ({selectedFiles.length})
          </Text>
          
          {selectedFiles.map((file, index) => (
            <HStack
              key={`${file.name}-${index}`}
              w="full"
              p={3}
              border="1px solid"
              borderColor="gray.300"
              borderRadius="md"
              bg="white"
            >
              <Icon color="blue.500">
                <FiFile />
              </Icon>
              <Stack gap={0} flex={1}>
                <Text fontSize="sm" fontWeight="medium" truncate>
                  {file.name}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {formatFileSize(file.size)}
                </Text>
              </Stack>
              <Button
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={() => removeFile(index)}
                disabled={isLoading}
              >
                <Icon>
                  <FiX />
                </Icon>
              </Button>
            </HStack>
          ))}

          {onUpload && (
            <Button
              colorScheme="blue"
              onClick={handleUpload}
              loading={isLoading}
              loadingText="Uploading..."
              disabled={selectedFiles.length === 0}
              w="full"
              mt={2}
            >
              Upload {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}
            </Button>
          )}

          {isLoading && (
            <Box w="full" h="2" bg="gray.200" borderRadius="full" overflow="hidden">
              <Box
                h="full"
                bg="blue.500"
                borderRadius="full"
                animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
              />
            </Box>
          )}
        </Stack>
      )}
    </Stack>
  )
}
