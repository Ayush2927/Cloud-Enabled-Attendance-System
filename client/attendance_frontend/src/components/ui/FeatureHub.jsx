import { FiArrowRight } from 'react-icons/fi';
import { Card } from './card';

export default function FeatureHub({ title = 'Feature Hub', items = [] }) {
  if (!items.length) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-foreground">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className="text-left w-full transition-transform hover:-translate-y-1 focus:outline-none"
            type="button"
          >
            <Card className="h-full p-4 flex items-center justify-between hover:border-primary/50 transition-colors bg-card/50">
              <div className="flex items-start flex-1 gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  {item.icon}
                </div>
                <div>
                  <div className="text-base font-medium text-foreground mb-1">{item.title}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2">{item.description}</div>
                </div>
              </div>
              <FiArrowRight size={20} className="text-muted-foreground opacity-50 ml-4 flex-shrink-0" />
            </Card>
          </button>
        ))}
      </div>
    </section>
  );
}
