import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiBook, FiClock, FiActivity, FiArrowRight, FiHome, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import FeatureHub from '../../components/ui/FeatureHub';

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

  const adminFeatures = [
    {
      id: 'admin-home',
      title: 'Admin Dashboard',
      description: 'Monitor global subjects, sessions, and system status.',
      icon: <FiHome size={18} />,
      onClick: () => navigate('/admin')
    },
    {
      id: 'admin-subjects',
      title: 'Manage Subjects',
      description: 'Create subjects and assign/review teacher mappings.',
      icon: <FiBook size={18} />,
      onClick: () => navigate('/admin/subjects')
    },
    {
      id: 'admin-lectures',
      title: 'Manage Lectures',
      description: 'Create timetable slots and maintain schedule integrity.',
      icon: <FiClock size={18} />,
      onClick: () => navigate('/admin/lectures')
    },
    {
      id: 'admin-logs',
      title: 'System Logs',
      description: 'Review attendance logs and biometric verification history.',
      icon: <FiUsers size={18} />,
      onClick: () => navigate('/admin/logs')
    },
    {
      id: 'admin-settings',
      title: 'Settings',
      description: 'Manage account-level preferences and security.',
      icon: <FiSettings size={18} />,
      onClick: () => navigate('/settings')
    }
  ];

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Admin Control Center</h1>
        <p className="page-subtitle">Welcome back, {user?.name}. Manage the entire platform infrastructure.</p>
      </div>

      <div className="grid-3 page-section-lg">
        {statCards.map((stat, idx) => (
          <div key={idx} className={`card-glass stat-card ${isLoading ? 'animate-pulse' : ''}`}>
            <div className="stat-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-glass page-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="grid-3">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => navigate(action.path)}
              className="card action-card"
              id={`quick-action-${idx}`}
            >
              <div className="action-icon">
                {action.icon}
              </div>
              <div className="action-body">
                <div className="action-title">{action.label}</div>
                <div className="action-description">{action.description}</div>
              </div>
              <FiArrowRight size={16} className="action-arrow" />
            </button>
          ))}
        </div>
      </div>

      <FeatureHub title="Admin Features" items={adminFeatures} />
    </div>
  );
}
