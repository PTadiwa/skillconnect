CREATE OR REPLACE FUNCTION public.validate_profile_before_save()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    NEW.full_name := trim(COALESCE(NEW.full_name, ''));
    NEW.phone := trim(COALESCE(NEW.phone, ''));
    NEW.location := trim(COALESCE(NEW.location, ''));
    NEW.bio := trim(COALESCE(NEW.bio, ''));

    IF NEW.full_name = '' THEN
      RAISE EXCEPTION 'Full name is required';
    END IF;

    IF length(NEW.full_name) > 100 THEN
      RAISE EXCEPTION 'Full name must be 100 characters or fewer';
    END IF;

    IF NEW.phone = '' THEN
      RAISE EXCEPTION 'Phone number is required';
    END IF;

    IF length(NEW.phone) > 30 THEN
      RAISE EXCEPTION 'Phone number must be 30 characters or fewer';
    END IF;

    IF NEW.location = '' THEN
      RAISE EXCEPTION 'Location is required';
    END IF;

    IF length(NEW.location) > 120 THEN
      RAISE EXCEPTION 'Location must be 120 characters or fewer';
    END IF;

    IF NEW.bio = '' THEN
      RAISE EXCEPTION 'Bio is required';
    END IF;

    IF length(NEW.bio) > 700 THEN
      RAISE EXCEPTION 'Bio must be 700 characters or fewer';
    END IF;

    IF COALESCE(NEW.is_worker, false) AND COALESCE(array_length(NEW.skills, 1), 0) = 0 THEN
      RAISE EXCEPTION 'Add at least one skill before saving';
    END IF;

    IF COALESCE(NEW.hourly_rate, 0) < 0 THEN
      RAISE EXCEPTION 'Hourly rate cannot be negative';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS validate_profile_before_save_trigger ON public.profiles;

CREATE TRIGGER validate_profile_before_save_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_profile_before_save();