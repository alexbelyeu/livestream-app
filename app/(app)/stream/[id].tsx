import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { VideoRendererView } from '@fishjam-cloud/react-native-client';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { useStreaming } from '@/hooks/useStreaming';
import { useAuthStore } from '@/stores/authStore';

export default function WatchStreamScreen() {
  const { id, title, streamerName } = useLocalSearchParams<{
    id: string;
    title?: string;
    streamerName?: string;
  }>();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const [hasJoined, setHasJoined] = useState(false);

  const {
    isConnected,
    isConnecting,
    error,
    remotePeers,
    joinAsViewer,
    leaveRoom,
  } = useStreaming();

  // Join the room as viewer when screen mounts
  useEffect(() => {
    const joinStream = async () => {
      if (id && user && !hasJoined) {
        setHasJoined(true);
        try {
          // Use a unique viewer name to avoid conflicts with broadcaster
          const viewerName = `${user.displayName || user.username}-viewer-${Date.now()}`;
          await joinAsViewer(id, viewerName);
        } catch (err) {
          console.error('Failed to join stream:', err);
        }
      }
    };
    joinStream();
  }, [id, user, hasJoined, joinAsViewer]);

  const handleLeave = async () => {
    await leaveRoom();
    router.back();
  };

  // Find the host peer (the broadcaster)
  // Metadata structure: { peer: { displayName, isHost }, server: {...} }
  const hostPeer = remotePeers.find((peer) => {
    const metadata = peer.metadata as { peer?: { isHost?: boolean } } | undefined;
    return metadata?.peer?.isHost === true;
  });

  // Get the host's video track
  const hostVideoTrack = hostPeer?.tracks.find(
    (track) => track.type === 'Video' && track.isActive
  );

  // Show loading state while connecting
  if (isConnecting) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Joining stream...</Text>
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
      {/* Video player */}
      {hostVideoTrack ? (
        <VideoRendererView
          trackId={hostVideoTrack.id}
          style={styles.fullscreen}
        />
      ) : (
        <View style={styles.player}>
          <Text style={styles.playerText}>
            {isConnected ? 'Waiting for streamer...' : 'Connecting...'}
          </Text>
          <Text style={styles.playerHint}>
            {remotePeers.length > 0
              ? `${remotePeers.length} peer(s) in room`
              : 'No one else in room yet'}
          </Text>
        </View>
      )}

      {/* Stream info overlay */}
      <View style={styles.overlay}>
        <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable style={styles.closeButton} onPress={handleLeave}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>

          <View style={[styles.liveBadge, !hostVideoTrack && styles.liveBadgeWaiting]}>
            <Text style={styles.liveText}>{hostVideoTrack ? 'LIVE' : 'WAITING'}</Text>
          </View>

          <View style={styles.viewerCount}>
            <Text style={styles.viewerText}>{remotePeers.length + 1} in room</Text>
          </View>
        </View>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.streamerInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(streamerName || 'S').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.streamTitle}>{title || 'Stream'}</Text>
              <Text style={styles.streamerName}>{streamerName || 'Streamer'}</Text>
            </View>
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
  player: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerText: {
    ...typography.h3,
    color: colors.textMuted,
  },
  playerHint: {
    ...typography.caption,
    color: colors.textDisabled,
    marginTop: spacing.xs,
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
  liveBadgeWaiting: {
    backgroundColor: colors.warning,
  },
  liveText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
  viewerCount: {
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginLeft: 'auto',
  },
  viewerText: {
    ...typography.caption,
    color: colors.text,
  },
  bottomBar: {
    padding: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  streamerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  streamTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  streamerName: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
