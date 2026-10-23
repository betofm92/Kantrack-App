import * as Crypto from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';

const directory = () => new Directory(Paths.document, 'kantrack-demo-photos');

export async function preservePhoto(sourceUri: string): Promise<string> {
  const folder = directory();
  folder.create({ idempotent: true, intermediates: true });
  const target = new File(folder, `${Crypto.randomUUID()}.jpg`);
  await new File(sourceUri).copy(target);
  return target.uri;
}

export function clearDemoPhotos(): void {
  const folder = directory();
  if (folder.exists) folder.delete();
}
