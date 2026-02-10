import { Instagram, Facebook, Twitter } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-cocoa-950 py-12 z-[80]">
      <div className="px-[7vw]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo & Copyright */}
          <div className="text-center md:text-left">
            <span className="font-display text-2xl text-cocoa-50 block mb-2">
              COCOA CAFE
            </span>
            <span className="font-body text-xs text-cocoa-100/50">
              © {currentYear} Cocoa Cafe. All rights reserved.
            </span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cocoa-100/60 hover:text-sienna transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cocoa-100/60 hover:text-sienna transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cocoa-100/60 hover:text-sienna transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="font-label text-cocoa-100/60 hover:text-cocoa-100 transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="font-label text-cocoa-100/60 hover:text-cocoa-100 transition-colors"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
