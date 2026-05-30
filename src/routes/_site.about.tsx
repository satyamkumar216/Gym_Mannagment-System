import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Target, Heart, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_site/about")({
  head: () => ({
    meta: [
      { title: "About — IronForge Gym Hyderabad" },
      { name: "description", content: "Founded in 2021, IronForge Gym is Hyderabad's premium fitness destination — built by lifters, for lifters." },
      { property: "og:title", content: "About IronForge Gym" },
      { property: "og:description", content: "Hyderabad's premium fitness destination, since 2021." },
    ],
  }),
  component: About,
});

const values = [
  { icon: Target, title: "Results First", body: "Programming, nutrition, and accountability — not vanity machines." },
  { icon: Heart, title: "Community", body: "A floor where beginners and competitors train side by side, with respect." },
  { icon: Trophy, title: "Standards", body: "Top-tier equipment, certified coaches, and zero excuses on cleanliness." },
  { icon: Users, title: "For Everyone", body: "From your first squat to your first competition — we've got a plan." },
];

function About() {
  return (
    <div>
      <section className="relative border-b border-[#1A1A1A] overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#E02020] opacity-15 blur-[140px] pointer-events-none" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 py-24 text-center">
          <div className="text-xs uppercase tracking-widest text-[#E02020] font-semibold">Our Story</div>
          <h1 className="font-display text-[28px] sm:text-5xl md:text-7xl mt-2 break-words">FORGED IN HYDERABAD</h1>
          <p className="mt-6 text-lg text-[#CFCFCF] max-w-2xl mx-auto">
            Founded in <span className="text-white font-semibold">2021</span>, IronForge Gym was built by athletes
            tired of corporate "fitness centres" that sell memberships instead of results.
            Today we're Hyderabad's premium fitness destination — and we're just getting started.
          </p>
        </div>
      </section>

      <section className="border-b border-[#1A1A1A]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="aspect-[4/3] rounded-xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#222222] flex items-center justify-center"
          >
            <div className="font-display text-[10rem] leading-none text-[#E02020]/30">2021</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-4xl">Why we built this gym.</h2>
            <p className="mt-4 text-[#CFCFCF]">
              We opened on Road 5 in Banjara Hills with a single squat rack, four members, and one rule:
              <span className="text-white"> train with intention</span>. Four years later, 347+ members train
              alongside national-level lifters, yoga teachers, and CrossFit athletes — all under one roof.
            </p>
            <p className="mt-4 text-[#CFCFCF]">
              No franchise gimmicks. No locked contracts. Just well-programmed strength,
              honest coaching, and equipment that's actually maintained.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-[#1A1A1A]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-widest text-[#E02020] font-semibold">What We Stand For</div>
            <h2 className="font-display text-4xl sm:text-5xl mt-2">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="rounded-xl bg-[#111111] border border-[#222222] p-6 hover:border-[#E02020]/40 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-[#E02020]">
                  <v.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 font-display text-xl">{v.title}</div>
                <p className="mt-2 text-sm text-[#CFCFCF]">{v.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-20 text-center">
          <h2 className="font-display text-4xl sm:text-6xl">COME TRAIN WITH US.</h2>
          <p className="mt-3 text-[#8A8A8A]">First session is on us.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/plans"><Button size="lg" className="bg-[#E02020] hover:bg-[#C41818] h-12 px-8">See Plans</Button></Link>
            <Link to="/contact"><Button size="lg" variant="outline" className="border-white/30 bg-transparent hover:bg-white/5 h-12 px-8">Visit the Gym</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
