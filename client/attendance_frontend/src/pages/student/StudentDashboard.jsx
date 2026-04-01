import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FiClock, FiCheckSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [division, setDivision] = useState('SE-B'); // Placeholder default
  const [lectures, setLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
      <div className="page-header flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 className="page-title">Welcome back, {user?.name.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here is your timeline for today.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span className="form-label mb-0">Division:</span>
          <select 
            className="form-select" 
            style={{ width: 'auto', minWidth: '120px' }}
            value={division} 
            onChange={e => setDivision(e.target.value)}
          >
            <option value="SE-A">SE-A</option>
            <option value="SE-B">SE-B</option>
            <option value="TE-A">TE-A</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--font-xl)', marginBottom: 'var(--space-4)' }}>Today's Lectures</h2>
        
        {isLoading ? (
          <div className="card-glass animate-pulse" style={{ height: '150px' }}></div>
        ) : lectures.length === 0 ? (
          <div className="card-glass empty-state">
            <h3>No lectures scheduled</h3>
            <p>You have a free day today! Enjoy your off time.</p>
          </div>
        ) : (
          <div className="grid-3">
            {lectures.map((lecture) => (
              <div key={lecture._id} className="card-glass" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-4)' }}>
                  <span className={`badge ${
                    lecture.sessionStatus === 'Active' ? 'badge-success' : 
                    lecture.sessionStatus === 'Ended' ? 'badge-info' : 'badge-warning'
                  }`}>
                    {lecture.sessionStatus}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
                    <FiClock /> {lecture.startTime} - {lecture.endTime}
                  </div>
                </div>

                <h3 style={{ fontSize: 'var(--font-lg)', marginBottom: 'var(--space-1)' }}>
                  {lecture.subject.name}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-6)' }}>
                  Prof. {lecture.teacher.name} • Div {lecture.division}
                </p>

                <div style={{ marginTop: 'auto' }}>
                  {lecture.sessionStatus === 'Active' ? (
                    <button 
                      onClick={() => navigate(`/student/mark-attendance/${lecture._id}`)}
                      className="btn btn-primary" 
                      style={{ width: '100%' }}
                    >
                      <FiCheckSquare /> Mark Present Now
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="btn btn-secondary" 
                      style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed' }}
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
    </div>
  );
}
