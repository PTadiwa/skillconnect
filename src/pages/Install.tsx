import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Download, Monitor, Smartphone } from "lucide-react";

const Install = () => {
  return (
    <div className="min-h-screen bg-section-gradient">
      <Navbar />
      <main className="container pt-28 pb-16">
        <section className="mx-auto max-w-3xl text-center">
          <p className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-primary">
            Install SkillConnect
          </p>
          <h1 className="mb-5 font-display text-4xl font-bold text-foreground md:text-6xl">
            Use SkillConnect Like an <span className="text-gradient">App</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Add SkillConnect to your phone or computer from your browser for faster access.
          </p>
          <Button variant="hero" size="lg" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}>
            <Download className="mr-2 h-5 w-5" /> Install Instructions
          </Button>
        </section>

        <section className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
          <article className="rounded-lg border border-border bg-card p-6 shadow-card">
            <Smartphone className="mb-4 h-10 w-10 text-primary" />
            <h2 className="mb-3 font-display text-2xl font-bold text-foreground">Phones</h2>
            <ol className="space-y-3 text-left text-muted-foreground">
              <li>1. Open SkillConnect in your phone browser.</li>
              <li>2. Tap the browser menu or Share button.</li>
              <li>3. Choose Add to Home Screen or Install app.</li>
            </ol>
          </article>

          <article className="rounded-lg border border-border bg-card p-6 shadow-card">
            <Monitor className="mb-4 h-10 w-10 text-primary" />
            <h2 className="mb-3 font-display text-2xl font-bold text-foreground">Computers</h2>
            <ol className="space-y-3 text-left text-muted-foreground">
              <li>1. Open SkillConnect in Chrome, Edge, or Brave.</li>
              <li>2. Click the install icon in the address bar.</li>
              <li>3. Confirm Install to launch it from your desktop.</li>
            </ol>
          </article>
        </section>
      </main>
    </div>
  );
};

export default Install;