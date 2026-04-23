import { Navigate } from 'react-router-dom'

export default function AdminDashboard() {
  // To keep things simple and avoid duplicating UI, 
  // the main dashboard just acts as a forwarder to the stats page
  // as stats provides the required 4 metric cards requested in TDD.
  return <Navigate to="/admin/stats" replace />
}
