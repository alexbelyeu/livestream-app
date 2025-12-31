import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { VideoPreviewView } from '@fishjam-cloud/react-native-client';
import { useEffect, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { useStreamStore } from '@/stores/streamStore';
import { useStreaming } from '@/hooks/useStreaming';
import { useAuthStore } from '@/stores/authStore';

export default function BroadcastScreen() {
  const insets = useSafeAreaInsets();
  const { roomName, title } = useLocalSearchParams<{ roomName: string; title: string }>();
  const user = useAuthStore((state) => state.user);
  const [hasStarted, setHasStarted] = useState(false);

  const {
    isConnected,
    isConnecting,
    isCameraOn,
    isMicOn,
    error,
    remotePeers,
    startBroadcast,
    leaveRoom,
    toggleCamera,
    toggleMicrophone,
    switchCamera,
  } = useStreaming();

  const { streamTitle, viewerCount } = useStreamStore();

  // Start broadcasting when screen mounts
  useEffect(() => {
    const initBroadcast = async () => {
      if (roomName && user && !hasStarted) {
        setHasStarted(true);
        try {
          // Use a unique broadcaster name
          const broadcasterName = `${user.displayName || user.username}-host`;
          await startBroadcast(roomName, broadcasterName);
        } catch (err) {
          console.error('Failed to start broadcast:', err);
        }
      }
    };
    initBroadcast();
  }, [roomName, user, hasStarted, startBroadcast]);

  const handleEndStream = async () => {
    await leaveRoom();
    router.back();
  };

  const handleCopyRoomId = async () => {
    if (roomName) {
      await Clipboard.setStringAsync(roomName);
      Alert.alert('Copied!', `Room ID: ${roomName}\n\nJoin at room.fishjam.io`);
    }
  };

  // Show loading state while connecting
  if (isConnecting) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Starting broadcast...</Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera preview */}
      {isCameraOn ? (
        <VideoPreviewView style={styles.fullscreen} />
      ) : (
        <View style={styles.cameraOff}>
          <Text style={styles.cameraOffText}>Camera Off</Text>
        </View>
      )}

      {/* Controls overlay */}
      <View style={styles.overlay}>
        <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable style={styles.closeButton} onPress={handleEndStream}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>

          <View style={[styles.liveBadge, !isConnected && styles.liveBadgeConnecting]}>
            <Text style={styles.liveText}>{isConnected ? 'LIVE' : 'CONNECTING'}</Text>
          </View>

          <View style={styles.streamInfo}>
            <Text style={styles.streamTitle} numberOfLines={1}>
              {streamTitle || 'Untitled Stream'}
            </Text>
          </View>

          <Pressable style={styles.copyButton} onPress={handleCopyRoomId}>
            <Text style={styles.copyText}>Copy Room ID</Text>
          </Pressable>
        </View>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.controls}>
            <Pressable
              style={[styles.controlButton, !isMicOn && styles.controlButtonActive]}
              onPress={toggleMicrophone}
            >
              <Text style={styles.controlIcon}>{isMicOn ? '🎤' : '🔇'}</Text>
              <Text style={styles.controlLabel}>
                {isMicOn ? 'Mute' : 'Unmute'}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.controlButton, !isCameraOn && styles.controlButtonActive]}
              onPress={toggleCamera}
            >
              <Text style={styles.controlIcon}>{isCameraOn ? '📹' : '📷'}</Text>
              <Text style={styles.controlLabel}>
                {isCameraOn ? 'Camera' : 'Off'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.controlButton}
              onPress={switchCamera}
            >
              <Text style={styles.controlIcon}>🔄</Text>
              <Text style={styles.controlLabel}>Flip</Text>
            </Pressable>

            <Pressable style={styles.endButton} onPress={handleEndStream}>
              <Text style={styles.endIcon}>⏹</Text>
              <Text style={styles.endLabel}>End</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textMuted,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  retryText: {
    ...typography.button,
    color: colors.text,
  },
  fullscreen: {
    ...StyleSheet.absoluteFillObject,
  },
  cameraOff: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraOffText: {
    ...typography.h3,
    color: colors.textMuted,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: colors.text,
    fontSize: 18,
  },
  liveBadge: {
    backgroundColor: colors.live,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  liveBadgeConnecting: {
    backgroundColor: colors.warning || '#FFA500',
  },
  liveText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
  streamInfo: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  streamTitle: {
    ...typography.bodySmall,
    color: colors.text,
  },
  copyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  copyText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  bottomBar: {
    padding: spacing.lg,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  controlButton: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.overlay,
    borderRadius: borderRadius.lg,
    minWidth: 72,
  },
  controlButtonActive: {
    backgroundColor: colors.surfaceHover,
  },
  controlIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  controlLabel: {
    ...typography.caption,
    color: colors.text,
  },
  endButton: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.error,
    borderRadius: borderRadius.lg,
    minWidth: 72,
  },
  endIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  endLabel: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
});
