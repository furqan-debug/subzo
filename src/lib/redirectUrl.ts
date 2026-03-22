const WEB_URL = 'https://www.subzoapp.com' as const;

export function getRedirectUrl(path = '/'): string {
  return `${WEB_URL}/auth/callback`;
}
