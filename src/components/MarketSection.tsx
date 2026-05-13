import { Home, Store, GraduationCap, Hammer, TrendingUp, TrendingDown, Lightbulb, AlertTriangle } from "lucide-react";

const segments = [
  { icon: Home, title: "Households", desc: "Home repair, maintenance, cleaning and gardening services." },
  { icon: Store, title: "Small Businesses", desc: "Technical support, maintenance and operational services." },
  { icon: GraduationCap, title: "Students", desc: "Tutoring, computer repairs and technical assistance." },
  { icon: Hammer, title: "Skilled Workers", desc: "Seeking job opportunities and a platform to showcase skills." },
];

const swot = [
  {
    icon: TrendingUp,
    title: "Strengths",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    items: ["Real-time service matching", "Digital platform connecting workers & clients", "Ratings & review system"],
  },
  {
    icon: TrendingDown,
    title: "Weaknesses",
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    items: ["Requires strong marketing to gain users", "Dependence on internet access", "Building initial trust"],
  },
  {
    icon: Lightbulb,
    title: "Opportunities",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    items: ["Growing gig economy", "Increasing smartphone adoption", "Rising digital payment usage"],
  },
  {
    icon: AlertTriangle,
    title: "Threats",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    items: ["Competition from other platforms", "Internet connectivity issues", "Economic instability"],
  },
];

const MarketSection = () => {
  return (
    <section id="market" className="py-14 sm:py-24">
      <div className="container">
        <div className="mb-10 text-center sm:mb-16">
          <p className="text-primary font-display font-semibold text-sm uppercase tracking-widest mb-3">
            Market Analysis
          </p>
          <h2 className="mb-4 font-display text-3xl font-bold text-foreground md:text-5xl">
            Who We <span className="text-gradient">Serve</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Understanding our target market and competitive landscape to deliver maximum value.
          </p>
        </div>

        {/* Target Market Segments */}
        <div className="mb-14 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:mb-20 lg:grid-cols-4">
          {segments.map((seg) => (
            <div
              key={seg.title}
              className="group rounded-lg border border-border bg-card p-5 text-center shadow-card transition-all duration-300 hover:border-primary/40 hover:shadow-warm sm:p-6"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <seg.icon size={28} />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-2">{seg.title}</h3>
              <p className="text-muted-foreground text-sm">{seg.desc}</p>
            </div>
          ))}
        </div>

        {/* SWOT Analysis */}
        <div>
          <h3 className="text-2xl font-display font-bold text-foreground text-center mb-8">
            SWOT Analysis
          </h3>
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {swot.map((item) => (
              <div
                key={item.title}
                className={`p-6 rounded-2xl ${item.bg} border ${item.border}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <item.icon size={24} className={item.color} />
                  <h4 className={`font-display font-bold text-lg ${item.color}`}>{item.title}</h4>
                </div>
                <ul className="space-y-2">
                  {item.items.map((point) => (
                    <li key={point} className="text-foreground/80 text-sm flex items-start gap-2">
                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${item.color.replace("text-", "bg-")} flex-shrink-0`} />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketSection;
