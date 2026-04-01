import { FiUsers, FiBook, FiClock, FiActivity } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  
  // Static summary blocks since a dedicated admin metrics endpoint doesn't exist
  // In a full production app, you'd fetch /api/v1/admin/stats
  const stats = [
    { label: 'Total Subjects', value: '12', icon: <FiBook /> },
    { label: 'Total Lectures', value: '145', icon: <FiClock /> },
    { label: 'Total Students', value: '890', icon: <FiUsers /> },
    { label: 'System Uptime', value: '99.9%', icon: <FiActivity /> },
  ];

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Admin Control Center</h1>
        <p className="page-subtitle">Welcome back, {user?.name}. Manage the entire platform infrastructure.</p>
      </div>

      <div className="grid-3" style={{ marginBottom: 'var(--space-8)' }}>
        {stats.map((stat, idx) => (
          <div key={idx} className="card-glass" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{stat.label}</div>
              <div style={{ fontSize: 'var(--font-3xl)', fontWeight: 800 }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-glass">
        <h2 style={{ fontSize: 'var(--font-lg)', marginBottom: 'var(--space-4)' }}>Quick Actions & Navigation</h2>
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <p style={{ color: 'var(--text-muted)' }}>Use the sidebar menu to navigate strictly to Subject Management, Lecture Creation calendars, or to audit Master Attendance logs for every student session captured by the AI.</p>
        </div>
      </div>
    </div>
  );
}
