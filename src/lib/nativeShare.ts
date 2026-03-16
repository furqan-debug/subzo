import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const isNative = Capacitor.isNativePlatform();

/** Write a file to cache and open the native share sheet */
export async function shareFileNative(
  fileName: string,
  data: string,
  mimeType: string,
  encoding?: Encoding,
) {
  const result = await Filesystem.writeFile({
    path: fileName,
    data,
    directory: Directory.Cache,
    encoding,
  });

  await Share.share({
    title: fileName,
    url: result.uri,
  });
}

/** Share a base64-encoded binary file (e.g. PDF) */
export async function shareBinaryFileNative(fileName: string, base64Data: string) {
  const result = await Filesystem.writeFile({
    path: fileName,
    data: base64Data,
    directory: Directory.Cache,
  });

  await Share.share({
    title: fileName,
    url: result.uri,
  });
}

export { isNative };
