import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_site/plans")({
  head: () => ({
    meta: [
      { title: "Membership Plans — IronForge Gym Hyderabad" },
      { name: "description", content: "Transparent gym pricing from ₹1,499/month. GST included. No joining fee. EMI available on annual plans." },
      { property: "og:title", content: "Membership Plans — IronForge Gym" },
      { property: "og:description", content: "Plans from ₹1,499/month. GST included. EMI available." },
    ],
  }),
  component: Plans,
});

const plans = [
  {
    name: "Monthly",
    price: "₹1,499",
    period: "per month",
    save: null,
    badge: null,
    popular: false,
    perks: [
      "Unlimited gym access during operating hours",
      "Locker, towel & shower facility",
      "1 free trainer consultation",
      "Access to cardio & strength zones",
    ],
  },
  {
    name: "Quarterly",
    price: "₹3,999",
    period: "for 3 months",
    save: "Save 11% vs Monthly",
    badge: "Most Popular",
    popular: true,
    perks: [
      "Everything in Monthly",
      "4 group classes per week",
      "Personalised diet plan",
      "Monthly progress check-ins",
      "Pause for up to 15 days",
    ],
  },
  {
    name: "Annual",
    price: "₹13,999",
    period: "per year",
    save: "Save 22% vs Monthly",
    badge: "EMI from ₹1,167/mo",
    popular: false,
    perks: [
      "Everything in Quarterly",
      "Unlimited group classes",
      "Free body composition scan (quarterly)",
      "Priority class booking",
      "Pause for up to 30 days",
      "Guest pass — 2 per year",
    ],
  },
];

function Plans() {
  return (
    <div>
      <section className="border-b border-[#1A1A1A]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-20 text-center">
          <div className="text-xs uppercase tracking-widest text-[#E02020] font-semibold">Membership</div>
          <h1 className="font-display text-5xl sm:text-7xl mt-2">SIMPLE PRICING</h1>
          <p className="mt-4 text-[#CFCFCF] max-w-2xl mx-auto">
            One gym, three plans. No hidden charges, no surprise renewals.
            <span className="block mt-2 text-sm text-[#8A8A8A]">GST included in all prices.</span>
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`relative rounded-xl border p-7 bg-[#111111] ${
                  p.popular ? "border-[#E02020]" : "border-[#222222]"
                }`}
              >
                {p.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E02020] text-white text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider whitespace-nowrap">
                    {p.badge}
                  </div>
                )}
                <div className="font-display text-2xl tracking-wide">{p.name}</div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-6xl">{p.price}</span>
                </div>
                <div className="text-sm text-[#8A8A8A] mt-1">{p.period}</div>
                {p.save && (
                  <div className="mt-3 inline-block text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
                    {p.save}
                  </div>
                )}
                <ul className="mt-7 space-y-3">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-[#CFCFCF]">
                      <Check className="h-4 w-4 text-[#E02020] mt-0.5 shrink-0" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <Button className={`w-full mt-7 h-11 ${p.popular ? "bg-[#E02020] hover:bg-[#C41818]" : "bg-[#1A1A1A] hover:bg-[#222222] border border-[#222222]"}`}>
                  Choose {p.name}
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 rounded-xl border border-[#222222] bg-[#111111] p-6 flex items-start gap-3">
            <IndianRupee className="h-5 w-5 text-[#E02020] mt-0.5 shrink-0" />
            <div className="text-sm text-[#CFCFCF]">
              <strong className="text-white">GST included</strong> in all prices.
              No joining or registration fee. Annual plan eligible for <strong className="text-white">no-cost EMI from ₹1,167/month</strong> via partner banks.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
