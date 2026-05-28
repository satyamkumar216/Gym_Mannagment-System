import { Link } from "@tanstack/react-router";
import { Dumbbell, Instagram, Facebook, Youtube, Phone, Mail, MapPin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#1A1A1A] bg-[#0A0A0A]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-[#E02020] flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-2xl tracking-wide">IronForge Gym</span>
          </Link>
          <p className="mt-4 text-sm text-[#8A8A8A]">
            Hyderabad's premium fitness destination. Train harder. Live stronger.
          </p>
          <div className="mt-4 flex gap-3 text-[#8A8A8A]">
            <a href="#" className="hover:text-[#E02020]"><Instagram className="h-5 w-5" /></a>
            <a href="#" className="hover:text-[#E02020]"><Facebook className="h-5 w-5" /></a>
            <a href="#" className="hover:text-[#E02020]"><Youtube className="h-5 w-5" /></a>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-3">Explore</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/plans" className="hover:text-[#E02020]">Membership Plans</Link></li>
            <li><Link to="/trainers" className="hover:text-[#E02020]">Our Trainers</Link></li>
            <li><Link to="/gallery" className="hover:text-[#E02020]">Gallery</Link></li>
            <li><Link to="/about" className="hover:text-[#E02020]">About Us</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-3">Visit Us</div>
          <ul className="space-y-2 text-sm text-[#CFCFCF]">
            <li className="flex gap-2"><MapPin className="h-4 w-4 text-[#E02020] mt-0.5 shrink-0" /> Plot 42, Road 5, Banjara Hills, Hyderabad - 500034</li>
            <li className="flex gap-2"><Phone className="h-4 w-4 text-[#E02020] mt-0.5 shrink-0" /> +91 98765 43210</li>
            <li className="flex gap-2"><Mail className="h-4 w-4 text-[#E02020] mt-0.5 shrink-0" /> info@ironforge.in</li>
          </ul>
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-[#8A8A8A] mb-3">Hours</div>
          <ul className="space-y-2 text-sm text-[#CFCFCF]">
            <li>Mon – Sat: 5:00 AM – 11:00 PM</li>
            <li>Sunday: 6:00 AM – 10:00 PM</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#1A1A1A] py-5 text-xs text-[#8A8A8A]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>© {new Date().getFullYear()} IronForge Gym, Hyderabad. All rights reserved.</div>
          <div>
            <Link to="/admin/login" className="hover:text-white transition-colors">Staff Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
