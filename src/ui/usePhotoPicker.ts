import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { preservePhoto } from '../infrastructure/localPhotoStore';

export function usePhotoPicker() {
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [choosing, setChoosing] = useState(false);

  async function choose(camera: boolean) {
    if (choosing) return;
    setChoosing(true);
    try {
      const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permiso requerido', 'Autoriza el acceso para adjuntar una foto.');
        return;
      }
      const result = camera
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
      if (!result.canceled && result.assets[0]?.uri) setPhotoUri(await preservePhoto(result.assets[0].uri));
    } catch {
      Alert.alert('No se pudo abrir la cámara o galería');
    } finally {
      setChoosing(false);
    }
  }

  return { photoUri, choosing, choose, clear: () => setPhotoUri(undefined) };
}
