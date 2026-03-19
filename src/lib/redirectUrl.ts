/**
 * Always return a web URL for email redirects (signup verification, password reset).
 * Custom schemes like com.subzo.app:// don't work when users open email links
 * in a browser (especially Gmail which wraps URLs through google.com/url).
 * The web app handles the auth callback, and the native deep link handler
 * picks it up if the app is installed.
 */

const WEB_URL = 'https://8f6f7216-fd23-4557-bf5f-8e7ab00fbcd0.lovableproject.com';

export function getRedirectUrl(path = '/'): string {
  return `${WEB_URL}${path}`;
}
