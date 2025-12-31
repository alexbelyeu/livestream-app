import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '@/theme';

// In production, this would come from an API that tracks active rooms
// For this demo, streams are joined via Room ID (sandbox mode)

type Stream = {
  id: string;
  title: string;
  host: string;
  viewers: number;
};

const MOCK_STREAMS: Stream[] = [];

function StreamCard({ stream }: { stream: Stream }) {
  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/(app)/stream/${stream.id}`)}
    >
      <View style={styles.thumbnail}>
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <View style={styles.viewerBadge}>
          <Text style={styles.viewerText}>{stream.viewers} viewers</Text>
        </View>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.streamTitle} numberOfLines={1}>
          {stream.title}
        </Text>
        <Text style={styles.hostName}>{stream.host}</Text>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const [roomId, setRoomId] = useState('');

  const handleJoinRoom = () => {
    if (!roomId.trim()) {
      Alert.alert('Error', 'Please enter a Room ID');
      return;
    }
    router.push({
      pathname: '/(app)/stream/[id]',
      params: { id: roomId.trim(), title: 'Live Stream', streamerName: 'Streamer' },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Streams</Text>
      </View>

      {/* Join Room Input */}
      <View style={styles.joinSection}>
        <Text style={styles.joinLabel}>Join a Room</Text>
        <View style={styles.joinRow}>
          <TextInput
            style={styles.joinInput}
            value={roomId}
            onChangeText={setRoomId}
            placeholder="Paste Room ID here"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable style={styles.joinButton} onPress={handleJoinRoom}>
            <Text style={styles.joinButtonText}>Join</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={MOCK_STREAMS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <StreamCard stream={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No live streams right now</Text>
          </View>
        }
      />
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
  joinSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  joinLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  joinRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  joinInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonText: {
    ...typography.button,
    color: colors.text,
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  thumbnail: {
    height: 180,
    backgroundColor: colors.surfaceHover,
    justifyContent: 'space-between',
    padding: spacing.sm,
  },
  liveBadge: {
    backgroundColor: colors.live,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  liveText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
  viewerBadge: {
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  viewerText: {
    ...typography.caption,
    color: colors.text,
  },
  cardInfo: {
    padding: spacing.md,
  },
  streamTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  hostName: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
});
