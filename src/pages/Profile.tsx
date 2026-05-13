import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LogOut, Save, ArrowLeft, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { resolveAccountRole } from "@/lib/account-role";

const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required").max(100, "Full name must be 100 characters or fewer"),
  phone: z.string().trim().min(1, "Phone number is required").max(30, "Phone number must be 30 characters or fewer"),
  location: z.string().trim().min(1, "Location is required").max(120, "Location must be 120 characters or fewer"),
  bio: z.string().trim().min(1, "Bio is required").max(700, "Bio must be 700 characters or fewer"),
  skills: z.array(z.string().trim().min(1)).max(30, "You can add up to 30 skills"),
  hourly_rate: z.number().min(0, "Hourly rate cannot be negative"),
  is_worker: z.boolean(),
}).superRefine((profile, ctx) => {
  if (profile.is_worker && profile.skills.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["skills"], message: "Add at least one skill before saving" });
  }
});

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    skills: [] as string[],
    hourly_rate: 0,
    is_worker: false,
    rating_average: 0,
    rating_count: 0,
  });
  const [skillInput, setSkillInput] = useState("");
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) navigate("/auth");
    });

    loadProfile();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }

    const resolvedRole = await resolveAccountRole(session.user);
    if (resolvedRole === "employer") {
      navigate("/workers", { replace: true });
      return;
    }

    const [profileResponse, factorsResponse] = await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single(),
      supabase.auth.mfa.listFactors(),
    ]);

    const { data, error } = profileResponse;
    const verifiedFactors = factorsResponse.data?.totp?.filter((factor) => factor.status === "verified") ?? [];
    setMfaEnabled(verifiedFactors.length > 0);
    setMfaLoading(false);

    if (data) {
      setProfile({
        full_name: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        location: data.location || "",
        bio: data.bio || "",
        skills: data.skills || [],
        hourly_rate: data.hourly_rate || 0,
        is_worker: data.is_worker || false,
        rating_average: Number(data.rating_average || 0),
        rating_count: data.rating_count || 0,
      });
    }
    if (error) console.error(error);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const validation = profileSchema.safeParse(profile);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Please complete the missing fields";
      toast.error("Profile not saved", { description: firstError });
      setSaving(false);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSaving(false); return; }

    const { error } = await supabase
      .from("profiles")
      .update({
        ...profile,
        ...validation.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id);

    if (error) {
      toast.error("Error saving profile", { description: error.message });
    } else {
      toast.success("Profile saved!", { description: "Your profile has been updated successfully." });
    }
    setSaving(false);
  };

  const addSkill = () => {
    const newSkills = skillInput
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (newSkills.length === 0) return;

    const existingSkills = new Set(profile.skills.map((skill) => skill.toLowerCase()));
    const uniqueSkills = newSkills.filter((skill) => !existingSkills.has(skill.toLowerCase()));

    if (uniqueSkills.length > 0) {
      setProfile({ ...profile, skills: [...profile.skills, ...uniqueSkills] });
    }

    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setProfile({ ...profile, skills: profile.skills.filter((s) => s !== skill) });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {profile.is_worker && (
              <div className="rounded-md border border-border bg-primary/10 p-4">
                <p className="text-sm font-semibold text-primary">Worker Rating</p>
                <p className="font-display text-3xl font-bold text-foreground">
                  {profile.rating_average.toFixed(1)} / 5
                </p>
                <p className="text-sm text-muted-foreground">
                  Based on {profile.rating_count} employer rating{profile.rating_count === 1 ? "" : "s"}
                </p>
              </div>
            )}
            <div className="rounded-md border border-border bg-secondary/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Two-Factor Authentication
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {mfaLoading ? "Checking your security settings..." : mfaEnabled ? "2FA is active on this account." : "2FA is not active yet. Sign in again to finish setup."}
                  </p>
                </div>
                <Button type="button" variant="outline" onClick={() => navigate("/auth?setup=2fa")}>Manage</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile.email} disabled className="opacity-60" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+265 999 123 456"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="Lilongwe, Malawi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourly_rate">Hourly Rate (MWK)</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  value={profile.hourly_rate}
                  onChange={(e) => setProfile({ ...profile, hourly_rate: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="is_worker"
                  checked={profile.is_worker}
                  onChange={(e) => setProfile({ ...profile, is_worker: e.target.checked })}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                <Label htmlFor="is_worker">I'm available for work</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell clients about your experience and expertise..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <div className="flex gap-2">
                <Input
                  id="skills"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="e.g. Plumbing, Carpentry"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                />
                <Button type="button" variant="outline" onClick={addSkill}>Add</Button>
              </div>
              {profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Button variant="hero" size="lg" className="w-full" onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
