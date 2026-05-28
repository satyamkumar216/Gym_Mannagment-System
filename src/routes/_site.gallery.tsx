import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";

export const Route = createFileRoute("/_site/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — IronForge Gym Hyderabad" },
      { name: "description", content: "Inside IronForge Gym: equipment, training floors, classes, and our community in Banjara Hills, Hyderabad." },
      { property: "og:title", content: "Gallery — IronForge Gym" },
      { property: "og:description", content: "A look inside our Hyderabad gym." },
    ],
  }),
  component: Gallery,
});

// Masonry tiles with varied aspect ratios + captions.
const tiles = [
  { h: "h-64", label: "Heavy Squat Rack" },
  { h: "h-80", label: "Cardio Floor" },
  { h: "h-56", label: "Dumbbell Zone" },
  { h: "h-72", label: "Functional Turf" },
  { h: "h-60", label: "Yoga Studio" },
  { h: "h-80", label: "CrossFit Box" },
  { h: "h-64", label: "Locker Room" },
  { h: "h-56", label: "Recovery Lounge" },
  { h: "h-72", label: "Olympic Platform" },
];

function Gallery() {
  return (
    <div>
      <section className="border-b border-[#1A1A1A]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-20 text-center">
          <div className="text-xs uppercase tracking-widest text-[#E02020] font-semibold">The Space</div>
          <h1 className="font-display text-5xl sm:text-7xl mt-2">GALLERY</h1>
          <p className="mt-4 text-[#CFCFCF]">A look inside the iron temple.</p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {tiles.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
                className={`break-inside-avoid relative ${t.h} rounded-xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#222222] overflow-hidden group`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Dumbbell className="h-10 w-10 text-[#E02020]/40 group-hover:text-[#E02020]/70 transition-colors" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="text-sm font-medium">{t.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
