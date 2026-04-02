import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FiClock, FiCheckSquare, FiPieChart, FiSettings, FiHome } from 'react-icons/fi';
import toast from 'react-hot-toast';
import FeatureHub from '../../components/ui/FeatureHub';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [division, setDivision] = useState('SE-B'); // Placeholder default
  const [lectures, setLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const studentFeatures = [
    {
      id: 'student-home',
      title: 'Dashboard',
      description: 'Open your live class timeline and session status.',
      icon: <FiHome size={18} />,
      onClick: () => navigate('/student')
    },
    {
      id: 'student-attendance',
      title: 'Mark Attendance',
      description: 'Launch biometric verification for the active lecture.',
      icon: <FiCheckSquare size={18} />,
      onClick: () => navigate('/student/mark-attendance')
    },
    {
      id: 'student-stats',
      title: 'My Stats',
      description: 'Track attendance percentages and at-risk subjects.',
      icon: <FiPieChart size={18} />,
      onClick: () => navigate('/student/stats')
    },
    {
      id: 'student-settings',
      title: 'Settings',
      description: 'Manage account and password preferences.',
      icon: <FiSettings size={18} />,
      onClick: () => navigate('/settings')
    }
  ];

  // Fetch today's lectures for the selected/default division
  useEffect(() => {
    const fetchTimetable = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/lectures/today?division=${division}`);
        setLectures(res.data.data);
      } catch (err) {
        toast.error('Failed to load today\'s timetable');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTimetable();
  }, [division]);

  return (
    <div className="page animate-fade-in">
      <div className="page-header page-header-row">
        <div>
          <h1 className="page-title">Welcome back, {user?.name.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here is your timeline for today.</p>
        </div>
        
        <div className="filter-row">
          <span className="form-label mb-0">Division:</span>
          <select 
            className="form-select form-select-inline"
            value={division} 
            onChange={e => setDivision(e.target.value)}
          >
            <option value="SE-A">SE-A</option>
            <option value="SE-B">SE-B</option>
            <option value="TE-A">TE-A</option>
          </select>
        </div>
      </div>

      <div className="page-section">
        <h2 className="section-title">Today's Lectures</h2>
        
        {isLoading ? (
          <div className="card-glass animate-pulse skeleton-card"></div>
        ) : lectures.length === 0 ? (
          <div className="card-glass empty-state">
            <h3>No lectures scheduled</h3>
            <p>You have a free day today! Enjoy your off time.</p>
          </div>
        ) : (
          <div className="grid-3">
            {lectures.map((lecture) => (
              <div key={lecture._id} className="card-glass card-col">
                <div className="card-row-between mb-md">
                  <span className={`badge ${
                    lecture.sessionStatus === 'Active' ? 'badge-success' : 
                    lecture.sessionStatus === 'Ended' ? 'badge-info' : 'badge-warning'
                  }`}>
                    {lecture.sessionStatus}
                  </span>
                  <div className="meta-inline">
                    <FiClock /> {lecture.startTime} - {lecture.endTime}
                  </div>
                </div>

                <h3 className="card-title-sm">
                  {lecture.subject.name}
                </h3>
                <p className="card-subtitle mb-lg">
                  Prof. {lecture.teacher.name} • Div {lecture.division}
                </p>

                <div className="card-footer-auto">
                  {lecture.sessionStatus === 'Active' ? (
                    <button 
                      onClick={() => navigate(`/student/mark-attendance/${lecture._id}`)}
                      className="btn btn-primary w-full"
                    >
                      <FiCheckSquare /> Mark Present Now
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="btn btn-secondary w-full"
                    >
                      {lecture.sessionStatus === 'Scheduled' ? 'Waiting to Start' : 'Session Ended'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FeatureHub title="Student Features" items={studentFeatures} />
    </div>
  );
}
