import { View, Text, StyleSheet } from 'react-native';
import { VideoRendererView, type TrackId } from '@fishjam-cloud/react-native-client';
import { colors, typography, borderRadius } from '@/theme';

interface StreamPlayerProps {
  trackId?: TrackId;
  style?: object;
}

export function StreamPlayer({ trackId, style }: StreamPlayerProps) {
  if (!trackId) {
    return (
      <View style={[styles.placeholder, style]}>
        <Text style={styles.placeholderText}>Waiting for stream...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <VideoRendererView
        trackId={trackId}
        style={styles.video}
        videoLayout="FIT"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  video: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    ...typography.body,
    color: colors.textMuted,
  },
});
