import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Award } from "lucide-react";

export const Route = createFileRoute("/_site/trainers")({
  head: () => ({
    meta: [
      { title: "Our Trainers — IronForge Gym Hyderabad" },
      { name: "description", content: "Meet IronForge Gym's certified trainers — strength, yoga, CrossFit, HIIT, and Zumba experts in Hyderabad." },
      { property: "og:title", content: "Meet Our Trainers — IronForge Gym" },
      { property: "og:description", content: "Certified strength, yoga, CrossFit, and cardio coaches." },
    ],
  }),
  component: Trainers,
});

const trainers = [
  {
    name: "Rohan Verma",
    specialty: "Strength & Conditioning",
    initials: "RV",
    bio: "8+ years coaching powerlifters and athletes. Helps clients build raw strength with smart programming.",
    certs: ["NSCA-CSCS", "Starting Strength Coach", "First Aid / CPR"],
  },
  {
    name: "Anita Desai",
    specialty: "Yoga & Flexibility",
    initials: "AD",
    bio: "RYT-500 certified. Combines vinyasa, mobility, and breathwork to keep lifters injury-free.",
    certs: ["Yoga Alliance RYT-500", "FRC Mobility Specialist"],
  },
  {
    name: "Karan Malhotra",
    specialty: "CrossFit & HIIT",
    initials: "KM",
    bio: "CrossFit L2 trainer with a competitive background. High-intensity, technique-first sessions.",
    certs: ["CrossFit Level 2 (CF-L2)", "ACE Certified", "Olympic Lifting L1"],
  },
  {
    name: "Divya Nair",
    specialty: "Zumba & Cardio",
    initials: "DN",
    bio: "Licensed Zumba instructor making cardio actually fun. Specialises in fat loss and dance fitness.",
    certs: ["Zumba ZIN", "ACSM Personal Trainer", "Nutrition Coach L1"],
  },
];

function Trainers() {
  return (
    <div>
      <section className="border-b border-[#1A1A1A]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-20 text-center">
          <div className="text-xs uppercase tracking-widest text-[#E02020] font-semibold">The Coaches</div>
          <h1 className="font-display text-[28px] sm:text-5xl md:text-7xl mt-2 break-words">OUR TRAINERS</h1>
          <p className="mt-4 text-[#CFCFCF]">Certified, hands-on, and obsessed with your progress.</p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 flex flex-col gap-5 md:grid md:grid-cols-2 lg:grid-cols-2">
          {trainers.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="rounded-xl bg-[#111111] border border-[#222222] p-6 flex flex-col sm:flex-row gap-5 hover:border-[#E02020]/40 transition-colors min-w-0"
            >
              <div className="h-28 w-28 rounded-lg bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] flex items-center justify-center font-display text-4xl text-[#E02020] shrink-0">
                {t.initials}
              </div>
              <div className="min-w-0">
                <div className="font-display text-2xl tracking-wide">{t.name}</div>
                <div className="text-sm text-[#E02020] font-medium mt-0.5">{t.specialty}</div>
                <p className="mt-3 text-sm text-[#CFCFCF]">{t.bio}</p>
                <div className="mt-3 space-y-1">
                  {t.certs.map((c) => (
                    <div key={c} className="flex items-center gap-2 text-xs text-[#8A8A8A]">
                      <Award className="h-3 w-3 text-[#E02020]" />
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
