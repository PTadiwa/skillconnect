const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const quickLinks = [
  { label: "Home", id: "home" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Services", id: "services" },
  { label: "Market", id: "market" },
  { label: "Team", id: "team" },
  { label: "About", id: "about" },
  { label: "Contact", id: "contact-form" },
];

const Footer = () => {
  return (
    <footer className="bg-secondary py-12">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <h3 className="font-display text-2xl font-bold text-secondary-foreground mb-3">
              <span className="text-gradient">Skill</span>Connect
            </h3>
            <p className="text-secondary-foreground/60 max-w-md font-body">
              A digital service marketplace connecting skilled individuals with opportunities
              in real time. Empowering communities across Zimbabwe.
            </p>
            <p className="text-secondary-foreground/40 text-sm mt-4">
              Registered as a Private Limited Company — ICT Industry
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-secondary-foreground mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="text-left text-secondary-foreground/60 hover:text-primary transition-colors text-sm"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-secondary-foreground mb-4">Contact</h4>
            <div className="flex flex-col gap-2 text-secondary-foreground/60 text-sm">
              <p>Harare, Zimbabwe</p>
              <a href="mailto:info@skillconnect.co.zw" className="hover:text-primary transition-colors">
                info@skillconnect.co.zw
              </a>
              <a href="tel:+263771234567" className="hover:text-primary transition-colors">
                +263 77 140 2080
                +263 71 562 5096
              </a>
              <p>HIT Institute of Technology</p>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/10 pt-8 text-center">
          <p className="text-secondary-foreground/40 text-sm">
            © {new Date().getFullYear()} SkillConnect. All rights reserved. | HIT 2201 Business Plan Project
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
