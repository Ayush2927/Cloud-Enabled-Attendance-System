import { FiArrowRight } from 'react-icons/fi';

export default function FeatureHub({ title = 'Feature Hub', items = [] }) {
  if (!items.length) return null;

  return (
    <section className="card-glass page-section">
      <h2 className="section-title">{title}</h2>
      <div className="grid-3 feature-grid">
        {items.map((item) => (
          <button
            key={item.id}
            className="card action-card"
            onClick={item.onClick}
            type="button"
          >
            <div className="action-icon">{item.icon}</div>
            <div className="action-body">
              <div className="action-title">{item.title}</div>
              <div className="action-description">{item.description}</div>
            </div>
            <FiArrowRight size={16} className="action-arrow" />
          </button>
        ))}
      </div>
    </section>
  );
}
