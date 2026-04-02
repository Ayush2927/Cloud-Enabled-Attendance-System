import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ManageSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newSubject, setNewSubject] = useState({ name: '', code: '', semester: 1 });

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

      <div className="grid-2" style={{ gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Create Form */}
        <div className="card-glass">
          <h2 style={{ fontSize: 'var(--font-lg)', marginBottom: 'var(--space-4)' }}>Create New Subject</h2>
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
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Subject</button>
          </form>
        </div>

        {/* Course List */}
        <div className="card-glass flex" style={{ flexDirection: 'column', gap: 'var(--space-3)' }}>
          <h2 style={{ fontSize: 'var(--font-lg)', marginBottom: 'var(--space-2)' }}>Active Subjects</h2>
          {isLoading ? <p>Loading...</p> : subjects.length === 0 ? <p className="text-muted">No subjects exist.</p> : (
            subjects.map(sub => (
              <div key={sub._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{sub.name}</div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{sub.code} • Sem {sub.semester}</div>
                </div>
                <div style={{ fontSize: 'var(--font-sm)', color: 'var(--accent)' }}>
                  {sub.teachers?.length || 0} Teachers
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
