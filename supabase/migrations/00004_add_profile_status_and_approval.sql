CREATE TYPE public.profile_status AS ENUM ('pending', 'approved', 'rejected');

ALTER TABLE public.profiles
ADD COLUMN status public.profile_status NOT NULL DEFAULT 'pending';

COMMENT ON COLUMN public.profiles.status IS 'Approval status. Students are auto-approved; head admins require admin approval.';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role public.user_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'client'::public.user_role);
  user_status public.profile_status;
BEGIN
  IF user_role = 'student' THEN
    user_status := 'approved';
  ELSE
    user_status := 'pending';
  END IF;

  INSERT INTO public.profiles (id, email, role, status, full_name, student_id, phone)
  VALUES (
    NEW.id,
    NEW.email,
    user_role,
    user_status,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'student_id',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;

UPDATE public.profiles SET status = 'approved';