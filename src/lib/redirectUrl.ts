import { Capacitor } from '@capacitor/core';

const NATIVE_SCHEME = 'com.subzo.app';

export function getRedirectUrl(path = '/'): string {
  const platform = Capacitor.getPlatform();
  if (platform === 'android' || platform === 'ios') {
    return `${NATIVE_SCHEME}://${path.replace(/^\//, '')}`;
  }
  return `${window.location.origin}${path}`;
}
