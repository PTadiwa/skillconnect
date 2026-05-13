import {
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Sparkles,
  BookOpen,
  Monitor,
  Flower2,
} from "lucide-react";

const services = [
  { icon: Wrench, title: "Plumbing", desc: "Pipe repairs, installations & drainage" },
  { icon: Zap, title: "Electrical", desc: "Wiring, repairs & installations" },
  { icon: Hammer, title: "Carpentry", desc: "Furniture, doors & custom builds" },
  { icon: Paintbrush, title: "Painting", desc: "Interior & exterior painting" },
  { icon: Sparkles, title: "Cleaning", desc: "Home, office & yard cleaning" },
  { icon: BookOpen, title: "Tutoring", desc: "Academic & skills tutoring" },
  { icon: Monitor, title: "Computer Repair", desc: "Hardware & software fixes" },
  { icon: Flower2, title: "Gardening", desc: "Landscaping & garden maintenance" },
];

const ServicesSection = () => {
  const openWorkers = (skill: string) => {
    window.location.href = `/workers?skill=${encodeURIComponent(skill)}`;
  };

  return (
    <section id="services" className="py-14 sm:py-24">
      <div className="container">
        <div className="mb-10 text-center sm:mb-16">
          <p className="text-primary font-display font-semibold text-sm uppercase tracking-widest mb-3">
            Our Services
          </p>
          <h2 className="mb-4 font-display text-3xl font-bold text-foreground md:text-5xl">
            Skills You Can Find
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From quick repairs to specialized tasks, SkillConnect covers all the everyday services
            you need.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {services.map((service) => (
            <button
              key={service.title}
              type="button"
              onClick={() => openWorkers(service.title)}
              className="group cursor-pointer rounded-lg border border-border bg-card p-4 text-left transition-all duration-300 hover:border-primary/40 hover:shadow-warm sm:p-6"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <service.icon size={28} />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-2">{service.title}</h3>
              <p className="text-muted-foreground text-sm">{service.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
