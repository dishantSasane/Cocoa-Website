import { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Users, User, Phone } from 'lucide-react';

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    guests: '2',
    name: '',
    phone: '',
  });

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your reservation request! We will confirm your table shortly.');
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen overflow-hidden z-10"
    >
      {/* Background Image */}
      <div
        className={`absolute inset-0 w-full h-full transition-all duration-1000 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
        }`}
      >
        <img
          src="/hero_lounge.jpg"
          alt="Cocoa Cafe Interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cocoa-950/40 via-transparent to-cocoa-950/60" />
      </div>

      {/* Vignette Overlay */}
      <div className="absolute inset-0 vignette pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-[3] min-h-screen flex flex-col justify-center px-[7vw] py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Headline Block */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h1 className="font-display text-hero leading-[0.95] tracking-[-0.02em]">
              <span className="text-sienna block">COCOA</span>
              <span className="text-cocoa-50 block">CAFE</span>
            </h1>
            <p className="mt-6 text-cocoa-100 text-subhead font-body font-light">
              Artisan desserts. Specialty coffee. Fine dining.
            </p>
            <div className="mt-8">
              <span className="font-label text-cocoa-100/70">
                COCOA CAFE
              </span>
            </div>
          </div>

          {/* Right Table Reservation Card */}
          <div
            className={`transition-all duration-700 delay-500 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'
            }`}
          >
            <div className="glass-card p-6 shadow-luxury max-w-[420px] ml-auto">
              <h3 className="font-display text-xl text-cocoa-50 mb-4">
                Reserve Your Table
              </h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-label text-cocoa-100/60 text-[10px] block mb-1">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cocoa-100/50" />
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-cocoa-950/50 border border-cocoa-100/20 rounded-lg pl-10 pr-3 py-2.5 text-cocoa-50 text-sm focus:outline-none focus:border-sienna transition-colors"
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
                        className="w-full bg-cocoa-950/50 border border-cocoa-100/20 rounded-lg pl-10 pr-3 py-2.5 text-cocoa-50 text-sm focus:outline-none focus:border-sienna transition-colors appearance-none"
                        required
                      >
                        <option value="" className="bg-cocoa-900">Select time</option>
                        {timeSlots.map((time) => (
                          <option key={time} value={time} className="bg-cocoa-900">{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="font-label text-cocoa-100/60 text-[10px] block mb-1">Guests</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cocoa-100/50" />
                    <select
                      value={formData.guests}
                      onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                      className="w-full bg-cocoa-950/50 border border-cocoa-100/20 rounded-lg pl-10 pr-3 py-2.5 text-cocoa-50 text-sm focus:outline-none focus:border-sienna transition-colors appearance-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <option key={num} value={num} className="bg-cocoa-900">{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="font-label text-cocoa-100/60 text-[10px] block mb-1">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cocoa-100/50" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full bg-cocoa-950/50 border border-cocoa-100/20 rounded-lg pl-10 pr-3 py-2.5 text-cocoa-50 text-sm placeholder:text-cocoa-100/40 focus:outline-none focus:border-sienna transition-colors"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="font-label text-cocoa-100/60 text-[10px] block mb-1">Phone</label>
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
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-sienna hover:bg-sienna-light text-cocoa-50 px-6 py-3 rounded-pill transition-all duration-300 font-label text-xs mt-4"
                >
                  <Calendar className="w-4 h-4" />
                  Check Availability
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Right Paragraph */}
        <div
          className={`absolute right-[7vw] bottom-[10vh] w-full max-w-md text-right hidden lg:block transition-all duration-700 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <p className="text-cocoa-100/80 font-body text-sm leading-relaxed">
            Where every visit begins with the aroma of freshly ground cocoa and ends with a memory worth savoring.
          </p>
        </div>
      </div>
    </section>
  );
}
