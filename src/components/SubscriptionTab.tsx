import { motion } from "framer-motion";
import { CrownIcon, SparklesIcon, CheckIcon, LeafIcon } from "./icons";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "0",
    period: "forever",
    description: "For canteens just getting started with daily planning.",
    features: [
      "3-day sales history",
      "Daily demand forecast",
      "Basic restock alerts",
      "Email support",
    ],
    cta: "Current plan",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "49",
    period: "month",
    description: "For busy owners who want the full SmartStock edge.",
    features: [
      "8-week sales history",
      "AI agent plan + validator",
      "Expiry markdowns & supplier messages",
      "Baseline vs SmartStock proof",
      "Rain & payday context tuning",
      "Priority chat support",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    id: "business",
    name: "Business",
    price: "129",
    period: "month",
    description: "For chains and campus vendors with multiple stalls.",
    features: [
      "Everything in Pro",
      "Unlimited stalls",
      "Multi-user accounts",
      "Custom supplier integrations",
      "WhatsApp alerts",
      "Dedicated account manager",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1 },
};

export default function SubscriptionTab() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
        className="surface-elevated p-8 text-center relative overflow-hidden shine-border"
      >
        <div className="absolute inset-0 bg-gradient-mesh opacity-60" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-100 text-fuchsia-700 text-xs font-semibold mb-4">
            <SparklesIcon className="w-3.5 h-3.5" />
            Unlock the full edge
          </div>
          <h2 className="text-3xl font-extrabold mb-3">
            Upgrade to <span className="text-gradient-premium">SmartStock Pro</span>
          </h2>
          <p className="text-cream-300/80 max-w-lg mx-auto">
            Stop guessing tomorrow. Let the agents forecast demand, flag expiry, and prove the savings — every morning.
          </p>
        </div>
      </motion.div>

      {/* Pricing cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {PLANS.map((plan) => (
          <motion.div
            key={plan.id}
            variants={itemVariants}
            transition={{ duration: 0.45, ease: [0.175, 0.885, 0.32, 1.275] }}
            whileHover={{ y: -8, scale: 1.02 }}
            className={`relative p-6 rounded-3xl border transition-shadow duration-300 ${
              plan.highlighted
                ? "surface-premium pop-card-premium"
                : "surface-glass pop-card"
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-xs font-bold shadow-premium">
                  <CrownIcon className="w-3.5 h-3.5" />
                  Most popular
                </div>
              </div>
            )}

            <div className="mb-5">
              <h3 className="text-xl font-bold text-cream-100">{plan.name}</h3>
              <p className="text-sm text-cream-300/70 mt-1">{plan.description}</p>
            </div>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-cream-300/60 text-lg">RM</span>
              <span className={`text-5xl font-extrabold ${plan.highlighted ? "text-gradient-premium" : "text-cream-100"}`}>
                {plan.price}
              </span>
              <span className="text-cream-300/60 text-sm">/{plan.period}</span>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-cream-200">
                  <CheckIcon className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlighted ? "text-fuchsia-500" : "text-gold-500"}`} />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-3 rounded-full font-semibold transition-all duration-200 cursor-pointer ${
                plan.highlighted
                  ? "btn-premium"
                  : plan.id === "free"
                  ? "bg-forest-700 text-cream-300 cursor-default"
                  : "btn-secondary"
              }`}
            >
              {plan.cta}
            </button>
          </motion.div>
        ))}
      </motion.div>

      {/* Trust / FAQ teaser */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="surface-glass p-6"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center">
              <LeafIcon className="w-6 h-6 text-gold-600" />
            </div>
            <div>
              <h3 className="text-cream-100 font-semibold">Pro owners save RM850+ every month</h3>
              <p className="text-sm text-cream-300/70">Based on the 14-day baseline vs SmartStock backtest.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-cream-300/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            14-day free trial · Cancel anytime
          </div>
        </div>
      </motion.div>
    </div>
  );
}
