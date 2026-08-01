ALTER TYPE public.user_role ADD VALUE 'student';

ALTER TABLE public.profiles
  ADD COLUMN full_name text,
  ADD COLUMN student_id text,
  ADD COLUMN phone text;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'client'::public.user_role),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

ALTER TABLE public.feedback
  ADD COLUMN user_id uuid REFERENCES auth.users(id);