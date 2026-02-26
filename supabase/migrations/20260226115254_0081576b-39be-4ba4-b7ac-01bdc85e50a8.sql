
-- Top 10 with high-res SimpleIcons SVGs
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/netflix/E50914' WHERE name = 'Netflix';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/spotify/1DB954' WHERE name = 'Spotify';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/disneyplus/113CCF' WHERE name = 'Disney+';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/youtube/FF0000' WHERE name = 'YouTube Premium';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/amazon/FF9900' WHERE name = 'Amazon Prime';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/hulu/1CE783' WHERE name = 'Hulu';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/apple/999999' WHERE name = 'Apple Music';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/adobe/FF0000' WHERE name = 'Adobe Creative Cloud';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/microsoft/00A4EF' WHERE name = 'Microsoft 365';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/github/white' WHERE name = 'GitHub Pro';

-- Fix broken Clearbit URLs
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/canva/00C4CC' WHERE name = 'Canva Pro';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/openai/white' WHERE name = 'ChatGPT Plus';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/nytimes/white' WHERE name = 'The New York Times';
UPDATE subscription_catalog SET logo_url = 'https://www.google.com/s2/favicons?domain=pandora.com&sz=64' WHERE name = 'Pandora';

-- Upgrade all remaining services to SimpleIcons SVGs
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/notion/white' WHERE name = 'Notion';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/figma/F24E1E' WHERE name = 'Figma';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/slack/4A154B' WHERE name = 'Slack';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/zoom/0B5CFF' WHERE name = 'Zoom';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/dropbox/0061FF' WHERE name = 'Dropbox';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/nordvpn/4687FF' WHERE name = 'NordVPN';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/twitch/9146FF' WHERE name = 'Twitch';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/duolingo/58CC02' WHERE name = 'Duolingo Plus';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/linkedin/0A66C2' WHERE name = 'LinkedIn Premium';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/medium/white' WHERE name = 'Medium';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/evernote/00A82D' WHERE name = 'Evernote';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/grammarly/15C39A' WHERE name = 'Grammarly';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/strava/FC4C02' WHERE name = 'Strava';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/xbox/107C10' WHERE name = 'Xbox Game Pass';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/playstation/003791' WHERE name = 'PlayStation Plus';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/nintendo/E60012' WHERE name = 'Nintendo Switch Online';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/icloud/3693F5' WHERE name = 'iCloud+';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/appletv/white' WHERE name = 'Apple TV+';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/tidal/white' WHERE name = 'Tidal';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/coursera/0056D2' WHERE name = 'Coursera Plus';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/todoist/E44332' WHERE name = 'Todoist';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/headspace/F47D31' WHERE name = 'Headspace';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/audible/F8991C' WHERE name = 'Audible';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/crunchyroll/F47521' WHERE name = 'Crunchyroll';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/1password/0094F5' WHERE name = '1Password';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/lastpass/D32D27' WHERE name = 'LastPass';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/expressvpn/DA3940' WHERE name = 'ExpressVPN';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/skillshare/00FF84' WHERE name = 'Skillshare';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/peloton/white' WHERE name = 'Peloton';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/google/4285F4' WHERE name = 'Google One';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/deezer/A238FF' WHERE name = 'Deezer';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/hbo/white' WHERE name = 'HBO Max';
UPDATE subscription_catalog SET logo_url = 'https://www.google.com/s2/favicons?domain=calm.com&sz=64' WHERE name = 'Calm';
UPDATE subscription_catalog SET logo_url = 'https://www.google.com/s2/favicons?domain=masterclass.com&sz=64' WHERE name = 'MasterClass';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/kindle/white' WHERE name = 'Kindle Unlimited';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/tinder/FF6B6B' WHERE name = 'Tinder';
UPDATE subscription_catalog SET logo_url = 'https://cdn.simpleicons.org/paramount/0064FF' WHERE name = 'Paramount+';
UPDATE subscription_catalog SET logo_url = 'https://www.google.com/s2/favicons?domain=peacocktv.com&sz=64' WHERE name = 'Peacock';
