import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiTrash2 } from 'react-icons/fi';

export default function ManageLectures() {
  const [lectures, setLectures] = useState([]);
  const [subjects, setSubjects] = useState([]);
  // In a full app, you would fetch teachers to populate a dropdown here as well
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

  const fetchData = async () => {
    try {
      const [lecRes, subRes] = await Promise.all([
        api.get('/lectures/all'),
        api.get('/subjects')
      ]);
      setLectures(lecRes.data.data);
      setSubjects(subRes.data.data);
      if (subRes.data.data.length > 0) {
        setFormData(prev => ({ ...prev, subject: subRes.data.data[0]._id }));
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
      if (!formData.teacher || formData.teacher.length !== 24) {
        toast.error('Please enter a valid Teacher ID for now (24-char ObjectID)');
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

      <div className="grid-2" style={{ gap: 'var(--space-6)', alignItems: 'start' }}>
        
        {/* Creator Panel */}
        <div className="card-glass">
          <h2 style={{ fontSize: 'var(--font-lg)', marginBottom: 'var(--space-4)' }}>Schedule New Subject Session</h2>
          <form className="auth-form grid-2" onSubmit={handleCreate}>
            
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Attached Subject</label>
              <select className="form-select" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required>
                <option value="">-- Choose Subject --</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Teacher ObjectId</label>
              <input type="text" className="form-input" placeholder="Paste Teacher's MongoDB _id..." value={formData.teacher} onChange={e => setFormData({...formData, teacher: e.target.value})} required />
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>In production, this would be a dropdown of active teachers.</div>
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
              <input type="date" className="form-input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            </div>

            <div className="form-group">
              <label className="form-label">Starts At</label>
              <input type="time" className="form-input" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} required />
            </div>

            <div className="form-group">
              <label className="form-label">Ends At</label>
              <input type="time" className="form-input" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} required />
            </div>

            <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2' }}>Publish to Timetable</button>
          </form>
        </div>

        {/* Global Timetable */}
        <div className="card-glass flex" style={{ flexDirection: 'column', gap: 'var(--space-3)' }}>
          <h2 style={{ fontSize: 'var(--font-lg)', marginBottom: 'var(--space-2)' }}>Master System Timetable</h2>
          {isLoading ? <p>Pulling system timetable...</p> : lectures.length === 0 ? <p className="text-muted">No scheduled infrastructure found.</p> : (
            lectures.map(lec => (
              <div key={lec._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', borderLeft: `3px solid ${lec.sessionStatus === 'Ended' ? 'var(--text-muted)' : 'var(--accent)'}` }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{lec.subject?.name} <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: 400 }}>(Div {lec.division})</span></div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                    {lec.date.substring(0, 10)} | {lec.startTime} - {lec.endTime}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                  <span className={`badge ${lec.sessionStatus === 'Active' ? 'badge-success' : 'badge-warning'}`}>{lec.sessionStatus}</span>
                  <button onClick={() => handleDelete(lec._id)} className="btn-icon" style={{ color: 'var(--danger)', background: 'transparent', border: 'none' }}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
