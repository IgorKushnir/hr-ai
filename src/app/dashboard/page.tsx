import { stackServerApp } from '@/stack'
import { ApplicantsTable } from '../components/ApplicantsTable'

export default async function DashboardPage() {
  await stackServerApp.getUser({ or: 'redirect' })

  return (
    <div>
      <h1>Dashboard</h1>
      <ApplicantsTable />
    </div>
  )
}
