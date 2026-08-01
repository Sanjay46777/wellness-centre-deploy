CREATE TYPE public.user_role AS ENUM ('client', 'counsellor', 'head_counsellor', 'admin');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  role public.user_role NOT NULL DEFAULT 'client'::public.user_role,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.counsellors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  designation text,
  specialization text,
  photo_url text,
  qr_code_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  counsellor_id uuid NOT NULL REFERENCES public.counsellors(id) ON DELETE CASCADE,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  q1_comfort smallint CHECK (q1_comfort BETWEEN 1 AND 5),
  q2_understood smallint CHECK (q2_understood BETWEEN 1 AND 5),
  q3_time smallint CHECK (q3_time BETWEEN 1 AND 5),
  q4_quality smallint CHECK (q4_quality BETWEEN 1 AND 5),
  q5_respected smallint CHECK (q5_respected BETWEEN 1 AND 5),
  q6_supported smallint CHECK (q6_supported BETWEEN 1 AND 5),
  q7_hopeful smallint CHECK (q7_hopeful BETWEEN 1 AND 5),
  q8_safe smallint CHECK (q8_safe BETWEEN 1 AND 5),
  q9_communication smallint CHECK (q9_communication BETWEEN 1 AND 5),
  q10_overall smallint CHECK (q10_overall BETWEEN 1 AND 5),
  recommendation text CHECK (recommendation IN ('Yes', 'No', 'Maybe')),
  comments text,
  is_anonymous boolean NOT NULL DEFAULT true,
  respondent_email text
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counsellors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    'client'::public.user_role
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Helper: get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(uid uuid)
RETURNS public.user_role
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = uid;
$$;

-- Helper: get counsellor id for a profile
CREATE OR REPLACE FUNCTION public.get_counsellor_id_for_profile(uid uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT id FROM public.counsellors WHERE profile_id = uid LIMIT 1;
$$;

-- Profiles policies
CREATE POLICY "Admins manage profiles" ON public.profiles
  FOR ALL TO authenticated USING (public.get_user_role(auth.uid()) = 'admin'::public.user_role)
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin'::public.user_role);

CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users update own profile except role" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role IS NOT DISTINCT FROM public.get_user_role(auth.uid()));

-- Counsellors policies
CREATE POLICY "Anyone can view active counsellors" ON public.counsellors
  FOR SELECT TO anon USING (is_active = true);

CREATE POLICY "Authenticated can view counsellors" ON public.counsellors
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage counsellors" ON public.counsellors
  FOR ALL TO authenticated USING (public.get_user_role(auth.uid()) IN ('admin'::public.user_role, 'head_counsellor'::public.user_role))
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin'::public.user_role);

-- Feedback policies
CREATE POLICY "Anonymous submissions" ON public.feedback
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anonymous cannot read" ON public.feedback
  FOR SELECT TO anon USING (false);

CREATE POLICY "Authenticated submissions" ON public.feedback
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Counsellors read own feedback" ON public.feedback
  FOR SELECT TO authenticated
  USING (
    public.get_user_role(auth.uid()) IN ('admin'::public.user_role, 'head_counsellor'::public.user_role)
    OR (
      public.get_user_role(auth.uid()) = 'counsellor'::public.user_role
      AND counsellor_id = public.get_counsellor_id_for_profile(auth.uid())
    )
  );

CREATE POLICY "Head admin update feedback flags" ON public.feedback
  FOR UPDATE TO authenticated USING (public.get_user_role(auth.uid()) IN ('admin'::public.user_role, 'head_counsellor'::public.user_role))
  WITH CHECK (public.get_user_role(auth.uid()) IN ('admin'::public.user_role, 'head_counsellor'::public.user_role));

CREATE POLICY "Head admin delete feedback" ON public.feedback
  FOR DELETE TO authenticated USING (public.get_user_role(auth.uid()) IN ('admin'::public.user_role, 'head_counsellor'::public.user_role));

-- Seed counsellors
INSERT INTO public.counsellors (name, designation, specialization, is_active) VALUES
  ('Dr. Ananya Iyer', 'Senior Counsellor', 'Stress Management, Academic Pressure', true),
  ('Dr. Rahul Menon', 'Clinical Psychologist', 'Anxiety, Depression, Trauma', true),
  ('Ms. Priya Nair', 'Student Wellness Advisor', 'Relationships, Identity, Transitions', true),
  ('Dr. Vikram Shah', 'Psychiatrist', 'Crisis Intervention, Mood Disorders', true),
  ('Ms. Kavita Rao', 'Counsellor', 'Mindfulness, Self-esteem, Work-life Balance', true);
