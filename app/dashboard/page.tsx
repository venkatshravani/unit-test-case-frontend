import DashboardContent from '@/components/dashboard/dashboard-content'

export default function DashboardPage() {
  // For now, fetch from the layout context via props
  // The layout will pass these down
  return (
    <DashboardContent assignedCustomers={[]} userEmail={undefined} />
  )
}
