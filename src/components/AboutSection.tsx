import { Shield, Users, Lightbulb, Heart, Globe, Award } from "lucide-react";
import patternBg from "@/assets/pattern-bg.webp";

const values = [
  { icon: Heart, title: "Empowerment", desc: "Enabling individuals to achieve economic independence." },
  { icon: Users, title: "Inclusivity", desc: "Equal opportunities regardless of background." },
  { icon: Shield, title: "Integrity", desc: "Operating with honesty, transparency and fairness." },
  { icon: Lightbulb, title: "Innovation", desc: "Continuously improving to meet evolving needs." },
  { icon: Globe, title: "Community", desc: "Strengthening local connections between people." },
  { icon: Award, title: "Respect", desc: "Recognizing the dignity and value of every individual." },
];

const AboutSection = () => {
  return (
    <section id="about" className="relative overflow-hidden py-14 sm:py-24">
      {/* Pattern accent */}
      <div className="absolute top-0 right-0 w-80 h-40 opacity-10">
        <img src={patternBg} alt="" className="h-full w-full object-cover" loading="lazy" />
      </div>

      <div className="container relative z-10">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left - About text */}
          <div>
            <p className="text-primary font-display font-semibold text-sm uppercase tracking-widest mb-3">
              About Us
            </p>
            <h2 className="mb-6 font-display text-3xl font-bold text-foreground md:text-5xl">
              Bridging the Gap Between{" "}
              <span className="text-gradient">Skills & Needs</span>
            </h2>
            <div className="space-y-4 font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>
                SkillConnect is a digital service marketplace designed to connect clients with
                skilled individuals in real time for on-demand services and short-term tasks.
              </p>
              <p>
                In Zimbabwe, a significant portion of the workforce operates informally —
                possessing valuable skills like carpentry, plumbing, and electrical work but
                lacking platforms to showcase their abilities.
              </p>
              <p>
                We formalize opportunities for informal workers while improving access to
                reliable services for households, students, and small businesses.
              </p>
            </div>

            {/* Vision & Mission */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6">
              <div className="p-5 rounded-xl bg-primary/5 border border-primary/20">
                <h4 className="font-display font-bold text-foreground mb-2">Our Vision</h4>
                <p className="text-muted-foreground text-sm">
                  To be the platform that unlocks untapped skills and connects them to
                  opportunities, reshaping the labour market through technology.
                </p>
              </div>
              <div className="p-5 rounded-xl bg-accent/5 border border-accent/20">
                <h4 className="font-display font-bold text-foreground mb-2">Our Mission</h4>
                <p className="text-muted-foreground text-sm">
                  Empower skilled individuals without formal credentials by providing an
                  accessible digital platform to showcase talents and connect with jobs.
                </p>
              </div>
            </div>
          </div>

          {/* Right - Values */}
          <div>
            <h3 className="text-2xl font-display font-bold text-foreground mb-8">Core Values</h3>
            <div className="grid sm:grid-cols-2 gap-5">
              {values.map((value, i) => (
                <div
                  key={value.title}
                  className="flex gap-4 p-4 rounded-xl bg-card shadow-card border border-border"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <value.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-foreground text-sm">{value.title}</h4>
                    <p className="text-muted-foreground text-xs mt-1">{value.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
