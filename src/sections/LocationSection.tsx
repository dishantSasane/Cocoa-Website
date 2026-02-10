import { useEffect, useRef, useState } from 'react';
import { MapPin, Send, Phone, Mail, Clock } from 'lucide-react';

export default function LocationSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', phone: '', message: '' });
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
      id="location"
      className="relative w-full min-h-screen py-[10vh] z-[60] bg-cocoa-900"
    >
      <div className="px-[7vw]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Headline Block */}
            <div
              className={`transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}
            >
              <h2 className="font-display text-section text-cocoa-50 mb-4">
                Find Us
              </h2>
              <p className="text-cocoa-100 font-body text-subhead font-light mb-6">
                Visit us in the heart of Virar West
              </p>
              <div className="flex items-start gap-3 text-cocoa-100/80">
                <MapPin className="w-5 h-5 text-sienna flex-shrink-0 mt-0.5" />
                <div className="font-body text-sm leading-relaxed">
                  <p>Shop No B-1, The Malange Malange Ground,</p>
                  <p>near Madhuram Hotel Jakat Naka,</p>
                  <p>Gokul Twp, Virar West,</p>
                  <p>Virar, Maharashtra 401303</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4 text-cocoa-100/60">
                <Clock className="w-4 h-4 text-sienna" />
                <span className="font-body text-xs">Open daily: 08:00 – 23:00</span>
              </div>
            </div>

            {/* Map Panel */}
            <div
              className={`glass-card h-[250px] overflow-hidden relative transition-all duration-700 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3763.1234567890123!2d72.81!3d19.45!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDI3JzAwLjAiTiA3MsKwNDgnMzYuMCJF!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(100%) invert(92%) contrast(83%)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Cocoa Cafe Location"
              />
            </div>
          </div>

          {/* Right Column - Contact Card */}
          <div
            className={`transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            <div className="glass-card p-6 shadow-luxury">
              <h3 className="font-display text-xl text-cocoa-50 mb-4">
                Get in Touch
              </h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="font-label text-cocoa-100/60 text-[10px] block mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-cocoa-950/50 border border-cocoa-100/20 rounded-lg px-4 py-2.5 text-cocoa-50 text-sm placeholder:text-cocoa-100/40 focus:outline-none focus:border-sienna transition-colors"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="font-label text-cocoa-100/60 text-[10px] block mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-cocoa-950/50 border border-cocoa-100/20 rounded-lg px-4 py-2.5 text-cocoa-50 text-sm placeholder:text-cocoa-100/40 focus:outline-none focus:border-sienna transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="font-label text-cocoa-100/60 text-[10px] block mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-cocoa-950/50 border border-cocoa-100/20 rounded-lg px-4 py-2.5 text-cocoa-50 text-sm placeholder:text-cocoa-100/40 focus:outline-none focus:border-sienna transition-colors"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="font-label text-cocoa-100/60 text-[10px] block mb-1">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={3}
                    className="w-full bg-cocoa-950/50 border border-cocoa-100/20 rounded-lg px-4 py-2.5 text-cocoa-50 text-sm placeholder:text-cocoa-100/40 focus:outline-none focus:border-sienna transition-colors resize-none"
                    placeholder="How can we help?"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-sienna hover:bg-sienna-light text-cocoa-50 px-6 py-3 rounded-pill transition-all duration-300 font-label text-xs"
                >
                  <Send className="w-4 h-4" />
                  Send message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <a 
                href="tel:+919876543210" 
                className="flex items-center gap-1 text-cocoa-100/70 hover:text-sienna transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="font-body text-sm">+91 98765 43210</span>
              </a>
              <a 
                href="mailto:hello@cocoacafe.in" 
                className="flex items-center gap-1 text-cocoa-100/70 hover:text-sienna transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="font-body text-sm">hello@cocoacafe.in</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
