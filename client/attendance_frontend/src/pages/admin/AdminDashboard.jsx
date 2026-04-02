import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiBook, FiClock, FiActivity, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSubjects: '—',
    totalLectures: '—',
    activeSessions: '—',
    endedSessions: '—'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [subjectsRes, lecturesRes] = await Promise.all([
          api.get('/subjects/all'),
          api.get('/lectures/all')
        ]);

        const subjects = subjectsRes.data.data || [];
        const lectures = lecturesRes.data.data || [];
        const active = lectures.filter(l => l.sessionStatus === 'Active').length;
        const ended = lectures.filter(l => l.sessionStatus === 'Ended').length;

        setStats({
          totalSubjects: subjects.length,
          totalLectures: lectures.length,
          activeSessions: active,
          endedSessions: ended
        });
      } catch (err) {
        toast.error('Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Subjects', value: stats.totalSubjects, icon: <FiBook />, color: 'var(--accent)' },
    { label: 'Total Lectures', value: stats.totalLectures, icon: <FiClock />, color: 'var(--info)' },
    { label: 'Active Sessions', value: stats.activeSessions, icon: <FiActivity />, color: 'var(--success)' },
    { label: 'Ended Sessions', value: stats.endedSessions, icon: <FiUsers />, color: 'var(--warning)' },
  ];

  const quickActions = [
    { label: 'Manage Subjects', description: 'Create and view course curricula', path: '/admin/subjects', icon: <FiBook size={20} /> },
    { label: 'Schedule Lectures', description: 'Assign instructors and time slots', path: '/admin/lectures', icon: <FiClock size={20} /> },
    { label: 'Attendance Logs', description: 'Audit biometric verification records', path: '/admin/logs', icon: <FiUsers size={20} /> },
  ];

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Admin Control Center</h1>
        <p className="page-subtitle">Welcome back, {user?.name}. Manage the entire platform infrastructure.</p>
      </div>

      <div className="grid-3" style={{ marginBottom: 'var(--space-8)' }}>
        {statCards.map((stat, idx) => (
          <div key={idx} className={`card-glass ${isLoading ? 'animate-pulse' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{stat.label}</div>
              <div style={{ fontSize: 'var(--font-3xl)', fontWeight: 800 }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-glass" style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--font-lg)', marginBottom: 'var(--space-4)' }}>Quick Actions</h2>
        <div className="grid-3" style={{ gap: 'var(--space-4)' }}>
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => navigate(action.path)}
              className="card"
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                cursor: 'pointer', textAlign: 'left', width: '100%',
                padding: 'var(--space-4)', transition: 'all var(--transition-base)'
              }}
              id={`quick-action-${idx}`}
            >
              <div style={{
                width: '42px', height: '42px', borderRadius: 'var(--radius-md)',
                background: 'var(--accent-light)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--accent)',
                flexShrink: 0
              }}>
                {action.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)', marginBottom: '2px' }}>{action.label}</div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{action.description}</div>
              </div>
              <FiArrowRight size={16} color="var(--text-muted)" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
