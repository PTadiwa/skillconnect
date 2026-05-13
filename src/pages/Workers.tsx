import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, MapPin, Phone, ShieldCheck, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { resolveAccountRole } from "@/lib/account-role";

type Worker = {
  id: string;
  full_name: string;
  phone: string | null;
  location: string | null;
  bio: string | null;
  skills: string[] | null;
  hourly_rate: number | null;
  rating_average: number;
  rating_count: number;
};

const commonSkills = ["Plumbing", "Electrical", "Carpentry", "Painting", "Cleaning", "Tutoring", "Computer Repair", "Gardening"];

const Workers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedSkill = searchParams.get("skill") || "";
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerRole, setViewerRole] = useState<"worker" | "employer" | null>(null);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [callingWorkerId, setCallingWorkerId] = useState<string | null>(null);
  const [ratingWorkerId, setRatingWorkerId] = useState<string | null>(null);
  const [score, setScore] = useState(5);
  const [review, setReview] = useState("");

  useEffect(() => {
    loadWorkers();
  }, [selectedSkill]);

  useEffect(() => {
    const loadViewerState = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setViewerRole(null);
        setMfaEnabled(false);
        return;
      }

      const resolvedRole = await resolveAccountRole(session.user);
      setViewerRole(resolvedRole);

      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      setMfaEnabled((factorsData?.totp ?? []).some((factor) => factor.status === "verified"));
    };

    void loadViewerState();
  }, []);

  const loadWorkers = async () => {
    setLoading(true);
    let query = supabase
      .from("profiles")
      .select("id, full_name, phone, location, bio, skills, hourly_rate, rating_average, rating_count")
      .eq("is_worker", true)
      .order("rating_average", { ascending: false })
      .limit(30);

    if (selectedSkill) {
      query = query.contains("skills", [selectedSkill]);
    }

    const { data, error } = await query;

    if (error) {
      toast({ title: "Could not load workers", description: error.message, variant: "destructive" });
    } else {
      setWorkers((data || []) as Worker[]);
    }
    setLoading(false);
  };

  const requireEmployer = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: "Register first", description: "Please register as an employer before hiring workers.", variant: "destructive" });
      navigate("/auth?role=employer");
      return null;
    }

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "employer")
      .maybeSingle();

    if (!data) {
      toast({ title: "Employer account required", description: "Please sign up or update your account as an employer to hire workers.", variant: "destructive" });
      navigate("/auth?role=employer");
      return null;
    }

    return session;
  };

  const hireWorker = async (worker: Worker) => {
    const session = await requireEmployer();
    if (!session) return;

    if (!worker.phone) {
      toast({ title: "No phone number", description: "This worker has not added a phone number yet.", variant: "destructive" });
      return;
    }

    setCallingWorkerId(worker.id);
    window.location.href = `tel:${worker.phone}`;
  };

  const submitRating = async (workerId: string) => {
    const session = await requireEmployer();
    if (!session) return;

    const { error } = await supabase.from("worker_ratings" as never).upsert({
      worker_id: workerId,
      employer_id: session.user.id,
      score,
      review: review.trim().slice(0, 700),
      updated_at: new Date().toISOString(),
    } as never, { onConflict: "worker_id,employer_id" });

    if (error) {
      toast({ title: "Rating not saved", description: "Please register as an employer before rating workers.", variant: "destructive" });
      return;
    }

    toast({ title: "Rating saved", description: "This worker's rating has been updated." });
    setRatingWorkerId(null);
    setReview("");
    setScore(5);
    loadWorkers();
  };

  return (
    <div className="min-h-screen bg-background px-3 py-5 sm:px-4 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" onClick={() => navigate("/")} className="w-fit">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
          <a href="/auth"><Button variant="hero">Register Worker or Employer</Button></a>
        </div>

        <div className="mb-5 sm:mb-8">
          <p className="mb-3 text-primary font-display font-semibold text-sm uppercase tracking-widest">Find Workers</p>
          <h1 className="font-display text-3xl font-bold leading-tight text-foreground md:text-5xl">Choose a skill and hire rated people</h1>
        </div>

        {viewerRole === "employer" && (
          <Card className="mb-5 border-border bg-secondary/40 shadow-card sm:mb-8">
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Employer account</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  You are signed in as an employer. {mfaEnabled ? "2FA is active on this account." : "2FA is not active yet."}
                </p>
              </div>
              <Button type="button" variant="outline" onClick={() => navigate("/auth?setup=2fa")}>
                <ShieldCheck className="mr-2 h-4 w-4" /> Manage 2FA
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="mb-5 flex gap-2 overflow-x-auto pb-2 sm:mb-8 sm:flex-wrap sm:overflow-visible sm:pb-0">
          <Button className="shrink-0" variant={!selectedSkill ? "hero" : "outline"} onClick={() => setSearchParams({})}>All Skills</Button>
          {commonSkills.map((skill) => (
            <Button key={skill} className="shrink-0" variant={selectedSkill === skill ? "hero" : "outline"} onClick={() => setSearchParams({ skill })}>
              {skill}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading workers...
          </div>
        ) : workers.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No workers found for this skill yet.</CardContent></Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {workers.map((worker) => (
              <Card key={worker.id} className="shadow-card">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="font-display text-lg leading-tight">{worker.full_name || "Skilled Worker"}</CardTitle>
                    <div className="flex shrink-0 items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                      <Star className="h-4 w-4 fill-current" /> {Number(worker.rating_average || 0).toFixed(1)}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{worker.rating_count} employer rating{worker.rating_count === 1 ? "" : "s"}</p>
                </CardHeader>
                <CardContent className="space-y-3 p-4 pt-2">
                  {worker.location && <p className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> {worker.location}</p>}
                  <p className="line-clamp-3 text-sm text-muted-foreground">{worker.bio || "This worker is ready to be contacted for jobs."}</p>
                  <div className="flex flex-wrap gap-2">
                    {(worker.skills || []).slice(0, 4).map((skill) => <span key={skill} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">{skill}</span>)}
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-foreground">MWK {worker.hourly_rate || 0}/hr</span>
                    <Button type="button" variant="hero" size="sm" onClick={() => hireWorker(worker)} disabled={callingWorkerId === worker.id}>
                      <Phone className="mr-2 h-4 w-4" /> Hire
                    </Button>
                  </div>
                  {ratingWorkerId === worker.id ? (
                    <div className="space-y-3 rounded-md border border-border p-3">
                      <div className="space-y-2">
                        <Label htmlFor={`score-${worker.id}`}>Rating</Label>
                        <Input id={`score-${worker.id}`} type="number" min="1" max="5" value={score} onChange={(e) => setScore(Number(e.target.value))} />
                      </div>
                      <Textarea value={review} onChange={(e) => setReview(e.target.value)} placeholder="Write a short review" maxLength={700} />
                      <Button variant="hero" className="w-full" onClick={() => submitRating(worker.id)}>Save Rating</Button>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full" onClick={() => setRatingWorkerId(worker.id)}>Rate Worker</Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Workers;