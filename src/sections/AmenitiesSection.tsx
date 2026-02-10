import { useEffect, useRef, useState } from 'react';
import { Wifi, Car, Baby, Sparkles } from 'lucide-react';

const amenities = [
  {
    icon: Wifi,
    title: 'Free Wi‑Fi',
    description: 'High-speed connectivity for work, browsing, or sharing your experience.',
  },
  {
    icon: Car,
    title: 'Valet Parking',
    description: 'Convenient parking assistance available for all guests.',
  },
  {
    icon: Baby,
    title: 'Family Friendly',
    description: 'High chairs, kids menu, and a welcoming atmosphere for families.',
  },
  {
    icon: Sparkles,
    title: 'Private Dining',
    description: 'Intimate spaces for celebrations, meetings, or special occasions.',
  },
];

export default function AmenitiesSection() {
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

  return (
    <section
      ref={sectionRef}
      id="amenities"
      className="relative w-full min-h-screen py-[10vh] z-40 bg-cocoa-900"
    >
      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-cocoa-950/50 pointer-events-none" />

      {/* Heading */}
      <h2
        className={`text-center font-display text-section text-cocoa-50 mb-[8vh] px-[7vw] transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        Every detail, thoughtfully considered.
      </h2>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-[7vw] mb-[8vh]">
        {amenities.map((amenity, index) => (
          <div
            key={amenity.title}
            className={`glass-card p-6 hover:bg-cocoa-950/70 transition-all duration-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: `${index * 100 + 200}ms` }}
          >
            <amenity.icon className="w-7 h-7 text-sienna mb-4" />
            <h3 className="font-display text-lg text-cocoa-50 mb-2">
              {amenity.title}
            </h3>
            <p className="text-cocoa-100/70 font-body text-sm leading-relaxed">
              {amenity.description}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom Labels */}
      <div className="absolute left-[7vw] bottom-[10vh] hidden lg:block">
        <span 
          className={`font-label text-cocoa-100/70 transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}
        >
          AMENITIES
        </span>
      </div>

      <div 
        className={`absolute right-[7vw] bottom-[10vh] w-full max-w-md text-right hidden lg:block transition-all duration-700 delay-600 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
        }`}
      >
        <p className="text-cocoa-100/80 font-body text-sm leading-relaxed">
          From the moment you arrive, every detail is designed for your comfort and enjoyment.
        </p>
      </div>
    </section>
  );
}
