import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Quote } from 'lucide-react';

export default function TestimonialsSection() {
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
      id="testimonials"
      className="relative w-full min-h-screen overflow-hidden z-50"
    >
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="/guest_portrait.jpg"
          alt="Happy Guest at Cocoa Cafe"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cocoa-950/50 via-transparent to-cocoa-950/70" />
      </div>

      {/* Vignette Overlay */}
      <div className="absolute inset-0 vignette pointer-events-none" />

      {/* Content */}
      <div className="relative z-[3] min-h-screen flex flex-col justify-center items-center px-[7vw] py-24">
        {/* Top Center Headline */}
        <h2
          className={`text-center font-display text-section text-cocoa-50 mb-auto pt-[10vh] transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
          }`}
        >
          GUEST STORIES
        </h2>

        {/* Bottom Center Content */}
        <div
          className={`text-center mb-[10vh] transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <Quote className="w-8 h-8 text-sienna mx-auto mb-4 opacity-60" />
          <p className="text-cocoa-100 text-subhead font-body font-light mb-6">
            Real visits. Real moments. Real delight.
          </p>
          <button className="group inline-flex items-center gap-3 text-sienna hover:text-sienna-light transition-colors duration-300 font-label text-xs">
            Read reviews
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Bottom Labels */}
        <div className="absolute left-[7vw] bottom-[10vh] hidden lg:block">
          <span 
            className={`font-label text-cocoa-100/70 transition-all duration-700 delay-400 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
          >
            TESTIMONIALS
          </span>
        </div>

        <div 
          className={`absolute right-[7vw] bottom-[10vh] w-full max-w-md text-right hidden lg:block transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}
        >
          <p className="text-cocoa-100/80 font-body text-sm leading-relaxed">
            Guests mention the desserts, the coffee, and the warm atmosphere—again and again.
          </p>
        </div>
      </div>
    </section>
  );
}
