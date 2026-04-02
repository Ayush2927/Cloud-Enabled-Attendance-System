import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiHome, FiBook, FiClock, FiUsers, FiSettings } from 'react-icons/fi';
import FeatureHub from '../../components/ui/FeatureHub';

export default function ManageSubjects() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newSubject, setNewSubject] = useState({ name: '', code: '', semester: 1 });

  const adminFeatures = [
    { id: 'admin-home', title: 'Admin Dashboard', description: 'Return to the system control center.', icon: <FiHome size={18} />, onClick: () => navigate('/admin') },
    { id: 'admin-subjects', title: 'Manage Subjects', description: 'Create subjects and review teacher assignments.', icon: <FiBook size={18} />, onClick: () => navigate('/admin/subjects') },
    { id: 'admin-lectures', title: 'Manage Lectures', description: 'Build the timetable and assign instructors.', icon: <FiClock size={18} />, onClick: () => navigate('/admin/lectures') },
    { id: 'admin-logs', title: 'System Logs', description: 'Inspect attendance and biometric activity.', icon: <FiUsers size={18} />, onClick: () => navigate('/admin/logs') },
    { id: 'admin-settings', title: 'Settings', description: 'Adjust security and account preferences.', icon: <FiSettings size={18} />, onClick: () => navigate('/settings') }
  ];

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects/all');
      setSubjects(res.data.data);
    } catch (err) {
      toast.error('Failed to load subjects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/subjects/create', newSubject);
      toast.success('Subject created successfully!');
      setNewSubject({ name: '', code: '', semester: 1 });
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create subject');
    }
  };

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Manage Subjects</h1>
        <p className="page-subtitle">Create organizational course curricula and assign registered teachers.</p>
      </div>

      <div className="grid-2 page-grid-top">
        {/* Create Form */}
        <div className="card-glass">
          <h2 className="section-title">Create New Subject</h2>
          <form className="auth-form" onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Subject Code</label>
              <input type="text" className="form-input" placeholder="e.g. CS101" value={newSubject.code} onChange={e => setNewSubject({...newSubject, code: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Subject Name</label>
              <input type="text" className="form-input" placeholder="e.g. Cloud Computing" value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Semester</label>
              <input type="number" className="form-input" min="1" max="8" value={newSubject.semester} onChange={e => setNewSubject({...newSubject, semester: e.target.value})} required />
            </div>
            <button type="submit" className="btn btn-primary w-full">Create Subject</button>
          </form>
        </div>

        {/* Course List */}
        <div className="card-glass stack-sm">
          <h2 className="section-title-sm">Active Subjects</h2>
          {isLoading ? <p>Loading...</p> : subjects.length === 0 ? <p className="text-muted">No subjects exist.</p> : (
            subjects.map(sub => (
              <div key={sub._id} className="list-item">
                <div>
                  <div className="list-item-title">{sub.name}</div>
                  <div className="list-item-subtitle">{sub.code} • Sem {sub.semester}</div>
                </div>
                <div className="list-item-accent">
                  {sub.teachers?.length || 0} Teachers
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <FeatureHub title="Admin Features" items={adminFeatures} />
    </div>
  );
}
