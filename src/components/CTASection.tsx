import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const CTASection = () => {
  return (
    <section className="py-14 sm:py-24">
      <div className="container">
        <div className="relative overflow-hidden rounded-lg bg-secondary p-6 text-center sm:p-12 md:p-20">
          <div className="absolute top-0 left-0 w-full h-1 bg-hero-gradient" />
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h2 className="mb-6 font-display text-3xl font-bold text-secondary-foreground md:text-5xl">
              Ready to Get <span className="text-gradient">Connected?</span>
            </h2>
            <p className="text-secondary-foreground/70 text-lg max-w-2xl mx-auto mb-10 font-body">
              Whether you're looking for skilled help or want to showcase your talents,
              SkillConnect is your bridge to opportunity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="hero"
                size="lg"
                className="text-lg px-10 py-6"
                onClick={() => scrollTo("contact-form")}
              >
                Join as a Worker <ArrowRight className="ml-2" size={20} />
              </Button>
              <Button
                variant="heroOutline"
                size="lg"
                className="text-lg px-10 py-6 border-primary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                onClick={() => scrollTo("services")}
              >
                Find Services
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
