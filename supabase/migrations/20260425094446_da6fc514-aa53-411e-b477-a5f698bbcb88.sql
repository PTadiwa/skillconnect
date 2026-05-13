DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('worker', 'employer');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own role" ON public.user_roles;
CREATE POLICY "Users can create own role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS rating_average NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.worker_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL,
  employer_id UUID NOT NULL,
  score INTEGER NOT NULL,
  review TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (worker_id, employer_id)
);

ALTER TABLE public.worker_ratings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.validate_worker_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.score < 1 OR NEW.score > 5 THEN
    RAISE EXCEPTION 'Rating score must be between 1 and 5';
  END IF;

  IF NEW.review IS NOT NULL AND length(NEW.review) > 700 THEN
    RAISE EXCEPTION 'Review must be 700 characters or fewer';
  END IF;

  IF NOT public.has_role(NEW.employer_id, 'employer') THEN
    RAISE EXCEPTION 'Only employers can rate workers';
  END IF;

  IF NOT public.has_role(NEW.worker_id, 'worker') THEN
    RAISE EXCEPTION 'Ratings can only be added for workers';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_worker_rating_trigger ON public.worker_ratings;
CREATE TRIGGER validate_worker_rating_trigger
BEFORE INSERT OR UPDATE ON public.worker_ratings
FOR EACH ROW
EXECUTE FUNCTION public.validate_worker_rating();

CREATE OR REPLACE FUNCTION public.refresh_worker_rating_summary()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_worker UUID;
BEGIN
  target_worker := COALESCE(NEW.worker_id, OLD.worker_id);

  UPDATE public.profiles
  SET
    rating_average = COALESCE((SELECT ROUND(AVG(score)::numeric, 1) FROM public.worker_ratings WHERE worker_id = target_worker), 0),
    rating_count = COALESCE((SELECT COUNT(*) FROM public.worker_ratings WHERE worker_id = target_worker), 0),
    updated_at = now()
  WHERE id = target_worker;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS refresh_worker_rating_summary_trigger ON public.worker_ratings;
CREATE TRIGGER refresh_worker_rating_summary_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.worker_ratings
FOR EACH ROW
EXECUTE FUNCTION public.refresh_worker_rating_summary();

DROP POLICY IF EXISTS "Ratings are publicly viewable" ON public.worker_ratings;
CREATE POLICY "Ratings are publicly viewable"
ON public.worker_ratings
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Employers can rate workers" ON public.worker_ratings;
CREATE POLICY "Employers can rate workers"
ON public.worker_ratings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = employer_id AND public.has_role(auth.uid(), 'employer'));

DROP POLICY IF EXISTS "Employers can update own ratings" ON public.worker_ratings;
CREATE POLICY "Employers can update own ratings"
ON public.worker_ratings
FOR UPDATE
TO authenticated
USING (auth.uid() = employer_id AND public.has_role(auth.uid(), 'employer'))
WITH CHECK (auth.uid() = employer_id AND public.has_role(auth.uid(), 'employer'));

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_worker_ratings_worker_id ON public.worker_ratings(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_ratings_employer_id ON public.worker_ratings(employer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON public.profiles USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_profiles_worker_rating ON public.profiles(is_worker, rating_average DESC);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role public.app_role;
BEGIN
  requested_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'worker');

  INSERT INTO public.profiles (id, email, full_name, is_worker)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    requested_role = 'worker'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
    is_worker = EXCLUDED.is_worker;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, requested_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();