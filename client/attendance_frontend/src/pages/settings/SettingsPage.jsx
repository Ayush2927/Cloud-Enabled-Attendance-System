import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiLock, FiSave, FiShield } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsSaving(true);
    try {
      await api.patch('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FiUser /> },
    { id: 'security', label: 'Security', icon: <FiLock /> },
  ];

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account preferences and security.</p>
      </div>

      <div className="grid-2" style={{ gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Tab Navigation */}
        <div className="card-glass" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-3)' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
                style={{ borderRadius: 'var(--radius-md)' }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="card-glass" style={{ gridColumn: 'span 2' }}>
            <h2 style={{ fontSize: 'var(--font-lg)', marginBottom: 'var(--space-6)' }}>Profile Information</h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'var(--font-3xl)', fontWeight: 700, color: 'var(--text-inverse)',
                flexShrink: 0
              }}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--font-xl)', marginBottom: 'var(--space-1)' }}>{user?.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>{user?.email}</p>
                <span className="badge badge-accent" style={{ marginTop: 'var(--space-2)', display: 'inline-block' }}>
                  {user?.role}
                </span>
              </div>
            </div>

            <div className="grid-2" style={{ gap: 'var(--space-4)' }}>
              <div style={{ padding: 'var(--space-4)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-1)' }}>Full Name</div>
                <div style={{ fontWeight: 600 }}>{user?.name}</div>
              </div>
              <div style={{ padding: 'var(--space-4)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-1)' }}>Email Address</div>
                <div style={{ fontWeight: 600 }}>{user?.email}</div>
              </div>
              <div style={{ padding: 'var(--space-4)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-1)' }}>Role</div>
                <div style={{ fontWeight: 600 }}>{user?.role}</div>
              </div>
              <div style={{ padding: 'var(--space-4)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-1)' }}>Account ID</div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-xs)', fontFamily: 'monospace' }}>{user?._id || user?.id || '—'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="card-glass" style={{ gridColumn: 'span 2', maxWidth: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              <FiShield size={20} color="var(--accent)" />
              <h2 style={{ fontSize: 'var(--font-lg)' }}>Change Password</h2>
            </div>
            
            <form className="auth-form" onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  disabled={isSaving}
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter new password (min 6 chars)"
                  value={passwordData.newPassword}
                  onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  disabled={isSaving}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Re-enter new password"
                  value={passwordData.confirmPassword}
                  onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  disabled={isSaving}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSaving} style={{ width: '100%' }}>
                <FiSave /> {isSaving ? 'Saving...' : 'Update Password'}
              </button>
            </form>

            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-4)' }}>
              Note: Password change requires a valid backend endpoint. If it fails, the endpoint may not be implemented yet on the server.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
