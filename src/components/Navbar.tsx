import { useState, useEffect } from "react";
import { Download, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPostAuthPath } from "@/lib/account-role";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Services", href: "#services" },
  { label: "Find Workers", href: "/workers" },
  { label: "Market", href: "#market" },
  { label: "Team", href: "#team" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact-form" },
];

const scrollTo = (href: string) => {
  if (href.startsWith("/")) {
    window.location.href = href;
    return;
  }
  const el = document.querySelector(href);
  el?.scrollIntoView({ behavior: "smooth" });
};

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [accountPath, setAccountPath] = useState("/profile");

  useEffect(() => {
    let mounted = true;
    let cleanup: (() => void) | undefined;

    const loadUser = async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      if (!mounted) return;

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          void getPostAuthPath(session.user).then((path) => {
            if (mounted) setAccountPath(path);
          });
        } else if (mounted) {
          setAccountPath("/profile");
        }
      });
      cleanup = () => subscription.unsubscribe();

      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) setUser(session?.user ?? null);
      if (session?.user && mounted) {
        const path = await getPostAuthPath(session.user);
        if (mounted) setAccountPath(path);
      }
    };

    const timeoutId = window.setTimeout(loadUser, 1200);

    return () => {
      mounted = false;
      window.clearTimeout(timeoutId);
      cleanup?.();
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <a
          href="#home"
          onClick={(e) => { e.preventDefault(); scrollTo("#home"); }}
          className="font-display text-2xl font-bold"
        >
          <span className="text-gradient">Skill</span>
          <span className="text-foreground">Connect</span>
        </a>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => { e.preventDefault(); scrollTo(link.href); }}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
            >
              {link.label}
            </a>
          ))}
          {user ? (
            <a href={accountPath}>
              <Button variant="hero" size="lg">
                <User className="mr-2 h-4 w-4" /> My Profile
              </Button>
            </a>
          ) : (
            <a href="/auth">
              <Button variant="hero" size="lg">
                Sign Up / Login
              </Button>
            </a>
          )}
          <a href="/install">
            <Button variant="heroOutline" size="lg">
              <Download className="mr-2 h-4 w-4" /> Install
            </Button>
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
          <div className="overflow-hidden border-b border-border bg-background lg:hidden">
            <div className="container py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    scrollTo(link.href);
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                >
                  {link.label}
                </a>
              ))}
              {user ? (
                <a href={accountPath} onClick={() => setOpen(false)}>
                  <Button variant="hero" size="lg" className="w-full">
                    <User className="mr-2 h-4 w-4" /> My Profile
                  </Button>
                </a>
              ) : (
                <a href="/auth" onClick={() => setOpen(false)}>
                  <Button variant="hero" size="lg" className="w-full">
                    Sign Up / Login
                  </Button>
                </a>
              )}
              <a href="/install" onClick={() => setOpen(false)}>
                <Button variant="heroOutline" size="lg" className="w-full">
                  <Download className="mr-2 h-4 w-4" /> Install App
                </Button>
              </a>
            </div>
          </div>
      )}
    </nav>
  );
};

export default Navbar;
