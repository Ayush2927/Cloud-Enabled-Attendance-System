import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FiClock, FiUsers, FiPlayCircle, FiStopCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [lectures, setLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
      <div className="page-header flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 className="page-title">Welcome, Prof. {user?.name.split(' ')[0]}</h1>
          <p className="page-subtitle">Manage your sessions and track student attendance.</p>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--font-xl)', marginBottom: 'var(--space-4)' }}>Your Schedule for Today</h2>
        
        {isLoading ? (
          <div className="card-glass animate-pulse" style={{ height: '150px' }}></div>
        ) : lectures.length === 0 ? (
          <div className="card-glass empty-state">
            <h3>No lectures assigned today</h3>
            <p>You have a free schedule! Use your time well.</p>
          </div>
        ) : (
          <div className="grid-2">
            {lectures.map((lecture) => (
              <div key={lecture._id} className="card-glass" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-4)' }}>
                  <span className={`badge ${
                    lecture.sessionStatus === 'Active' ? 'badge-success' : 
                    lecture.sessionStatus === 'Ended' ? 'badge-info' : 'badge-warning'
                  }`}>
                    {lecture.sessionStatus}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
                    <FiClock /> {lecture.startTime} - {lecture.endTime}
                  </div>
                </div>

                <h3 style={{ fontSize: 'var(--font-xl)', marginBottom: 'var(--space-1)' }}>
                  {lecture.subject.name} ({lecture.subject.code})
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-md)', marginBottom: 'var(--space-6)' }}>
                  Division {lecture.division} • Room: TBA
                </p>

                <div style={{ marginTop: 'auto', display: 'flex', gap: 'var(--space-3)' }}>
                  {lecture.sessionStatus === 'Scheduled' && (
                    <button 
                      onClick={() => handleShiftChange(lecture._id, 'Active')}
                      className="btn btn-primary" 
                      style={{ flex: 1 }}
                    >
                      <FiPlayCircle size={18} /> Start Session
                    </button>
                  )}
                  {lecture.sessionStatus === 'Active' && (
                    <button 
                      onClick={() => handleShiftChange(lecture._id, 'Ended')}
                      className="btn btn-danger" 
                      style={{ flex: 1 }}
                    >
                      <FiStopCircle size={18} /> End Session & Lock
                    </button>
                  )}
                  {lecture.sessionStatus === 'Ended' && (
                    <button 
                      disabled
                      className="btn btn-secondary" 
                      style={{ flex: 1, opacity: 0.5, cursor: 'not-allowed' }}
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

      <div className="card-glass grid-2" style={{ gap: 'var(--space-6)' }}>
        <div>
          <h3>Quick Tips</h3>
          <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', marginTop: 'var(--space-3)', lineHeight: 1.6 }}>
            <li>Click <strong>Start Session</strong> when you enter the physical classroom.</li>
            <li>Once started, students will see the 'Mark Present' button on their dashboards.</li>
            <li>Click <strong>End Session</strong> right before leaving. Any student who didn't biometric-scan will be auto-marked absent.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
