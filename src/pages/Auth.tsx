import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ensureProfileForSession, getPostAuthPath, getStoredSignupRole, type AccountRole } from "@/lib/account-role";
import { Briefcase, Search, ShieldCheck } from "lucide-react";

type MfaStep = "form" | "enroll" | "verify";

const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : "Please try again.";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"worker" | "employer">("worker");
  const [skills, setSkills] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [loading, setLoading] = useState(false);
  const [mfaStep, setMfaStep] = useState<MfaStep>("form");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState("");
  const [mfaChallengeId, setMfaChallengeId] = useState("");
  const [mfaQrCode, setMfaQrCode] = useState("");
  const [postAuthPath, setPostAuthPath] = useState("/profile");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const wants2faSetup = searchParams.get("setup") === "2fa";

  useEffect(() => {
    const requestedRole = searchParams.get("role");
    if (requestedRole === "employer" || requestedRole === "worker") {
      setIsLogin(false);
      setRole(requestedRole);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {});

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        await ensureProfileForSession();
        if (wants2faSetup) {
          try {
            setPostAuthPath(await getPostAuthPath());
            await startMfaForCurrentSession();
            return;
          } catch (mfaError) {
            toast({ title: "2FA setup failed", description: getErrorMessage(mfaError), variant: "destructive" });
          }
        }
        navigate(await getPostAuthPath());
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, searchParams, wants2faSetup]);

  const startMfaForCurrentSession = async () => {
    const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError) throw factorsError;

    const verifiedFactor = factorsData.totp.find((factor) => factor.status === "verified");
    if (verifiedFactor) {
      const { data, error } = await supabase.auth.mfa.challenge({ factorId: verifiedFactor.id });
      if (error) throw error;
      setMfaFactorId(verifiedFactor.id);
      setMfaChallengeId(data.id);
      setMfaStep("verify");
      return;
    }

    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    if (error) throw error;
    setMfaFactorId(data.id);
    setMfaQrCode(data.totp.qr_code);
    setMfaStep("enroll");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      } else {
        try {
          await ensureProfileForSession();
          setPostAuthPath(await getPostAuthPath());
          await startMfaForCurrentSession();
        } catch (mfaError) {
          toast({ title: "2FA setup failed", description: getErrorMessage(mfaError), variant: "destructive" });
        }
      }
    } else {
      const skillList = skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            account_type: role,
            phone,
            location,
            bio,
            hourly_rate: role === "worker" ? hourlyRate : "",
            skills: role === "worker" ? skillList : [],
          },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      } else {
        window.localStorage.setItem(`skillconnect_signup_role:${email.toLowerCase()}`, role);
        await ensureProfileForSession(role);
        toast({ title: "Check your email", description: "We sent you a confirmation link to verify your account." });
      }
    }
    setLoading(false);
  };

  const verifyMfaCode = async () => {
    setLoading(true);
    try {
      if (mfaStep === "enroll") {
        const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: mfaFactorId });
        if (challengeError) throw challengeError;
        const { error } = await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId: challenge.id, code: mfaCode });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId: mfaChallengeId, code: mfaCode });
        if (error) throw error;
      }

      toast({ title: "2FA verified", description: "Your account is protected." });
      navigate(postAuthPath || await getPostAuthPath());
    } catch (error) {
      toast({ title: "Invalid 2FA code", description: getErrorMessage(error), variant: "destructive" });
    }
    setLoading(false);
  };

  if (mfaStep !== "form") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="text-center">
            <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-primary" />
            <CardTitle className="font-display text-2xl">Two-Factor Authentication</CardTitle>
            <CardDescription>
              {mfaStep === "enroll" ? "Scan this code in Google Authenticator, Authy, or another authenticator app." : "Enter the 6-digit code from your authenticator app."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mfaStep === "enroll" && mfaQrCode && (
              <div className="flex justify-center rounded-md border border-border bg-background p-4">
                <img src={mfaQrCode} alt="Two-factor authentication QR code" className="h-48 w-48" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="mfaCode">Authentication Code</Label>
              <Input id="mfaCode" inputMode="numeric" maxLength={6} value={mfaCode} onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))} placeholder="123456" />
            </div>
            <Button type="button" variant="hero" className="w-full" size="lg" disabled={loading || mfaCode.length < 6} onClick={verifyMfaCode}>
              {loading ? "Checking..." : "Verify & Continue"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl shadow-card">
        <CardHeader className="text-center">
          <a href="/" className="font-display text-2xl font-bold mb-4 inline-block">
            <span className="text-gradient">Skill</span>
            <span className="text-foreground">Connect</span>
          </a>
          <CardTitle className="font-display text-2xl">
            {isLogin ? "Welcome Back" : "Join SkillConnect"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Sign in to manage your profile"
              : role === "worker" ? "Worker accounts are for people looking for jobs" : "Employer accounts are for people looking for workers to give them jobs"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label>Register as</Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setRole("worker")}
                      className={`rounded-md border p-4 text-left transition-colors ${role === "worker" ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
                    >
                      <Briefcase className="mb-2 h-5 w-5" />
                      <span className="block text-sm font-semibold">Worker</span>
                      <span className="block text-xs">I am looking for jobs</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("employer")}
                      className={`rounded-md border p-4 text-left transition-colors ${role === "employer" ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
                    >
                      <Search className="mb-2 h-5 w-5" />
                      <span className="block text-sm font-semibold">Employer</span>
                      <span className="block text-xs">I am looking for workers to give them jobs</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tadiwa Chikumbu"
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+263 77 000 0000" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Harare" required />
                  </div>
                </div>
                {role === "worker" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="registerSkills">Your Skills</Label>
                      <Input
                        id="registerSkills"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="Plumbing, Carpentry, Painting"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        min="0"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        placeholder="10"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="workerBio">Work Experience</Label>
                      <Input id="workerBio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell clients what work you do" required />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="employerNeed">What workers do you need?</Label>
                    <Input id="employerNeed" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="I need plumbers, electricians, cleaners..." required />
                  </div>
                )}
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" variant="hero" className="w-full" size="lg" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
