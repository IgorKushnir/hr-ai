'use client'

import { useUser } from '@stackframe/stack'
import { Button } from './ui'
import Link from 'next/link'

export const AuthButton = () => {
  const user = useUser()

  return (
    <>
      {user ? (
        <Button onClick={() => user?.signOut()}>Logout</Button>
      ) : (
        <Link href="/handler/sign-in">
          <Button variant="outline">Login</Button>
        </Link>
      )}
    </>
  )
}
