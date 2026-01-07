import { View, Text, StyleSheet } from "react-native";
import { VideoPreviewView } from "@/lib/fishjam";
import { colors, typography, spacing, borderRadius } from "@/theme";

interface VideoPreviewProps {
  isActive?: boolean;
  style?: object;
}

export function VideoPreview({ isActive = true, style }: VideoPreviewProps) {
  if (!isActive) {
    return (
      <View style={[styles.placeholder, style]}>
        <Text style={styles.placeholderText}>Camera Off</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <VideoPreviewView style={styles.video} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  video: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    ...typography.body,
    color: colors.textMuted,
  },
});
