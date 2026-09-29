export const pricingPlans = [
  {
    key: "starter",
    name: "Starter Landing Page",
    total: 4999,
    deposit: 1500,
    description:
      "A focused, polished landing page for a new business, campaign, or product launch.",
    popular: false,
  },
  {
    key: "business",
    name: "Business Growth",
    total: 9999,
    deposit: 3000,
    description:
      "A conversion-ready business website built to strengthen your brand and bring in leads.",
    popular: true,
  },
  {
    key: "custom",
    name: "Custom Web Application",
    total: 19999,
    deposit: 6000,
    description:
      "A tailored web application for custom workflows, richer functionality, and growth.",
    popular: false,
  },
] as const;

export type PricingPlanKey = (typeof pricingPlans)[number]["key"];

function formatPrice(amount: number) {
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount)}`;
}

export default function Pricing({
  onSelectPlan,
}: {
  onSelectPlan: (plan: PricingPlanKey) => void;
}) {
  return (
    <section
      id="pricing"
      className="mt-20 border-y border-white/10 bg-[#161920]/80 py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-12 max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-3 text-xs font-extrabold uppercase text-[#6366f1]">
            <span className="h-px w-9 rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]" />
            Pricing
          </div>
          <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            Flexible packages for your next launch.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <article
              key={plan.key}
              className={`rounded-[1.75rem] border p-7 shadow-inner shadow-white/5 ${
                plan.popular
                  ? "border-[#6366f1]/30 bg-[#161920] shadow-[0_26px_75px_rgba(99,102,241,0.2)]"
                  : "border-white/10 bg-[#0d0f12]"
              }`}
            >
              <div className="mb-5 flex min-h-8 items-center justify-between gap-4">
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#a5b4fc]">
                  {plan.name}
                </p>
                {plan.popular && (
                  <span className="shrink-0 rounded-full bg-[#6366f1] px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-white">
                    Most Popular
                  </span>
                )}
              </div>

              <p className="text-4xl font-extrabold text-white">
                {formatPrice(plan.total)}
              </p>
              <p className="mt-2 text-sm font-semibold text-white/55">
                Total project price
              </p>
              <p className="mt-4 text-sm leading-7 text-white/68">
                {plan.description}
              </p>
              <p className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">
                30% retainer · {formatPrice(plan.deposit)} due today
              </p>
              <button
                type="button"
                onClick={() => onSelectPlan(plan.key)}
                className={`mt-6 inline-flex min-h-[52px] w-full items-center justify-center rounded-full text-sm font-extrabold transition-all duration-300 hover:-translate-y-1 ${
                  plan.popular
                    ? "bg-[#6366f1] px-6 text-white shadow-[0_18px_40px_rgba(99,102,241,0.35)]"
                    : "border border-white/15 bg-white/[0.04] px-6 text-white hover:border-[#6366f1] hover:bg-[#6366f1]/10"
                }`}
              >
                Get Started
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
