'use client'

import { useForm } from 'react-hook-form'
import { Button, FileUpload } from './ui'
import { useUser } from '@stackframe/stack'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export const UploadPdf = () => {
  const user = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const formMethods = useForm<{
    pdf: File[]
  }>({
    defaultValues: {
      pdf: [],
    },
  })
  const router = useRouter()

  const onSubmit = async (data: any) => {
    if (!data.pdf) {
      console.error('No file selected')
      return
    }
    setIsLoading(true)

    const formData = new FormData()
    formData.append('file', data.pdf[0])
    formData.append('userId', user?.id || '')

    try {
      const res = await fetch('/api/upload-cv', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      router.push(`/dashboard`)
      formMethods.reset()
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={formMethods.handleSubmit(onSubmit)}>
      <FileUpload
        accept=".pdf"
        value={formMethods.watch('pdf')}
        onChange={(files) => formMethods.setValue('pdf', files)}
      />
      <Button type="submit" mt={4}>
        {isLoading ? 'Uploading...' : 'Upload'}
      </Button>
    </form>
  )
}
