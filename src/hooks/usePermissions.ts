import { useState, useEffect, useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { Camera } from 'expo-camera';

type PermissionStatus = 'undetermined' | 'granted' | 'denied';

interface PermissionsState {
  camera: PermissionStatus;
  microphone: PermissionStatus;
  allGranted: boolean;
  isLoading: boolean;
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionsState>({
    camera: 'undetermined',
    microphone: 'undetermined',
    allGranted: false,
    isLoading: true,
  });

  const checkPermissions = useCallback(async () => {
    try {
      const cameraStatus = await Camera.getCameraPermissionsAsync();
      const micStatus = await Camera.getMicrophonePermissionsAsync();

      const cameraPermission = cameraStatus.granted
        ? 'granted'
        : cameraStatus.canAskAgain
        ? 'undetermined'
        : 'denied';

      const micPermission = micStatus.granted
        ? 'granted'
        : micStatus.canAskAgain
        ? 'undetermined'
        : 'denied';

      setPermissions({
        camera: cameraPermission,
        microphone: micPermission,
        allGranted: cameraStatus.granted && micStatus.granted,
        isLoading: false,
      });

      return cameraStatus.granted && micStatus.granted;
    } catch (error) {
      console.error('Error checking permissions:', error);
      setPermissions((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  const requestPermissions = useCallback(async () => {
    try {
      setPermissions((prev) => ({ ...prev, isLoading: true }));

      const cameraResult = await Camera.requestCameraPermissionsAsync();
      const micResult = await Camera.requestMicrophonePermissionsAsync();

      const allGranted = cameraResult.granted && micResult.granted;

      setPermissions({
        camera: cameraResult.granted ? 'granted' : 'denied',
        microphone: micResult.granted ? 'granted' : 'denied',
        allGranted,
        isLoading: false,
      });

      if (!allGranted) {
        // Check if we can't ask again (user denied permanently)
        if (!cameraResult.canAskAgain || !micResult.canAskAgain) {
          showSettingsAlert();
        }
      }

      return allGranted;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      setPermissions((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  const showSettingsAlert = useCallback(() => {
    Alert.alert(
      'Permissions Required',
      'Camera and microphone access are required to stream. Please enable them in Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          },
        },
      ]
    );
  }, []);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  return {
    ...permissions,
    checkPermissions,
    requestPermissions,
    showSettingsAlert,
  };
}
