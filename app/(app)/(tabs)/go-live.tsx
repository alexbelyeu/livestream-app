import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { VideoPreviewView, useCamera } from '@fishjam-cloud/react-native-client';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { usePermissions } from '@/hooks/usePermissions';
import { useStreamStore } from '@/stores/streamStore';
import { useAuthStore } from '@/stores/authStore';

export default function GoLiveScreen() {
  const [title, setTitle] = useState('');
  const [isPreparingCamera, setIsPreparingCamera] = useState(false);

  const { allGranted, isLoading: permissionsLoading, requestPermissions } = usePermissions();
  const { prepareCamera, isCameraOn } = useCamera();
  const setStreamTitle = useStreamStore((state) => state.setStreamTitle);
  const user = useAuthStore((state) => state.user);

  // Initialize camera when permissions are granted
  useEffect(() => {
    const initCamera = async () => {
      if (allGranted && !isCameraOn) {
        setIsPreparingCamera(true);
        try {
          await prepareCamera({ cameraEnabled: true });
        } catch (error) {
          console.error('Failed to prepare camera:', error);
        } finally {
          setIsPreparingCamera(false);
        }
      }
    };
    initCamera();
  }, [allGranted, isCameraOn, prepareCamera]);

  const handleRequestPermissions = async () => {
    await requestPermissions();
  };

  const handleGoLive = () => {
    // Generate a unique room name based on user and timestamp
    const roomName = `stream-${user?.id || 'anon'}-${Date.now()}`;
    setStreamTitle(title);

    // Pass room name to broadcast screen via params
    router.push({
      pathname: '/(app)/stream/broadcast',
      params: { roomName, title },
    });
  };

  const renderCameraPreview = () => {
    if (permissionsLoading || isPreparingCamera) {
      return (
        <View style={styles.preview}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.previewHint}>
            {permissionsLoading ? 'Checking permissions...' : 'Starting camera...'}
          </Text>
        </View>
      );
    }

    if (!allGranted) {
      return (
        <Pressable style={styles.preview} onPress={handleRequestPermissions}>
          <Text style={styles.previewText}>Camera Access Required</Text>
          <Text style={styles.previewHint}>Tap to grant camera and microphone permissions</Text>
        </Pressable>
      );
    }

    if (isCameraOn) {
      return (
        <View style={styles.cameraContainer}>
          <VideoPreviewView style={styles.camera} />
        </View>
      );
    }

    return (
      <View style={styles.preview}>
        <Text style={styles.previewText}>Camera Preview</Text>
        <Text style={styles.previewHint}>Camera will appear here</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Go Live</Text>
      </View>

      <View style={styles.content}>
        {/* Camera preview */}
        {renderCameraPreview()}

        {/* Stream settings */}
        <View style={styles.settings}>
          <Text style={styles.label}>Stream Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="What are you streaming?"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Go Live button */}
        <Pressable
          style={[
            styles.button,
            (!title || !allGranted) && styles.buttonDisabled,
          ]}
          onPress={handleGoLive}
          disabled={!title || !allGranted}
        >
          <Text style={styles.buttonText}>
            {!allGranted ? 'Grant Permissions First' : 'Start Streaming'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  preview: {
    aspectRatio: 16 / 9,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  cameraContainer: {
    aspectRatio: 16 / 9,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  previewText: {
    ...typography.body,
    color: colors.textMuted,
  },
  previewHint: {
    ...typography.caption,
    color: colors.textDisabled,
    marginTop: spacing.xs,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  settings: {
    gap: spacing.sm,
  },
  label: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.live,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: spacing.lg,
  },
  buttonDisabled: {
    backgroundColor: colors.surfaceHover,
  },
  buttonText: {
    ...typography.button,
    color: colors.text,
  },
});
