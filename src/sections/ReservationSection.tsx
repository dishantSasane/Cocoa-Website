import { useEffect, useRef, useState } from 'react';
import { Calendar, Clock, Users, User, Phone, Check, Utensils } from 'lucide-react';

export default function ReservationSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', phone: '', date: '', time: '', guests: '2' });
    }, 3000);
  };

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
      id="reservation"
      className="relative w-full min-h-screen overflow-hidden z-[70]"
    >
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="/dessert_cocoa.jpg"
          alt="Cocoa Dessert"
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
              RESERVE YOUR TABLE
            </h2>
            <p className="text-cocoa-100 text-subhead font-body font-light">
              Weekends fill quickly—book ahead for the best experience.
            </p>
            <div className="mt-6 flex items-center gap-2 text-cocoa-100/60">
              <Check className="w-4 h-4 text-sienna" />
              <span className="font-body text-sm">Free cancellation up to 4 hours before</span>
            </div>
          </div>

          {/* Right Reservation Card */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'
            }`}
          >
            <div className="glass-card p-6 shadow-luxury max-w-[460px] ml-auto">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-sienna/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-sienna" />
                  </div>
                  <h3 className="font-display text-2xl text-cocoa-50 mb-2">Reservation Requested</h3>
                  <p className="text-cocoa-100/80 font-body text-sm">
                    We will confirm your table shortly via SMS.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="font-display text-xl text-cocoa-50 mb-4 flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-sienna" />
                    Table Reservation
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label className="font-label text-cocoa-100/60 text-[10px] block mb-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cocoa-100/50" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Your full name"
                          className="w-full bg-cocoa-950/50 border border-cocoa-100/20 rounded-lg pl-10 pr-3 py-2.5 text-cocoa-50 text-sm placeholder:text-cocoa-100/40 focus:outline-none focus:border-sienna transition-colors"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-label text-cocoa-100/60 text-[10px] block mb-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cocoa-100/50" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full bg-cocoa-950/50 border border-cocoa-100/20 rounded-lg pl-10 pr-3 py-2.5 text-cocoa-50 text-sm placeholder:text-cocoa-100/40 focus:outline-none focus:border-sienna transition-colors"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-label text-cocoa-100/60 text-[10px] block mb-1">Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cocoa-100/50" />
                          <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full bg-cocoa-950/50 border border-cocoa-100/20 rounded-lg pl-10 pr-2 py-2.5 text-cocoa-50 text-sm focus:outline-none focus:border-sienna transition-colors"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="font-label text-cocoa-100/60 text-[10px] block mb-1">Time</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cocoa-100/50" />
                          <select
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            className="w-full bg-cocoa-950/50 border border-cocoa-100/20 rounded-lg pl-10 pr-2 py-2.5 text-cocoa-50 text-sm focus:outline-none focus:border-sienna transition-colors appearance-none"
                            required
                          >
                            <option value="" className="bg-cocoa-900">Select</option>
                            {timeSlots.map((time) => (
                              <option key={time} value={time} className="bg-cocoa-900">{time}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="font-label text-cocoa-100/60 text-[10px] block mb-1">Number of Guests</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cocoa-100/50" />
                        <select
                          value={formData.guests}
                          onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                          className="w-full bg-cocoa-950/50 border border-cocoa-100/20 rounded-lg pl-10 pr-3 py-2.5 text-cocoa-50 text-sm focus:outline-none focus:border-sienna transition-colors appearance-none"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, '10+'].map((num) => (
                            <option key={num} value={num} className="bg-cocoa-900">
                              {num} {num === 1 ? 'Guest' : 'Guests'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 bg-sienna hover:bg-sienna-light text-cocoa-50 px-6 py-3 rounded-pill transition-all duration-300 font-label text-xs mt-4"
                    >
                      <Calendar className="w-4 h-4" />
                      Confirm Reservation
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Labels */}
        <div className="absolute left-[7vw] bottom-[10vh] hidden lg:block">
          <span 
            className={`font-label text-cocoa-100/70 transition-all duration-700 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          >
            RESERVATIONS
          </span>
        </div>

        <div 
          className={`absolute right-[7vw] bottom-[10vh] w-full max-w-md text-right hidden lg:block transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <p className="text-cocoa-100/80 font-body text-sm leading-relaxed">
            For large groups or special occasions, call us directly at +91 98765 43210
          </p>
        </div>
      </div>
    </section>
  );
}
