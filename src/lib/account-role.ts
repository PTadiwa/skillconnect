import type { User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type AccountRole = "worker" | "employer";

export const getStoredSignupRole = (emailAddress?: string | null): AccountRole | null => {
  if (!emailAddress) return null;
  const storedRole = window.localStorage.getItem(`skillconnect_signup_role:${emailAddress.toLowerCase()}`);
  return storedRole === "worker" || storedRole === "employer" ? storedRole : null;
};

export const getRoleFromMetadata = (user?: Pick<User, "user_metadata" | "email"> | null): AccountRole | null => {
  const metadata = user?.user_metadata ?? {};

  if (metadata.role === "employer" || metadata.account_type === "employer") return "employer";
  if (metadata.role === "worker" || metadata.account_type === "worker") return "worker";

  return getStoredSignupRole(user?.email);
};

export const resolveAccountRole = async (userOverride?: User | null): Promise<AccountRole | null> => {
  const user = userOverride ?? (await supabase.auth.getSession()).data.session?.user ?? null;
  if (!user) return null;

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (roles?.some(({ role }) => role === "employer")) return "employer";
  if (roles?.some(({ role }) => role === "worker")) return "worker";

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_worker")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) return profile.is_worker === false ? "employer" : "worker";

  return getRoleFromMetadata(user);
};

export const getPostAuthPath = async (userOverride?: User | null) => {
  const role = await resolveAccountRole(userOverride);
  if (!role) return "/auth";
  return role === "employer" ? "/workers" : "/profile";
};

export const ensureProfileForSession = async (roleFallback?: AccountRole) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const metadata = session.user.user_metadata ?? {};
  const metadataRole = getRoleFromMetadata(session.user);

  const [{ data: existingRoles }, { data: existingProfile }] = await Promise.all([
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id),
    supabase
      .from("profiles")
      .select("id,is_worker")
      .eq("id", session.user.id)
      .maybeSingle(),
  ]);

  const dbRole: AccountRole | null = existingRoles?.some(({ role }) => role === "employer")
    ? "employer"
    : existingRoles?.some(({ role }) => role === "worker")
      ? "worker"
      : null;

  const profileRole: AccountRole | null = existingProfile
    ? existingProfile.is_worker === false ? "employer" : "worker"
    : null;

  const finalRole: AccountRole = dbRole ?? profileRole ?? metadataRole ?? roleFallback ?? "worker";
  const isWorker = finalRole === "worker";
  const skills = Array.isArray(metadata.skills) && isWorker ? metadata.skills.filter(Boolean) : [];

  if (existingProfile) {
    await supabase.from("profiles").update({
      is_worker: isWorker,
      hourly_rate: isWorker ? Number(metadata.hourly_rate || 0) : 0,
      skills: isWorker ? skills : [],
      updated_at: new Date().toISOString(),
    }).eq("id", session.user.id);
  } else {
    await supabase.from("profiles").insert({
      id: session.user.id,
      email: session.user.email ?? "",
      full_name: metadata.full_name ?? "",
      phone: metadata.phone ?? "",
      location: metadata.location ?? "",
      bio: metadata.bio ?? (isWorker ? "Looking for jobs" : "Looking for workers to give them jobs"),
      hourly_rate: isWorker ? Number(metadata.hourly_rate || 0) : 0,
      is_worker: isWorker,
      skills,
    });
  }

  if (!existingRoles?.some(({ role }) => role === finalRole)) {
    await supabase.from("user_roles").insert({ user_id: session.user.id, role: finalRole });
  }

  return finalRole;
};