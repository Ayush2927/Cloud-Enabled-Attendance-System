import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiTrash2, FiHome, FiBook, FiClock, FiUsers, FiSettings } from 'react-icons/fi';
import FeatureHub from '../../components/ui/FeatureHub';

export default function ManageLectures() {
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    subject: '',
    teacher: '', // Requires a valid Teacher MongoDB ObjectId
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    division: 'SE-A'
  });

  const adminFeatures = [
    { id: 'admin-home', title: 'Admin Dashboard', description: 'Return to the system control center.', icon: <FiHome size={18} />, onClick: () => navigate('/admin') },
    { id: 'admin-subjects', title: 'Manage Subjects', description: 'Create subjects and review teacher assignments.', icon: <FiBook size={18} />, onClick: () => navigate('/admin/subjects') },
    { id: 'admin-lectures', title: 'Manage Lectures', description: 'Build the timetable and assign instructors.', icon: <FiClock size={18} />, onClick: () => navigate('/admin/lectures') },
    { id: 'admin-logs', title: 'System Logs', description: 'Inspect attendance and biometric activity.', icon: <FiUsers size={18} />, onClick: () => navigate('/admin/logs') },
    { id: 'admin-settings', title: 'Settings', description: 'Adjust security and account preferences.', icon: <FiSettings size={18} />, onClick: () => navigate('/settings') }
  ];

  const fetchData = async () => {
    try {
      const [lecRes, subRes, teachRes] = await Promise.all([
        api.get('/lectures/all'),
        api.get('/subjects/all'),
        api.get('/auth/teachers')
      ]);
      setLectures(lecRes.data.data);
      setSubjects(subRes.data.data);
      setTeachers(teachRes.data.data);
      
      if (subRes.data.data.length > 0) {
        setFormData(prev => ({ ...prev, subject: subRes.data.data[0]._id }));
      }
      if (teachRes.data.data.length > 0) {
        setFormData(prev => ({ ...prev, teacher: teachRes.data.data[0]._id }));
      }
    } catch (err) {
      toast.error('Failed to load data from server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (!formData.teacher) {
        toast.error('Please select a teacher from the dropdown. If none, register a teacher first.');
        return;
      }
      await api.post('/lectures/create', formData);
      toast.success('Lecture explicitly scheduled!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Warning: Failed to create lecture');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this lecture from the timetable?')) return;
    try {
      await api.delete(`/lectures/${id}`);
      toast.success('Lecture successfully wiped from schedule');
      setLectures(lectures.filter(l => l._id !== id));
    } catch (error) {
      toast.error('Failed to delete lecture');
    }
  };

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Timetable Configuration</h1>
        <p className="page-subtitle">Master schedule planning interface. Assign instructors dynamically.</p>
      </div>

      <div className="grid-2 page-grid-top">
        
        {/* Creator Panel */}
        <div className="card-glass">
          <h2 className="section-title">Schedule New Subject Session</h2>
          <form className="auth-form grid-2" onSubmit={handleCreate}>
            
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Attached Subject</label>
              <select className="form-select" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required>
                <option value="">-- Choose Subject --</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Instructor (Teacher)</label>
              <select className="form-select" value={formData.teacher} onChange={e => setFormData({...formData, teacher: e.target.value})} required>
                <option value="">-- Choose Instructor --</option>
                {teachers.map(t => <option key={t._id} value={t._id}>{t.name} ({t.email})</option>)}
              </select>
              {teachers.length === 0 && (
                <div className="input-warning-text">
                  No teachers found. You must register a Teacher account before scheduling.
                </div>
              )}
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Target Division</label>
              <select className="form-select" value={formData.division} onChange={e => setFormData({...formData, division: e.target.value})}>
                <option>SE-A</option><option>SE-B</option>
                <option>TE-A</option><option>TE-B</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Session Date</label>
                <input type="date" className="form-input" min={new Date().toISOString().split('T')[0]} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />              </div>            <div className="form-group">
              <label className="form-label">Starts At</label>
              <input type="time" className="form-input" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} required />
            </div>

            <div className="form-group">
              <label className="form-label">Ends At</label>
              <input type="time" className="form-input" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} required />
            </div>

            <button type="submit" className="btn btn-primary span-2">Publish to Timetable</button>
          </form>
        </div>

        {/* Global Timetable */}
        <div className="card-glass stack-sm">
          <h2 className="section-title-sm">Master System Timetable</h2>
          {isLoading ? <p>Pulling system timetable...</p> : lectures.length === 0 ? <p className="text-muted">No scheduled infrastructure found.</p> : (
            lectures.map(lec => (
              <div key={lec._id} className="list-item" style={{ borderLeftColor: lec.sessionStatus === 'Ended' ? 'var(--text-muted)' : 'var(--accent)' }}>
                <div>
                  <div className="list-item-title">{lec.subject?.name} <span className="list-item-subtle">(Div {lec.division})</span></div>
                  <div className="list-item-subtitle">
                    {lec.date.substring(0, 10)} | {lec.startTime} - {lec.endTime}
                  </div>
                </div>
                <div className="row-actions">
                  <span className={`badge ${lec.sessionStatus === 'Active' ? 'badge-success' : 'badge-warning'}`}>{lec.sessionStatus}</span>
                  <button onClick={() => handleDelete(lec._id)} className="btn-icon row-delete-btn">
                    <FiTrash2 />
                  </button>
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
