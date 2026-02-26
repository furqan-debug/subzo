
-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  reminder_days_before INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Subscription catalog (public, read-only)
CREATE TABLE public.subscription_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  category TEXT NOT NULL,
  default_price NUMERIC(10,2),
  billing_cycle TEXT DEFAULT 'monthly',
  cancel_url TEXT,
  cancellation_steps TEXT[],
  website_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Catalog is publicly readable" ON public.subscription_catalog FOR SELECT USING (true);

-- User subscriptions
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  catalog_id UUID REFERENCES public.subscription_catalog(id),
  name TEXT NOT NULL,
  logo_url TEXT,
  amount NUMERIC(10,2) NOT NULL,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  next_renewal DATE NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  status TEXT NOT NULL DEFAULT 'active',
  cancel_url TEXT,
  cancellation_steps TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own subscriptions" ON public.subscriptions FOR DELETE USING (auth.uid() = user_id);

-- Reminders
CREATE TABLE public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  days_before INTEGER NOT NULL DEFAULT 3,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders" ON public.reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reminders" ON public.reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reminders" ON public.reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reminders" ON public.reminders FOR DELETE USING (auth.uid() = user_id);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed subscription catalog with popular services
INSERT INTO public.subscription_catalog (name, logo_url, category, default_price, billing_cycle, cancel_url, cancellation_steps, website_url) VALUES
('Netflix', 'https://logo.clearbit.com/netflix.com', 'Entertainment', 15.49, 'monthly', 'https://www.netflix.com/cancelplan', ARRAY['Go to Netflix.com', 'Click your profile icon', 'Select "Account"', 'Click "Cancel Membership"', 'Confirm cancellation'], 'https://netflix.com'),
('Spotify', 'https://logo.clearbit.com/spotify.com', 'Music', 11.99, 'monthly', 'https://www.spotify.com/account/subscription/', ARRAY['Go to spotify.com/account', 'Click "Change plan"', 'Select "Cancel Premium"', 'Confirm cancellation'], 'https://spotify.com'),
('Disney+', 'https://logo.clearbit.com/disneyplus.com', 'Entertainment', 13.99, 'monthly', 'https://www.disneyplus.com/account', ARRAY['Go to DisneyPlus.com/account', 'Click your subscription', 'Select "Cancel Subscription"', 'Confirm'], 'https://disneyplus.com'),
('YouTube Premium', 'https://logo.clearbit.com/youtube.com', 'Entertainment', 13.99, 'monthly', 'https://www.youtube.com/paid_memberships', ARRAY['Go to youtube.com/paid_memberships', 'Click "Manage membership"', 'Select "Deactivate"', 'Confirm cancellation'], 'https://youtube.com'),
('Amazon Prime', 'https://logo.clearbit.com/amazon.com', 'Shopping', 14.99, 'monthly', 'https://www.amazon.com/mc/pipelines/cancel', ARRAY['Go to Amazon.com', 'Go to Account > Prime Membership', 'Click "End Membership"', 'Confirm cancellation'], 'https://amazon.com'),
('Hulu', 'https://logo.clearbit.com/hulu.com', 'Entertainment', 7.99, 'monthly', 'https://secure.hulu.com/account', ARRAY['Go to secure.hulu.com/account', 'Click "Cancel"', 'Select reason', 'Confirm cancellation'], 'https://hulu.com'),
('Apple Music', 'https://logo.clearbit.com/apple.com', 'Music', 10.99, 'monthly', 'https://support.apple.com/en-us/HT202039', ARRAY['Open Settings on iPhone', 'Tap your name > Subscriptions', 'Tap Apple Music', 'Tap "Cancel Subscription"'], 'https://music.apple.com'),
('HBO Max', 'https://logo.clearbit.com/hbomax.com', 'Entertainment', 15.99, 'monthly', 'https://www.max.com/account', ARRAY['Go to max.com', 'Click profile > Settings', 'Select "Manage Subscription"', 'Click "Cancel Subscription"'], 'https://max.com'),
('Adobe Creative Cloud', 'https://logo.clearbit.com/adobe.com', 'Productivity', 54.99, 'monthly', 'https://account.adobe.com/plans', ARRAY['Go to account.adobe.com', 'Click "Plans"', 'Select "Cancel Plan"', 'Follow prompts to confirm'], 'https://adobe.com'),
('Microsoft 365', 'https://logo.clearbit.com/microsoft.com', 'Productivity', 9.99, 'monthly', 'https://account.microsoft.com/services', ARRAY['Go to account.microsoft.com', 'Click "Services & subscriptions"', 'Find Microsoft 365', 'Click "Cancel"'], 'https://microsoft.com'),
('Slack', 'https://logo.clearbit.com/slack.com', 'Productivity', 8.75, 'monthly', 'https://slack.com/help/articles/218915077', ARRAY['Open Slack workspace settings', 'Go to Billing', 'Click "Cancel Plan"', 'Confirm downgrade to free'], 'https://slack.com'),
('Notion', 'https://logo.clearbit.com/notion.so', 'Productivity', 10.00, 'monthly', 'https://www.notion.so/profile', ARRAY['Go to Settings & Members', 'Click "Plans"', 'Select "Downgrade"', 'Confirm'], 'https://notion.so'),
('Figma', 'https://logo.clearbit.com/figma.com', 'Productivity', 15.00, 'monthly', 'https://www.figma.com/settings', ARRAY['Go to Figma Settings', 'Click "Account"', 'Select your plan', 'Click "Cancel plan"'], 'https://figma.com'),
('ChatGPT Plus', 'https://logo.clearbit.com/openai.com', 'Productivity', 20.00, 'monthly', 'https://chat.openai.com/', ARRAY['Go to chat.openai.com', 'Click profile > My plan', 'Click "Manage my subscription"', 'Select "Cancel plan"'], 'https://openai.com'),
('Dropbox', 'https://logo.clearbit.com/dropbox.com', 'Cloud', 11.99, 'monthly', 'https://www.dropbox.com/account/plan', ARRAY['Go to dropbox.com/account', 'Click "Plan"', 'Select "Cancel plan"', 'Confirm downgrade'], 'https://dropbox.com'),
('Google One', 'https://logo.clearbit.com/google.com', 'Cloud', 2.99, 'monthly', 'https://one.google.com/settings', ARRAY['Go to one.google.com', 'Click Settings', 'Select "Cancel membership"', 'Confirm'], 'https://one.google.com'),
('iCloud+', 'https://logo.clearbit.com/icloud.com', 'Cloud', 2.99, 'monthly', 'https://support.apple.com/en-us/HT201060', ARRAY['Open Settings on iPhone', 'Tap your name > iCloud', 'Tap "Manage Account Storage"', 'Downgrade to free'], 'https://icloud.com'),
('Gym Membership', NULL, 'Fitness', 30.00, 'monthly', NULL, ARRAY['Visit your gym in person', 'Request cancellation at front desk', 'Some gyms require written notice', 'Get confirmation in writing'], NULL),
('Peloton', 'https://logo.clearbit.com/peloton.com', 'Fitness', 44.00, 'monthly', 'https://www.onepeloton.com/settings/subscription', ARRAY['Go to onepeloton.com', 'Click Settings > Subscription', 'Select "Cancel Membership"', 'Confirm'], 'https://peloton.com'),
('Headspace', 'https://logo.clearbit.com/headspace.com', 'Health', 12.99, 'monthly', 'https://www.headspace.com/settings/subscription', ARRAY['Go to headspace.com', 'Click Settings > Subscription', 'Select "Cancel"', 'Confirm cancellation'], 'https://headspace.com'),
('NordVPN', 'https://logo.clearbit.com/nordvpn.com', 'Security', 12.99, 'monthly', 'https://my.nordaccount.com/dashboard/nordvpn/', ARRAY['Go to my.nordaccount.com', 'Click "Billing"', 'Select "Cancel automatic payments"', 'Confirm'], 'https://nordvpn.com'),
('ExpressVPN', 'https://logo.clearbit.com/expressvpn.com', 'Security', 12.95, 'monthly', 'https://www.expressvpn.com/subscriptions', ARRAY['Go to expressvpn.com account', 'Click "Manage Settings"', 'Select "Turn off automatic renewal"', 'Confirm'], 'https://expressvpn.com'),
('Canva Pro', 'https://logo.clearbit.com/canva.com', 'Productivity', 12.99, 'monthly', 'https://www.canva.com/settings/billing', ARRAY['Go to canva.com/settings', 'Click "Billing & plans"', 'Select "Cancel subscription"', 'Confirm'], 'https://canva.com'),
('LinkedIn Premium', 'https://logo.clearbit.com/linkedin.com', 'Professional', 29.99, 'monthly', 'https://www.linkedin.com/mypreferences/d/manage-premium', ARRAY['Go to LinkedIn Premium settings', 'Click "Manage Premium account"', 'Select "Cancel subscription"', 'Confirm'], 'https://linkedin.com'),
('Grammarly', 'https://logo.clearbit.com/grammarly.com', 'Productivity', 12.00, 'monthly', 'https://account.grammarly.com/subscription', ARRAY['Go to account.grammarly.com', 'Click "Subscription"', 'Select "Cancel subscription"', 'Confirm'], 'https://grammarly.com'),
('Duolingo Plus', 'https://logo.clearbit.com/duolingo.com', 'Education', 6.99, 'monthly', 'https://www.duolingo.com/settings/account', ARRAY['Go to duolingo.com settings', 'Click "Subscription"', 'Select "Cancel"', 'Confirm cancellation'], 'https://duolingo.com'),
('The New York Times', 'https://logo.clearbit.com/nytimes.com', 'News', 17.00, 'monthly', 'https://myaccount.nytimes.com/seg/', ARRAY['Go to myaccount.nytimes.com', 'Click "Subscription"', 'Select "Cancel"', 'Follow prompts'], 'https://nytimes.com'),
('Medium', 'https://logo.clearbit.com/medium.com', 'News', 5.00, 'monthly', 'https://medium.com/me/settings', ARRAY['Go to medium.com/me/settings', 'Click "Manage membership"', 'Select "Cancel membership"', 'Confirm'], 'https://medium.com'),
('Audible', 'https://logo.clearbit.com/audible.com', 'Entertainment', 14.95, 'monthly', 'https://www.audible.com/account/overview', ARRAY['Go to audible.com/account', 'Click "Cancel membership"', 'Select reason', 'Confirm cancellation'], 'https://audible.com'),
('Paramount+', 'https://logo.clearbit.com/paramountplus.com', 'Entertainment', 5.99, 'monthly', 'https://www.paramountplus.com/account/', ARRAY['Go to paramountplus.com/account', 'Click "Cancel Subscription"', 'Select reason', 'Confirm'], 'https://paramountplus.com'),
('Peacock', 'https://logo.clearbit.com/peacocktv.com', 'Entertainment', 5.99, 'monthly', 'https://www.peacocktv.com/account/plan', ARRAY['Go to peacocktv.com/account', 'Click "Plans & Payment"', 'Select "Cancel Plan"', 'Confirm'], 'https://peacocktv.com'),
('Twitch', 'https://logo.clearbit.com/twitch.tv', 'Entertainment', 9.99, 'monthly', 'https://www.twitch.tv/subscriptions', ARRAY['Go to twitch.tv/subscriptions', 'Find subscription', 'Click "Cancel Subscription"', 'Confirm'], 'https://twitch.tv'),
('Xbox Game Pass', 'https://logo.clearbit.com/xbox.com', 'Gaming', 16.99, 'monthly', 'https://account.microsoft.com/services', ARRAY['Go to account.microsoft.com', 'Find Game Pass', 'Click "Cancel"', 'Follow prompts'], 'https://xbox.com'),
('PlayStation Plus', 'https://logo.clearbit.com/playstation.com', 'Gaming', 13.99, 'monthly', 'https://store.playstation.com/subscriptions', ARRAY['Go to PlayStation Store', 'Click "Subscriptions"', 'Select PS Plus', 'Click "Cancel"'], 'https://playstation.com'),
('Nintendo Switch Online', 'https://logo.clearbit.com/nintendo.com', 'Gaming', 3.99, 'monthly', 'https://accounts.nintendo.com', ARRAY['Go to accounts.nintendo.com', 'Click "Shop Menu"', 'Select "Nintendo Switch Online"', 'Turn off automatic renewal'], 'https://nintendo.com'),
('Tidal', 'https://logo.clearbit.com/tidal.com', 'Music', 10.99, 'monthly', 'https://account.tidal.com/subscription', ARRAY['Go to account.tidal.com', 'Click "Subscription"', 'Select "Cancel"', 'Confirm'], 'https://tidal.com'),
('Deezer', 'https://logo.clearbit.com/deezer.com', 'Music', 10.99, 'monthly', 'https://www.deezer.com/account/subscription', ARRAY['Go to deezer.com/account', 'Click "Manage my subscription"', 'Select "Cancel"', 'Confirm'], 'https://deezer.com'),
('Pandora', 'https://logo.clearbit.com/pandora.com', 'Music', 9.99, 'monthly', 'https://www.pandora.com/account/settings', ARRAY['Go to pandora.com settings', 'Click "Subscription"', 'Select "Cancel"', 'Confirm'], 'https://pandora.com'),
('Evernote', 'https://logo.clearbit.com/evernote.com', 'Productivity', 14.99, 'monthly', 'https://www.evernote.com/Settings.action', ARRAY['Go to Evernote settings', 'Click "Account summary"', 'Select "Manage subscription"', 'Cancel'], 'https://evernote.com'),
('1Password', 'https://logo.clearbit.com/1password.com', 'Security', 2.99, 'monthly', 'https://my.1password.com/settings/billing', ARRAY['Go to my.1password.com', 'Click "Billing"', 'Select "Cancel subscription"', 'Confirm'], 'https://1password.com'),
('LastPass', 'https://logo.clearbit.com/lastpass.com', 'Security', 3.00, 'monthly', 'https://lastpass.com/delete_account.php', ARRAY['Go to LastPass vault', 'Click "Account Settings"', 'Select "Cancel subscription"', 'Confirm'], 'https://lastpass.com'),
('Zoom', 'https://logo.clearbit.com/zoom.us', 'Productivity', 13.33, 'monthly', 'https://zoom.us/account/billing', ARRAY['Go to zoom.us/account', 'Click "Billing"', 'Select "Cancel subscription"', 'Confirm downgrade'], 'https://zoom.us'),
('Coursera Plus', 'https://logo.clearbit.com/coursera.org', 'Education', 49.00, 'monthly', 'https://www.coursera.org/account-settings', ARRAY['Go to coursera.org settings', 'Click "Purchases"', 'Select "Cancel"', 'Confirm'], 'https://coursera.org'),
('Skillshare', 'https://logo.clearbit.com/skillshare.com', 'Education', 13.99, 'monthly', 'https://www.skillshare.com/settings/account', ARRAY['Go to skillshare.com settings', 'Click "Account"', 'Select "Cancel membership"', 'Confirm'], 'https://skillshare.com'),
('Strava', 'https://logo.clearbit.com/strava.com', 'Fitness', 11.99, 'monthly', 'https://www.strava.com/settings/subscription', ARRAY['Go to strava.com settings', 'Click "Subscription"', 'Select "Cancel"', 'Confirm'], 'https://strava.com'),
('Calm', 'https://logo.clearbit.com/calm.com', 'Health', 14.99, 'monthly', 'https://www.calm.com/account', ARRAY['Go to calm.com/account', 'Click "Manage subscription"', 'Select "Cancel"', 'Confirm'], 'https://calm.com');
