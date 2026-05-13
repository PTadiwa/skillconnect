import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-workers.webp";
import heroImageMobile from "@/assets/hero-workers-mobile.webp";

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const HeroSection = () => {
  return (
    <section id="home" className="relative flex min-h-[88svh] items-center overflow-hidden pt-16 sm:min-h-screen">
      <div className="absolute inset-0">
        <picture>
          <source media="(max-width: 640px)" srcSet={heroImageMobile} />
          <img src={heroImage} alt="Skilled workers in Zimbabwe" className="h-full w-full object-cover" fetchPriority="high" width="1280" height="720" />
        </picture>
        <div className="absolute inset-0 bg-secondary/85" />
        <div className="absolute inset-0 bg-hero-gradient opacity-25" />
      </div>

      <div className="container relative z-10 py-10 sm:py-20">
        <div className="max-w-3xl">
          <p className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-primary sm:mb-4 sm:text-lg">
            Digital Service Marketplace
          </p>

          <h1 className="mb-4 font-display text-4xl font-bold leading-tight text-secondary-foreground sm:mb-6 sm:text-5xl md:text-7xl">
            Connecting <span className="text-gradient">Skills</span> with{" "}
            <span className="text-gradient">Opportunities</span>
          </h1>

          <p className="mb-7 max-w-2xl font-body text-base text-secondary-foreground/90 sm:mb-10 md:text-xl">
            Empowering skilled individuals in Zimbabwe by providing an accessible platform where
            talents meet real-time job opportunities. From plumbing to tutoring — find the right
            person for every task.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button
              variant="hero"
              size="lg"
              className="px-8 py-5 text-base sm:px-10 sm:py-6 sm:text-lg"
              onClick={() => scrollTo("services")}
            >
              Find a Worker
            </Button>
            <Button
              variant="heroOutline"
              size="lg"
              className="border-primary-foreground/60 px-8 py-5 text-base text-secondary-foreground hover:bg-primary-foreground/10 sm:px-10 sm:py-6 sm:text-lg"
              onClick={() => scrollTo("contact-form")}
            >
              Offer Your Skills
            </Button>
          </div>

          <div className="mt-8 grid max-w-lg grid-cols-3 gap-3 sm:mt-16 sm:gap-8">
            {[
              { value: "1,000+", label: "Service Providers" },
              { value: "5,000+", label: "Active Users" },
              { value: "10+", label: "Service Categories" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-xl font-bold text-primary md:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs text-secondary-foreground/80 sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
