import { useEffect, useRef, useState } from 'react';
import { Coffee, Moon, Sun, ArrowRight } from 'lucide-react';

export default function ExperienceSection() {
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
      id="experience"
      className="relative w-full min-h-screen overflow-hidden z-30"
    >
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="/cafe_interior.jpg"
          alt="Cocoa Cafe Experience"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cocoa-950/50 via-transparent to-cocoa-950/70" />
      </div>

      {/* Vignette Overlay */}
      <div className="absolute inset-0 vignette pointer-events-none" />

      {/* Content */}
      <div className="relative z-[3] min-h-screen flex flex-col justify-center px-[7vw] py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Headline */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'
            }`}
          >
            <h2 className="font-display text-section text-cocoa-50 mb-4">
              THE EXPERIENCE
            </h2>
            <p className="text-cocoa-100 text-subhead font-body font-light">
              Morning coffee, afternoon desserts, evening dining—every moment crafted.
            </p>
          </div>

          {/* Right Info Card */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'
            }`}
          >
            <div className="glass-card p-6 shadow-luxury max-w-[380px] ml-auto">
              <h3 className="font-display text-xl text-cocoa-50 mb-4">
                Opening Hours
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Sun className="w-4 h-4 text-sienna" />
                  <div className="flex-1">
                    <span className="text-cocoa-100 font-body text-sm">Morning Café</span>
                    <span className="text-cocoa-100/60 font-body text-xs block">08:00 – 12:00</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Coffee className="w-4 h-4 text-sienna" />
                  <div className="flex-1">
                    <span className="text-cocoa-100 font-body text-sm">All-Day Dining</span>
                    <span className="text-cocoa-100/60 font-body text-xs block">12:00 – 17:00</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Moon className="w-4 h-4 text-sienna" />
                  <div className="flex-1">
                    <span className="text-cocoa-100 font-body text-sm">Evening Experience</span>
                    <span className="text-cocoa-100/60 font-body text-xs block">17:00 – 23:00</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' })}
                className="group flex items-center gap-2 text-sienna hover:text-sienna-light transition-colors duration-300 font-label text-xs mt-5"
              >
                Reserve your table
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Labels */}
        <div className="absolute left-[7vw] bottom-[10vh] hidden lg:block">
          <span 
            className={`font-label text-cocoa-100/70 flex items-center gap-2 transition-all duration-700 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          >
            <Coffee className="w-4 h-4" />
            ARTISAN EXPERIENCE
          </span>
        </div>

        <div 
          className={`absolute right-[7vw] bottom-[10vh] w-full max-w-md text-right hidden lg:block transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <p className="text-cocoa-100/80 font-body text-sm leading-relaxed">
            From the first sip of morning espresso to the last bite of midnight dessert—every visit is an occasion.
          </p>
        </div>
      </div>
    </section>
  );
}
