import { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';

const menuCategories = [
  {
    id: 'desserts',
    title: 'Signature Desserts',
    items: [
      { name: 'Velvet Cocoa Torte', description: 'Dark chocolate ganache, hazelnut praline, gold leaf' },
      { name: 'Caramel Affair', description: 'Salted caramel mousse, butter cookie, sea salt' },
      { name: 'Berry Chocolate Fondant', description: 'Molten center, seasonal berries, vanilla bean ice cream' },
      { name: 'Tiramisu Classico', description: 'Espresso-soaked ladyfingers, mascarpone, cocoa dust' },
    ]
  },
  {
    id: 'coffee',
    title: 'Artisan Café',
    items: [
      { name: 'Signature Hot Chocolate', description: 'Single-origin cocoa, steamed milk, hand-whipped cream' },
      { name: 'Cocoa Espresso', description: 'Double shot, cocoa-infused, demerara sugar' },
      { name: 'Caramel Macchiato', description: 'Espresso, vanilla, caramel drizzle, microfoam' },
      { name: 'Cold Brew Mocha', description: '24-hour steeped, chocolate, cold foam' },
    ]
  },
  {
    id: 'dining',
    title: 'Restaurant Specialties',
    items: [
      { name: 'Truffle Mushroom Risotto', description: 'Arborio rice, wild mushrooms, parmesan, truffle oil' },
      { name: 'Cocoa-Rubbed Tenderloin', description: 'Coffee-cocoa crust, red wine reduction, roasted vegetables' },
      { name: 'Herb-Crusted Salmon', description: 'Atlantic salmon, dill, lemon butter, asparagus' },
      { name: 'Burrata & Heirloom Salad', description: 'Fresh burrata, tomatoes, basil oil, balsamic pearls' },
    ]
  }
];

export default function MenuSection() {
  const [activeCategory, setActiveCategory] = useState('desserts');
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const activeItems = menuCategories.find(c => c.id === activeCategory)?.items || [];

  return (
    <section
      ref={sectionRef}
      id="menu"
      className="relative w-full min-h-screen py-[12vh] z-20 bg-cocoa-900"
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-cocoa-950/30 via-transparent to-cocoa-950/30 pointer-events-none" />

      {/* Heading */}
      <div
        className={`text-center mb-[8vh] px-[7vw] transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <span className="font-label text-sienna block mb-4">OUR OFFERINGS</span>
        <h2 className="font-display text-section text-cocoa-50 mb-4">
          A Culinary Journey
        </h2>
        <p className="text-cocoa-100/80 font-body text-lg max-w-xl mx-auto">
          From handcrafted desserts to artisan coffee and fine dining—every creation tells a story.
        </p>
      </div>

      {/* Category Tabs - Mobile Optimized */}
      <div className="flex justify-center gap-2 md:gap-4 px-4 mb-12 overflow-x-auto pb-2">
        {menuCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 md:px-6 py-2.5 rounded-pill font-label text-[10px] md:text-xs whitespace-nowrap transition-all duration-300 ${
              activeCategory === cat.id
                ? 'bg-sienna text-cocoa-50'
                : 'bg-cocoa-950/50 text-cocoa-100/70 hover:text-cocoa-50 border border-cocoa-100/10'
            }`}
          >
            {cat.title}
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="px-[7vw]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto">
          {activeItems.map((item, index) => (
            <div
              key={item.name}
              className={`group glass-card p-5 md:p-6 hover:bg-cocoa-950/70 transition-all duration-300 cursor-pointer ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100 + 200}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-display text-lg md:text-xl text-cocoa-50 group-hover:text-sienna transition-colors duration-300 mb-1">
                    {item.name}
                  </h4>
                  <p className="text-cocoa-100/60 font-body text-xs md:text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-cocoa-100/30 group-hover:text-sienna group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-12 px-[7vw]">
        <button className="inline-flex items-center gap-2 text-sienna hover:text-sienna-light transition-colors duration-300 font-label text-xs">
          View Full Menu
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
