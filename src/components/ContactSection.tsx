import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send, MapPin, Mail, Phone } from "lucide-react";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  email: z.string().trim().email("Please enter a valid email").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be under 200 characters"),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message must be under 2000 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

const contactInfo = [
  { icon: MapPin, label: "Location", value: "Harare, Zimbabwe" },
  { icon: Mail, label: "Email", value: "chikumbuscottz@gmail.com" },
  { icon: Phone, label: "Phone", value: "+263 77 140 2080" },
];

const ContactSection = () => {
  const { toast } = useToast();
  const [form, setForm] = useState<ContactForm>({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof ContactForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactForm, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ContactForm;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);

    const { error } = await (supabase as any).from("contact_submissions").insert({
      name: result.data.name,
      email: result.data.email,
      subject: result.data.subject,
      message: result.data.message,
      status: "new",
    });

    setSubmitting(false);

    if (error) {
      toast({
        title: "Message not sent",
        description: "Please try again or contact us directly by phone.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Message sent!",
      description: "We received your message and will get back to you soon.",
    });
    setForm({ name: "", email: "", subject: "", message: "" });
    setErrors({});
  };

  return (
    <section id="contact-form" className="bg-section-gradient py-14 sm:py-24">
      <div className="container">
        <div className="mb-10 text-center sm:mb-16">
          <p className="text-primary font-display font-semibold text-sm uppercase tracking-widest mb-3">
            Get In Touch
          </p>
          <h2 className="mb-4 font-display text-3xl font-bold text-foreground md:text-5xl">
            Send Us a <span className="text-gradient">Message</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-body">
            Have a question or want to partner with us? Fill out the form and our team will respond promptly.
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-5 lg:gap-12">
          {/* Contact Info */}
          <div className="space-y-6 lg:col-span-2 lg:space-y-8">
            {contactInfo.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <item.icon size={22} />
                </div>
                <div>
                  <p className="font-display font-bold text-foreground text-sm">{item.label}</p>
                  <p className="text-muted-foreground font-body mt-1">{item.value}</p>
                </div>
              </div>
            ))}

            <div className="p-6 rounded-2xl bg-secondary text-secondary-foreground mt-8">
              <h4 className="font-display font-bold mb-2">Office Hours</h4>
              <div className="space-y-1 text-secondary-foreground/70 text-sm font-body">
                <p>Monday – Friday: 8:00 AM – 5:00 PM</p>
                <p>Saturday: 9:00 AM – 1:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-lg border border-border bg-card p-5 shadow-card sm:p-8 lg:col-span-3"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-display font-semibold text-foreground mb-1.5 block">
                  Your Name
                </label>
                <Input
                  placeholder="Tadiwa Chikumbu"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="text-sm font-display font-semibold text-foreground mb-1.5 block">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="Philani@example.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label className="text-sm font-display font-semibold text-foreground mb-1.5 block">
                Subject
              </label>
              <Input
                placeholder="How can we help?"
                value={form.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                className={errors.subject ? "border-destructive" : ""}
              />
              {errors.subject && <p className="text-destructive text-xs mt-1">{errors.subject}</p>}
            </div>

            <div>
              <label className="text-sm font-display font-semibold text-foreground mb-1.5 block">
                Message
              </label>
              <Textarea
                placeholder="Tell us more about your inquiry..."
                rows={5}
                value={form.message}
                onChange={(e) => handleChange("message", e.target.value)}
                className={errors.message ? "border-destructive" : ""}
              />
              {errors.message && <p className="text-destructive text-xs mt-1">{errors.message}</p>}
            </div>

            <Button variant="hero" size="lg" className="w-full text-lg py-6" disabled={submitting}>
              {submitting ? "Sending..." : "Send Message"}
              {!submitting && <Send className="ml-2" size={18} />}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
