CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  requested_role public.app_role;
  submitted_skills text[];
BEGIN
  requested_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'worker');

  SELECT COALESCE(array_agg(trim(value)) FILTER (WHERE trim(value) <> ''), '{}'::text[])
  INTO submitted_skills
  FROM jsonb_array_elements_text(COALESCE(NEW.raw_user_meta_data->'skills', '[]'::jsonb)) AS value;

  INSERT INTO public.profiles (id, email, full_name, phone, location, bio, hourly_rate, is_worker, skills)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'location', ''),
    COALESCE(NEW.raw_user_meta_data->>'bio', ''),
    CASE
      WHEN requested_role = 'worker' THEN COALESCE(NULLIF(NEW.raw_user_meta_data->>'hourly_rate', '')::numeric, 0)
      ELSE 0
    END,
    requested_role = 'worker',
    CASE WHEN requested_role = 'worker' THEN submitted_skills ELSE '{}'::text[] END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
    phone = COALESCE(NULLIF(EXCLUDED.phone, ''), public.profiles.phone),
    location = COALESCE(NULLIF(EXCLUDED.location, ''), public.profiles.location),
    bio = COALESCE(NULLIF(EXCLUDED.bio, ''), public.profiles.bio),
    hourly_rate = CASE WHEN EXCLUDED.is_worker THEN EXCLUDED.hourly_rate ELSE public.profiles.hourly_rate END,
    is_worker = EXCLUDED.is_worker,
    skills = CASE WHEN EXCLUDED.is_worker THEN EXCLUDED.skills ELSE public.profiles.skills END;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, requested_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;