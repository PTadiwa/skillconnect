import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "Free",
    period: "",
    desc: "Get started and find workers near you.",
    features: [
      "Browse all service categories",
      "View worker profiles & ratings",
      "Post up to 3 jobs per month",
      "Basic search filters",
      "Community support",
    ],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Premium",
    price: "$4.99",
    period: "/month",
    desc: "For clients who need reliable, fast service matching.",
    features: [
      "Unlimited job postings",
      "Priority worker matching",
      "Real-time messaging",
      "Advanced location filters",
      "Verified worker badges",
      "Dedicated support",
    ],
    cta: "Go Premium",
    featured: true,
  },
  {
    name: "Business",
    price: "$14.99",
    period: "/month",
    desc: "For small businesses with recurring service needs.",
    features: [
      "Everything in Premium",
      "Multiple team accounts",
      "Bulk job posting",
      "Invoice management",
      "Analytics dashboard",
      "Priority customer support",
    ],
    cta: "Contact Sales",
    featured: false,
  },
];

const revenueStreams = [
  { title: "Service Commissions", desc: "A small fee on each completed booking." },
  { title: "Premium Listings", desc: "Workers pay to boost visibility in search results." },
  { title: "Advertising", desc: "Targeted ads from related businesses and brands." },
];

const scrollToContact = () => {
  document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" });
};

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 bg-section-gradient">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary font-display font-semibold text-sm uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Simple, Transparent <span className="text-gradient">Pricing</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Choose the plan that fits your needs. All plans include access to our verified worker network.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                plan.featured
                  ? "bg-secondary text-secondary-foreground border-primary shadow-warm scale-105"
                  : "bg-card border-border shadow-card hover:border-primary/40"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-hero-gradient rounded-full text-primary-foreground text-xs font-bold">
                  Most Popular
                </div>
              )}
              <h3 className={`font-display font-bold text-xl mb-2 ${plan.featured ? "text-secondary-foreground" : "text-foreground"}`}>
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className={`text-4xl font-display font-bold ${plan.featured ? "text-primary" : "text-foreground"}`}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className={plan.featured ? "text-secondary-foreground/60" : "text-muted-foreground"}>
                    {plan.period}
                  </span>
                )}
              </div>
              <p className={`text-sm mb-6 ${plan.featured ? "text-secondary-foreground/70" : "text-muted-foreground"}`}>
                {plan.desc}
              </p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <span className={plan.featured ? "text-secondary-foreground/80" : "text-muted-foreground"}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.featured ? "hero" : "heroOutline"}
                size="lg"
                className="w-full"
                onClick={scrollToContact}
              >
                {plan.cta} <ArrowRight size={16} className="ml-1" />
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Revenue streams */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-display font-bold text-foreground text-center mb-8">
            Revenue Model
          </h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {revenueStreams.map((stream, i) => (
              <motion.div
                key={stream.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-xl bg-card border border-border shadow-card"
              >
                <h4 className="font-display font-bold text-foreground mb-2">{stream.title}</h4>
                <p className="text-muted-foreground text-sm">{stream.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
