
ALTER TABLE public.subscriptions
  ADD COLUMN discount_percentage numeric DEFAULT NULL,
  ADD COLUMN discount_end_date date DEFAULT NULL,
  ADD COLUMN trial_end_date date DEFAULT NULL;
