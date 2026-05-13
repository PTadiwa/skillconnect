import { Briefcase, Code, Settings, Megaphone } from "lucide-react";

const shareholders = [
  { name: "Founder / CEO", share: "60%", role: "Business leadership & strategy" },
  { name: "Technical Co-Founder", share: "25%", role: "Platform development" },
  { name: "Operations Partner", share: "15%", role: "Operations & marketing" },
];

const team = [
  {
    icon: Briefcase,
    title: "Chief Executive Officer",
    name: "Strategic Leader",
    desc: "Strategic planning, partnerships, investor relations and overall leadership.",
  },
  {
    icon: Code,
    title: "Chief Technology Officer",
    name: "Tech Lead",
    desc: "System architecture, platform development and cybersecurity.",
  },
  {
    icon: Settings,
    title: "Operations Manager",
    name: "Ops Lead",
    desc: "Daily business activities, onboarding service providers and monitoring performance.",
  },
  {
    icon: Megaphone,
    title: "Marketing Manager",
    name: "Growth Lead",
    desc: "Digital marketing campaigns, brand awareness and customer acquisition.",
  },
];

const TeamSection = () => {
  return (
    <section id="team" className="bg-section-gradient py-14 sm:py-24">
      <div className="container">
        <div className="mb-10 text-center sm:mb-16">
          <p className="text-primary font-display font-semibold text-sm uppercase tracking-widest mb-3">
            Our Team
          </p>
          <h2 className="mb-4 font-display text-3xl font-bold text-foreground md:text-5xl">
            Leadership & <span className="text-gradient">Organization</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            A structured management team focused on growth, accountability, and delivering value.
          </p>
        </div>

        {/* Shareholding */}
        <div className="mb-12 sm:mb-16">
          <h3 className="text-2xl font-display font-bold text-foreground text-center mb-8">
            Shareholding Structure
          </h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {shareholders.map((s) => (
              <div
                key={s.name}
                className="text-center p-6 rounded-2xl bg-card border border-border shadow-card"
              >
                <p className="text-4xl font-display font-bold text-primary mb-2">{s.share}</p>
                <p className="font-display font-bold text-foreground mb-1">{s.name}</p>
                <p className="text-muted-foreground text-sm">{s.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Personnel */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member) => (
            <div
              key={member.title}
              className="group rounded-lg border border-border bg-card p-5 text-center shadow-card transition-all duration-300 hover:border-primary/40 hover:shadow-warm sm:p-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <member.icon size={28} />
              </div>
              <h4 className="font-display font-bold text-foreground text-sm mb-1">{member.title}</h4>
              <p className="text-primary text-xs font-semibold mb-3">{member.name}</p>
              <p className="text-muted-foreground text-sm leading-relaxed">{member.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
