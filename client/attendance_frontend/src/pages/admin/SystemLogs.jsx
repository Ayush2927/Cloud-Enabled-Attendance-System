import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiHome, FiBook, FiClock, FiUsers, FiSettings } from 'react-icons/fi';
import FeatureHub from '../../components/ui/FeatureHub';

export default function SystemLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const adminFeatures = [
    { id: 'admin-home', title: 'Admin Dashboard', description: 'Return to the system control center.', icon: <FiHome size={18} />, onClick: () => navigate('/admin') },
    { id: 'admin-subjects', title: 'Manage Subjects', description: 'Create subjects and review teacher assignments.', icon: <FiBook size={18} />, onClick: () => navigate('/admin/subjects') },
    { id: 'admin-lectures', title: 'Manage Lectures', description: 'Build the timetable and assign instructors.', icon: <FiClock size={18} />, onClick: () => navigate('/admin/lectures') },
    { id: 'admin-logs', title: 'System Logs', description: 'Inspect attendance and biometric activity.', icon: <FiUsers size={18} />, onClick: () => navigate('/admin/logs') },
    { id: 'admin-settings', title: 'Settings', description: 'Adjust security and account preferences.', icon: <FiSettings size={18} />, onClick: () => navigate('/settings') }
  ];

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/attendance/admin/all-logs');
        setLogs(res.data.data);
      } catch (err) {
        toast.error('Failed to load system logs');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (isLoading) {
    return <div className="page flex justify-center items-center">Loading audit logs...</div>;
  }

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Master Attendance Logs</h1>
        <p className="page-subtitle">Security audit trail of all biometric verifications and automated absence triggers.</p>
      </div>

      <div className="table-container card-glass">
        <table className="table">
          <thead>
            <tr>
              <th>Timestamp (IST)</th>
              <th>Student</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Biometric Proof</th>
              <th>Check-Out</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="6" className="table-empty-cell">No system logs recorded yet.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id}>
                  <td>{log.dateIST}</td>
                  <td className="table-main-cell">{log.user?.name} <span className="table-subtext">{log.user?.email}</span></td>
                  <td>{log.subject?.name} <span className="table-inline-subtext">(Div {log.lecture?.division})</span></td>
                  <td>
                    <span className={`badge ${log.status === 'Present' ? 'badge-success' : 'badge-danger'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td>
                    {log.status === 'Present' ? (
                      log.hasFaceProof ? <span className="proof-ok">Captured</span> : <span className="proof-missing">Missing</span>
                    ) : (
                      <span className="proof-na">N/A</span>
                    )}
                  </td>
                  <td className="table-muted-cell">{log.checkOutIST}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <FeatureHub title="Admin Features" items={adminFeatures} />
    </div>
  );
}
