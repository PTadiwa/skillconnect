import { Search, UserCheck, MessageSquare, Star } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search Services",
    description: "Browse service categories or search by skill, location, and availability.",
  },
  {
    icon: UserCheck,
    title: "Choose a Worker",
    description: "View profiles, ratings, and reviews to select the best match for your task.",
  },
  {
    icon: MessageSquare,
    title: "Connect Instantly",
    description: "Chat directly with service providers and agree on terms in real time.",
  },
  {
    icon: Star,
    title: "Rate & Review",
    description: "Leave feedback to help the community and build trust on the platform.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="bg-section-gradient py-14 sm:py-24">
      <div className="container">
        <div className="mb-10 text-center sm:mb-16">
          <p className="text-primary font-display font-semibold text-sm uppercase tracking-widest mb-3">
            How It Works
          </p>
          <h2 className="font-display text-3xl font-bold text-foreground md:text-5xl">
            Simple. Fast. Reliable.
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-4">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative text-center group"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-border" />
              )}

              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-card">
                <step.icon size={32} />
              </div>

              <h3 className="text-xl font-display font-bold text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground font-body leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
