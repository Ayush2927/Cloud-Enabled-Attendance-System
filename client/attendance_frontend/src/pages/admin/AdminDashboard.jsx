import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiBook, FiClock, FiActivity, FiArrowRight, FiHome, FiSettings, FiFolder } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import toast from 'react-hot-toast';
import FeatureHub from '@/components/ui/FeatureHub';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
    { label: 'Total Subjects', value: stats.totalSubjects, icon: <FiBook className="w-5 h-5" />, color: 'var(--accent)' },
    { label: 'Total Lectures', value: stats.totalLectures, icon: <FiClock className="w-5 h-5" />, color: 'var(--info)' },
    { label: 'Active Sessions', value: stats.activeSessions, icon: <FiActivity className="w-5 h-5" />, color: 'var(--success)' },
    { label: 'Ended Sessions', value: stats.endedSessions, icon: <FiUsers className="w-5 h-5" />, color: 'var(--warning)' },
  ];

  const quickActions = [
    { label: 'Manage Subjects', description: 'Create and view course curricula', path: '/admin/subjects', icon: <FiBook size={24} className="text-primary group-hover:scale-110 transition-transform" /> },
    { label: 'Schedule Lectures', description: 'Assign instructors and time slots', path: '/admin/lectures', icon: <FiClock size={24} className="text-primary group-hover:scale-110 transition-transform" /> },
    { label: 'Attendance Logs', description: 'Audit biometric verification records', path: '/admin/logs', icon: <FiFolder size={24} className="text-primary group-hover:scale-110 transition-transform" /> },
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
    <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Control Center</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}. Manage the entire platform infrastructure.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <Card key={idx} className={`border-border/50 bg-secondary/5 overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-md ${isLoading ? 'animate-pulse' : ''}`}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary shrink-0">
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground border-b border-border/50 pb-2">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, idx) => (
            <Card 
              key={idx} 
              className="group cursor-pointer border-border/50 bg-card hover:bg-secondary/10 hover:border-primary/30 transition-all duration-300"
              onClick={() => navigate(action.path)}
            >
              <CardContent className="p-6 flex flex-col items-start h-full">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 transition-colors group-hover:bg-primary/20">
                  {action.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{action.label}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
                <div className="mt-6 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                  Go to module <FiArrowRight className="ml-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <FeatureHub title="Admin Features" items={adminFeatures} />
    </div>
  );
}
