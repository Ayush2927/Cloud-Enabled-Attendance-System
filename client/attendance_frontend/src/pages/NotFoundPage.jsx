import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="empty-state">
      <h1 style={{ fontSize: '4rem', color: 'var(--accent)', marginBottom: '1rem' }}>404</h1>
      <h3>Page Not Found</h3>
      <p style={{ marginBottom: '2rem' }}>The page you are looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">Go to Home</Link>
    </div>
  );
}
