const PLANS = [
  {
    id: "free",
    name: "Free",
    tagline: "Starter",
    price: "0",
    period: "forever",
    description: "For a stall just getting started with daily planning.",
    features: ["3-day sales history", "Daily demand forecast", "Basic restock alerts", "Email support"],
    cta: "Current plan",
    highlighted: false,
    ctaType: "secondary",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Most popular",
    price: "49",
    period: "month",
    description: "For busy owners who want the full edge.",
    features: [
      "8-week sales history",
      "AI agent plan + validator",
      "Expiry markdowns & supplier orders",
      "Baseline vs SmartStock proof",
      "Payday & rain tuning",
    ],
    cta: "Start free trial",
    highlighted: true,
    ctaType: "primary",
  },
  {
    id: "business",
    name: "Business",
    tagline: "Chain",
    price: "129",
    period: "month",
    description: "For campus vendors running more than one stall.",
    features: ["Everything in Pro", "Unlimited stalls", "Multi-user accounts", "WhatsApp alerts"],
    cta: "Contact sales",
    highlighted: false,
    ctaType: "secondary",
  },
];

export default function SubscriptionTab() {
  return (
    <div className="scroll-area min-h-0 flex-1 overflow-y-auto p-5">
      <div className="flex flex-col gap-5">
        <div className="special rise">
          <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-gold-500">
            Warung Pro · save every morning
          </div>
          <h1 className="macro mt-2 text-[clamp(30px,6vw,52px)]">Stop guessing.</h1>
          <p className="mt-3 max-w-[52ch] text-[13px]">
            Let the agents forecast demand, flag expiry and prove the savings — before you open the shutters.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 border-t-[2px] border-paper/25 pt-4">
            <span className="chalk-tag hot">
              <i className="ph ph-coins" /> RM 850+ saved / month
            </span>
            <span className="chalk-tag">
              <i className="ph ph-clock" /> 14-day free trial
            </span>
          </div>
        </div>

        <div className="rise grid grid-cols-1 gap-5 min-[820px]:grid-cols-3">
          {PLANS.map((plan) => (
            <div key={plan.id} className={`plan ${plan.highlighted ? "hot" : ""}`}>
              <span className="tagline">{plan.tagline}</span>
              <h3 className="macro text-[22px]">{plan.name}</h3>
              <div className="mt-1.5 min-h-[38px] text-[13px] text-cream-300">{plan.description}</div>
              <div className="my-4 flex items-baseline gap-1.5 font-mono">
                <span className="text-[13px] font-bold">RM</span>
                <span className="text-[40px] font-bold leading-none tracking-[-0.03em]">{plan.price}</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-cream-300">
                  /{plan.period}
                </span>
              </div>
              <ul className="mb-5 flex flex-col gap-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px]">
                    <i className="ph ph-check mt-px flex-none text-[16px] text-stock-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`${plan.ctaType === "primary" ? "btn-primary" : "btn-secondary"} mt-auto w-full`}
                disabled={plan.id === "free"}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
