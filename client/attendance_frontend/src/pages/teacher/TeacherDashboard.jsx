import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FiClock, FiUsers, FiPlayCircle, FiStopCircle, FiHome, FiSettings } from 'react-icons/fi';
import toast from 'react-hot-toast';
import FeatureHub from '../../components/ui/FeatureHub';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const teacherFeatures = [
    {
      id: 'teacher-home',
      title: 'Dashboard & Sessions',
      description: 'Manage scheduled sessions and attendance shifts.',
      icon: <FiHome size={18} />,
      onClick: () => navigate('/teacher')
    },
    {
      id: 'teacher-settings',
      title: 'Settings',
      description: 'Update account security and profile preferences.',
      icon: <FiSettings size={18} />,
      onClick: () => navigate('/settings')
    }
  ];

  const fetchMyLectures = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/lectures/my-today');
      setLectures(res.data.data);
    } catch (err) {
      toast.error('Failed to load today\'s lectures');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLectures();
  }, []);

  const handleShiftChange = async (lectureId, newStatus) => {
    try {
      await api.post('/attendance/teacher/shift', {
        lectureId,
        status: newStatus
      });
      toast.success(`Session ${newStatus === 'Active' ? 'started' : 'ended'} successfully`);
      fetchMyLectures(); // Refresh the list
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update session status';
      toast.error(msg);
    }
  };

  return (
    <div className="page animate-fade-in">
      <div className="page-header page-header-row">
        <div>
          <h1 className="page-title">Welcome, Prof. {user?.name.split(' ')[0]}</h1>
          <p className="page-subtitle">Manage your sessions and track student attendance.</p>
        </div>
      </div>

      <div className="page-section">
        <h2 className="section-title">Your Schedule for Today</h2>
        
        {isLoading ? (
          <div className="card-glass animate-pulse skeleton-card"></div>
        ) : lectures.length === 0 ? (
          <div className="card-glass empty-state">
            <h3>No lectures assigned today</h3>
            <p>You have a free schedule! Use your time well.</p>
          </div>
        ) : (
          <div className="grid-2">
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

                <h3 className="card-title-md">
                  {lecture.subject.name} ({lecture.subject.code})
                </h3>
                <p className="card-subtitle mb-lg">
                  Division {lecture.division} • Room: TBA
                </p>

                <div className="card-footer-auto row-actions">
                  {lecture.sessionStatus === 'Scheduled' && (
                    <button 
                      onClick={() => handleShiftChange(lecture._id, 'Active')}
                      className="btn btn-primary flex-1"
                    >
                      <FiPlayCircle size={18} /> Start Session
                    </button>
                  )}
                  {lecture.sessionStatus === 'Active' && (
                    <button 
                      onClick={() => handleShiftChange(lecture._id, 'Ended')}
                      className="btn btn-danger flex-1"
                    >
                      <FiStopCircle size={18} /> End Session & Lock
                    </button>
                  )}
                  {lecture.sessionStatus === 'Ended' && (
                    <button 
                      disabled
                      className="btn btn-secondary flex-1"
                    >
                      Session Closed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card-glass grid-2">
        <div>
          <h3 className="section-title-sm">Quick Tips</h3>
          <ul className="tips-list">
            <li>Click <strong>Start Session</strong> when you enter the physical classroom.</li>
            <li>Once started, students will see the 'Mark Present' button on their dashboards.</li>
            <li>Click <strong>End Session</strong> right before leaving. Any student who didn't biometric-scan will be auto-marked absent.</li>
          </ul>
        </div>
      </div>

      <FeatureHub title="Teacher Features" items={teacherFeatures} />
    </div>
  );
}
