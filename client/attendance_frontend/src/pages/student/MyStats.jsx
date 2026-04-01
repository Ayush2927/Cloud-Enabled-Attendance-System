import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function MyStats() {
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/attendance/my-stats');
        setStats(res.data.data);
      } catch (err) {
        toast.error('Failed to load attendance statistics');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="page flex justify-center items-center">Loading stats...</div>;
  }

  const overallPercentage = stats.length 
    ? Math.round(stats.reduce((acc, curr) => acc + curr.percentage, 0) / stats.length)
    : 0;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">My Attendance Stats</h1>
        <p className="page-subtitle">Detailed breakdown of your attendance across all registered courses.</p>
      </div>

      <div className="grid-3" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="card-glass">
          <h3 style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', textTransform: 'uppercase' }}>Overall Attendance</h3>
          <div style={{ fontSize: 'var(--font-4xl)', fontWeight: 800, marginTop: 'var(--space-2)', color: overallPercentage >= 75 ? 'var(--success)' : 'var(--danger)' }}>
            {overallPercentage}%
          </div>
        </div>
        <div className="card-glass">
          <h3 style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', textTransform: 'uppercase' }}>Courses At Risk</h3>
          <div style={{ fontSize: 'var(--font-4xl)', fontWeight: 800, marginTop: 'var(--space-2)', color: 'var(--warning)' }}>
            {stats.filter(s => s.status === 'at-risk').length}
          </div>
        </div>
        <div className="card-glass">
          <h3 style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', textTransform: 'uppercase' }}>Total Lectures</h3>
          <div style={{ fontSize: 'var(--font-4xl)', fontWeight: 800, marginTop: 'var(--space-2)' }}>
            {stats.reduce((acc, curr) => acc + curr.total, 0)}
          </div>
        </div>
      </div>

      <div className="table-container card-glass">
        <table className="table">
          <thead>
            <tr>
              <th>Subject Code</th>
              <th>Subject Name</th>
              <th>Lectures Attended</th>
              <th>Total Lectures</th>
              <th>Percentage</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>No attendance records found yet.</td>
              </tr>
            ) : (
              stats.map((stat) => (
                <tr key={stat.subjectId}>
                  <td style={{ fontWeight: 600 }}>{stat.subjectCode}</td>
                  <td>{stat.subjectName}</td>
                  <td>{stat.attended}</td>
                  <td>{stat.total}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <span style={{ width: '40px' }}>{stat.percentage}%</span>
                      <div className="progress-bar" style={{ flex: 1 }}>
                        <div 
                          className={`progress-fill ${stat.percentage >= 75 ? 'progress-safe' : 'progress-risk'}`} 
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${stat.status === 'safe' ? 'badge-success' : 'badge-danger'}`}>
                      {stat.status === 'safe' ? 'Safe (75%+)' : 'At Risk (<75%)'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
