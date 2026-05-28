import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_site/contact")({
  head: () => ({
    meta: [
      { title: "Contact — IronForge Gym Banjara Hills, Hyderabad" },
      { name: "description", content: "Visit IronForge Gym at Plot 42, Road 5, Banjara Hills, Hyderabad - 500034. Call +91 98765 43210 or message us on WhatsApp." },
      { property: "og:title", content: "Contact IronForge Gym" },
      { property: "og:description", content: "Banjara Hills, Hyderabad. Open Mon-Sat 5AM-11PM." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const whatsapp = "https://wa.me/919876543210?text=Hi%20IronForge%2C%20I%27d%20like%20to%20know%20more%20about%20your%20gym.";
  const mapsQuery = "Banjara+Hills+Road+5+Hyderabad";

  return (
    <div>
      <section className="border-b border-[#1A1A1A]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-20 text-center">
          <div className="text-xs uppercase tracking-widest text-[#E02020] font-semibold">Get in Touch</div>
          <h1 className="font-display text-5xl sm:text-7xl mt-2">CONTACT US</h1>
          <p className="mt-4 text-[#CFCFCF]">Walk in for a free trial. We'll show you around.</p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Info cards */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <InfoCard icon={MapPin} title="Address">
              Plot 42, Road 5, Banjara Hills,<br />
              Hyderabad, Telangana - 500034
            </InfoCard>
            <InfoCard icon={Clock} title="Hours">
              Mon – Sat: 5:00 AM – 11:00 PM<br />
              Sunday: 6:00 AM – 10:00 PM
            </InfoCard>
            <InfoCard icon={Phone} title="Phone">
              <a href="tel:+919876543210" className="hover:text-[#E02020]">+91 98765 43210</a>
            </InfoCard>
            <InfoCard icon={Mail} title="Email">
              <a href="mailto:info@ironforge.in" className="hover:text-[#E02020]">info@ironforge.in</a>
            </InfoCard>
            <a href={whatsapp} target="_blank" rel="noreferrer">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-12">
                <MessageCircle className="h-4 w-4 mr-2" /> Chat on WhatsApp
              </Button>
            </a>
          </motion.div>

          {/* Form + Map */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-4"
          >
            <div className="rounded-xl bg-[#111111] border border-[#222222] p-6">
              <div className="font-display text-2xl tracking-wide mb-4">Send Us a Message</div>
              <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                <Input placeholder="Full name" className="bg-[#0A0A0A] border-[#222222] h-11" />
                <Input placeholder="Phone (+91)" className="bg-[#0A0A0A] border-[#222222] h-11" />
                <Input placeholder="Email" type="email" className="bg-[#0A0A0A] border-[#222222] h-11" />
                <Textarea placeholder="Message" rows={4} className="bg-[#0A0A0A] border-[#222222]" />
                <Button className="w-full bg-[#E02020] hover:bg-[#C41818] h-11">Send Message</Button>
              </form>
            </div>

            <div className="rounded-xl bg-[#111111] border border-[#222222] overflow-hidden">
              <iframe
                title="IronForge Gym Location"
                src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
                width="100%"
                height="280"
                style={{ border: 0, filter: "grayscale(0.4) invert(0.92) hue-rotate(180deg)" }}
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({
  icon: Icon, title, children,
}: { icon: typeof MapPin; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-[#111111] border border-[#222222] p-5 flex gap-4">
      <div className="h-10 w-10 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-[#E02020] shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-widest text-[#8A8A8A] font-semibold">{title}</div>
        <div className="mt-1 text-sm text-[#CFCFCF]">{children}</div>
      </div>
    </div>
  );
}
