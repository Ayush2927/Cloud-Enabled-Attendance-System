import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiBell, FiUser } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header style={{
      height: 'var(--navbar-height)',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--space-6)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="flex items-center gap-4">
        {/* Mobile menu could be triggered here */}
        <button className="btn-icon">
          <FiMenu size={20} />
        </button>
        <Link to="/" style={{ color: 'var(--accent)', fontWeight: 800, fontSize: 'var(--font-xl)', letterSpacing: '-0.02em' }}>
          AttendEase
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <button className="btn-icon">
          <FiBell size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>{user?.name}</span>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{user?.role}</span>
          </div>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-elevated)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--accent)'
          }}>
            <FiUser size={18} color="var(--accent)" />
          </div>
          <button onClick={logout} className="btn btn-ghost btn-sm" style={{ marginLeft: '8px' }}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
