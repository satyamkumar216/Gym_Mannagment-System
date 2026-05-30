import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Check, ChevronDown, Star, Users, Clock, Calendar, Award, Dumbbell,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "IronForge Gym — Train Harder. Live Stronger. | Hyderabad" },
      { name: "description", content: "Premium gym in Banjara Hills, Hyderabad. Strength training, CrossFit, Yoga, Zumba. Plans from ₹1,499/month. Join 347+ active members." },
      { property: "og:title", content: "IronForge Gym — Hyderabad's Premium Fitness Destination" },
      { property: "og:description", content: "Train Harder. Live Stronger. Memberships from ₹1,499/month." },
    ],
  }),
  component: Home,
});

const stats = [
  { value: "347", label: "Active Members", icon: Users },
  { value: "8", label: "Expert Trainers", icon: Award },
  { value: "5AM–11PM", label: "Open Daily", icon: Clock },
  { value: "2021", label: "Established", icon: Calendar },
];

const plans = [
  { name: "Monthly", price: "₹1,499", period: "/mo", save: null, popular: false,
    perks: ["Unlimited gym access", "Locker & shower", "1 trainer consultation"] },
  { name: "Quarterly", price: "₹3,999", period: "/3 mo", save: "Save 11%", popular: true,
    perks: ["Everything in Monthly", "4 group classes/week", "Diet plan included"] },
  { name: "Annual", price: "₹13,999", period: "/year", save: "Save 22%", popular: false,
    perks: ["Everything in Quarterly", "Unlimited classes", "Free body composition scan"] },
];

const trainers = [
  { name: "Rohan Verma", specialty: "Strength & Conditioning", initials: "RV" },
  { name: "Anita Desai", specialty: "Yoga & Flexibility", initials: "AD" },
  { name: "Karan Malhotra", specialty: "CrossFit & HIIT", initials: "KM" },
  { name: "Divya Nair", specialty: "Zumba & Cardio", initials: "DN" },
];

const testimonials = [
  { name: "Rahul S.", quote: "Lost 12kg in 3 months! The trainers genuinely care about results.", role: "Annual Member" },
  { name: "Priya P.", quote: "Best gym in Hyderabad. Clean equipment, real coaches, no nonsense.", role: "Quarterly Member" },
  { name: "Arjun M.", quote: "Trainers are world-class. Karan's CrossFit sessions changed my game.", role: "Annual Member" },
];

const faqs = [
  { q: "Is there a joining fee?", a: "No. There is no separate joining or registration fee. The price you see is the price you pay — GST included." },
  { q: "Do you offer EMI?", a: "Yes. Our Annual plan can be split into EMIs starting from ₹1,167/month via most major credit cards and no-cost EMI partners." },
  { q: "Can I pause my membership?", a: "Yes. Quarterly and Annual members can pause their membership for up to 30 days per year — perfect for travel or injury recovery." },
  { q: "Do you have ladies-only hours?", a: "Yes. We have a dedicated ladies-only zone open all day, plus exclusive women-only classes on weekday mornings (6–9 AM) and evenings (5–7 PM)." },
];

