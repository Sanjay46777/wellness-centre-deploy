ALTER TABLE public.counsellors
ADD COLUMN email text UNIQUE;

COMMENT ON COLUMN public.counsellors.email IS 'Optional contact email for the counsellor.';