
ALTER TABLE public.profiles
ADD COLUMN subscription_plan text DEFAULT NULL,
ADD COLUMN plan_selected_at timestamptz DEFAULT NULL;