function Home() {
  const { scrollY } = useScroll();
  const videoY = useTransform(scrollY, [0, 500], [0, 150]);
  const contentY = useTransform(scrollY, [0, 500], [0, 80]);
  const contentOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  const [particles, setParticles] = useState<{ id: number; size: number; x: number; y: number; tx: number[]; ty: number[]; duration: number }[]>([]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const generated = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      tx: [0, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80, 0],
      ty: [0, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80, 0],
      duration: Math.random() * 20 + 20,
    }));
    setParticles(generated);

    const handleScroll = () => {
      if (window.scrollY > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 15,
        stiffness: 100,
      },
    },
  };

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[90vh] md:h-screen w-full flex items-center justify-center overflow-hidden border-b border-[#1A1A1A] bg-black">
        {/* Parallax Video Container */}
        <motion.div style={{ y: videoY }} className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          {/* Desktop Video Background */}
          <video
            className="hidden md:block absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster="/images/hero-poster.jpg"
          >
            <source src="/videos/gym-hero.webm" type="video/webm" />
            <source src="/videos/gym-hero.mp4" type="video/mp4" />
          </video>
          
          {/* Mobile Fallback Image */}
          <div
            className="block md:hidden absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url('/images/hero-mobile-bg.jpg')` }}
          />

          {/* Dark Overlay gradient */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              background: "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 50%, rgba(10,10,10,1) 100%)"
            }}
          />

          {/* Red Vignette */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              background: "radial-gradient(circle, transparent 50%, rgba(224,32,32,0.12) 100%)",
              boxShadow: "inset 0 0 100px rgba(224,32,32,0.25)"
            }}
          />
        </motion.div>

        {/* Floating Particles (20 dots, opacity 0.4, slow random drift) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-[#E02020]"
              style={{
                width: p.size + "px",
                height: p.size + "px",
                left: p.x + "%",
                top: p.y + "%",
                opacity: 0.4,
              }}
              animate={{
                x: p.tx,
                y: p.ty,
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <motion.div
            style={{ y: contentY, opacity: contentOpacity }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs uppercase tracking-widest text-[#E02020] font-semibold mb-6 shadow-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E02020] animate-pulse" />
              Banjara Hills · Hyderabad
            </div>

            <motion.h1
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="font-display text-[32px] sm:text-5xl md:text-7xl lg:text-8xl leading-[1.0] tracking-tight break-words text-white mb-6 select-none"
              style={{
                textShadow: "0 2px 10px rgba(0,0,0,0.8), 0 0 40px rgba(224,32,32,0.3)"
              }}
            >
              <div className="block">
                <motion.span variants={wordVariants} className="inline-block mr-[0.25em]">TRAIN</motion.span>
                <motion.span variants={wordVariants} className="inline-block">HARDER.</motion.span>
              </div>
              <div className="block text-[#E02020]">
                <motion.span variants={wordVariants} className="inline-block mr-[0.25em]">LIVE</motion.span>
                <motion.span variants={wordVariants} className="inline-block">STRONGER.</motion.span>
              </div>
            </motion.h1>

            <div className="mt-8 mb-10">
              <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#CFCFCF] bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 inline-block shadow-lg leading-relaxed">
                Hyderabad's premier strength, conditioning, and lifestyle gym. Built for people
                who want results — not excuses.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/join" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-[#E02020] hover:bg-[#C41818] h-12 min-h-[44px] px-8 text-base shadow-lg shadow-[#E02020]/20 hover:shadow-[#E02020]/30 transition-all duration-300">
                  Join Now
                </Button>
              </Link>
              <Link to="/plans" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 bg-black/40 backdrop-blur-sm text-white hover:bg-white/5 h-12 min-h-[44px] px-8 text-base transition-colors duration-300">
                  View Plans
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Down Chevron */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 cursor-pointer pointer-events-auto select-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: scrolled ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          onClick={() => {
            window.scrollTo({
              top: window.innerHeight * 0.9,
              behavior: "smooth",
            });
          }}
        >
          <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-semibold">Scroll Down</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <ChevronDown className="h-5 w-5 text-white" />
          </motion.div>
        </motion.div>
      </section>

      {/* STATS BAR */}
      <section className="border-b border-[#1A1A1A] bg-[#0A0A0A]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="text-center"
            >
              <s.icon className="h-5 w-5 text-[#E02020] mx-auto mb-2" />
              <div className="font-display text-3xl sm:text-4xl tracking-wide">{s.value}</div>
              <div className="mt-1 text-xs uppercase tracking-widest text-[#8A8A8A]">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PLANS */}
      <section className="border-b border-[#1A1A1A]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-widest text-[#E02020] font-semibold">Membership</div>
            <h2 className="font-display text-4xl sm:text-5xl mt-2">Pick Your Plan</h2>
            <p className="mt-3 text-[#8A8A8A]">No joining fee. GST included. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`relative rounded-xl border p-6 bg-[#111111] transition-colors ${
                  p.popular ? "border-[#E02020]" : "border-[#222222] hover:border-[#E02020]/40"
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E02020] text-white text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <div className="font-display text-2xl tracking-wide">{p.name}</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-5xl">{p.price}</span>
                  <span className="text-[#8A8A8A]">{p.period}</span>
                </div>
                {p.save && (
                  <div className="mt-2 inline-block text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    {p.save}
                  </div>
                )}
                <ul className="mt-6 space-y-3">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-[#CFCFCF]">
                      <Check className="h-4 w-4 text-[#E02020] mt-0.5 shrink-0" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link to="/plans" className="block mt-6">
                  <Button className={`w-full ${p.popular ? "bg-[#E02020] hover:bg-[#C41818]" : "bg-[#1A1A1A] hover:bg-[#222222] border border-[#222222]"}`}>
                    Choose {p.name}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRAINERS */}
      <section className="border-b border-[#1A1A1A]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-widest text-[#E02020] font-semibold">The Coaches</div>
            <h2 className="font-display text-4xl sm:text-5xl mt-2">Meet Your Trainers</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-thin md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:pb-0">
            {trainers.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="rounded-xl bg-[#111111] border border-[#222222] p-5 hover:border-[#E02020]/40 transition-colors shrink-0 w-[min(280px,78vw)] snap-start md:w-auto md:shrink"
              >
                <div className="aspect-square rounded-lg bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] flex items-center justify-center font-display text-5xl text-[#E02020]">
                  {t.initials}
                </div>
                <div className="mt-4 font-semibold">{t.name}</div>
                <div className="text-sm text-[#8A8A8A] mt-1">{t.specialty}</div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/trainers">
              <Button variant="outline" className="border-white/30 bg-transparent hover:bg-white/5">
                View All Trainers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-b border-[#1A1A1A]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-widest text-[#E02020] font-semibold">Real Results</div>
            <h2 className="font-display text-4xl sm:text-5xl mt-2">What Our Members Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-xl bg-[#111111] border border-[#222222] p-6"
              >
                <div className="flex gap-1 text-[#E02020]">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-[#E02020]" />
                  ))}
                </div>
                <p className="mt-4 text-[#CFCFCF] leading-relaxed">"{t.quote}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#1A1A1A] border border-[#222222] flex items-center justify-center text-sm font-semibold">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{t.name}</div>
                    <div className="text-xs text-[#8A8A8A]">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-[#1A1A1A]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20">
          <div className="text-center mb-10">
            <div className="text-xs uppercase tracking-widest text-[#E02020] font-semibold">FAQ</div>
            <h2 className="font-display text-4xl sm:text-5xl mt-2">Questions Answered</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => <Faq key={i} {...f} />)}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-20 text-center">
          <Dumbbell className="h-10 w-10 text-[#E02020] mx-auto" />
          <h2 className="font-display text-4xl sm:text-6xl mt-4">READY TO LIFT?</h2>
          <p className="mt-3 text-[#8A8A8A]">Walk in for a free trial session. No card, no commitment.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/join">
              <Button size="lg" className="bg-[#E02020] hover:bg-[#C41818] h-12 px-8">Join Now</Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white/30 bg-transparent hover:bg-white/5 h-12 px-8">Book a Tour</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl bg-[#111111] border border-[#222222] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#161616]"
      >
        <span className="font-medium">{q}</span>
        <ChevronDown className={`h-4 w-4 text-[#8A8A8A] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-5 pb-4 text-sm text-[#CFCFCF]"
        >
          {a}
        </motion.div>
      )}
    </div>
  );
}
