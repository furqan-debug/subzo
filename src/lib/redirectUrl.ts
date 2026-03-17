import { Capacitor } from '@capacitor/core';

const NATIVE_SCHEME = 'com.subzo.app';

export function getRedirectUrl(path = '/'): string {
  if (Capacitor.isNativePlatform()) {
    return `${NATIVE_SCHEME}://${path.replace(/^\//, '')}`;
  }
  return `${window.location.origin}${path}`;
}
