/**
 * Email verification / password reset links must use a web URL so they work
 * when clicked in any email client (Gmail wraps URLs through google.com/url,
 * custom schemes like com.subzo.app:// break).
 *
 * The web app's /auth/callback page instantly redirects to the native app
 * scheme, so the user never actually sees the web app.
 */

const WEB_URL = 'https://8f6f7216-fd23-4557-bf5f-8e7ab00fbcd0.lovableproject.com';

export function getRedirectUrl(path = '/'): string {
  // Always redirect through the web callback page which bounces to native
  return `${WEB_URL}/auth/callback`;
}
