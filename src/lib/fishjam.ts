/**
 * Fishjam client wrapper with graceful fallback for simulator/missing native modules
 *
 * The native Fishjam module crashes at import time when not available.
 * This wrapper provides mock implementations so the app can still run.
 */

import React from "react";

// Types that match the real Fishjam SDK
type PeerStatus = "idle" | "connecting" | "connected" | "error";

type Camera = {
  id: string;
  name: string;
  facingDirection: "front" | "back" | "unspecified";
};

type Track = {
  id: string;
  type: "Video" | "Audio";
  isActive: boolean;
};

type RemotePeer = {
  id: string;
  metadata: unknown;
  tracks: Track[];
};

interface UseCameraReturn {
  prepareCamera: (options?: { cameraEnabled?: boolean }) => Promise<void>;
  isCameraOn: boolean;
  toggleCamera: () => Promise<void>;
  switchCamera: (cameraId?: string) => Promise<void>;
  cameras: Camera[];
  currentCamera: Camera | null;
}

interface UseMicrophoneReturn {
  isMicrophoneOn: boolean;
  toggleMicrophone: () => Promise<void>;
}

interface UseConnectionReturn {
  joinRoom: (options: {
    peerToken: string;
    fishjamId: string;
    peerMetadata?: unknown;
  }) => Promise<void>;
  leaveRoom: () => Promise<void>;
  peerStatus: PeerStatus;
}

interface UsePeersReturn {
  remotePeers: RemotePeer[];
}

interface UseSandboxReturn {
  getSandboxPeerToken: (roomName: string, displayName: string) => Promise<string | null>;
}

// Mock implementations
const createMockCamera = (): UseCameraReturn => ({
  prepareCamera: async () => {},
  isCameraOn: false,
  toggleCamera: async () => {},
  switchCamera: async () => {},
  cameras: [],
  currentCamera: null,
});

const createMockMicrophone = (): UseMicrophoneReturn => ({
  isMicrophoneOn: false,
  toggleMicrophone: async () => {},
});

const createMockConnection = (): UseConnectionReturn => ({
  joinRoom: async () => {},
  leaveRoom: async () => {},
  peerStatus: "idle",
});

const createMockPeers = (): UsePeersReturn => ({
  remotePeers: [],
});

const createMockSandbox = (): UseSandboxReturn => ({
  getSandboxPeerToken: async () => null,
});

// Placeholder components for when native module is unavailable
const { View, Text, StyleSheet } = require("react-native");
const placeholderStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
  },
});

const MockVideoPreviewView = ({ style }: { style?: object }) =>
  React.createElement(
    View,
    { style: [placeholderStyles.container, style] },
    React.createElement(
      Text,
      { style: placeholderStyles.text },
      "Camera not available\n(Native module missing)"
    )
  );

const MockVideoRendererView = ({ style }: { style?: object }) =>
  React.createElement(
    View,
    { style: [placeholderStyles.container, style] },
    React.createElement(
      Text,
      { style: placeholderStyles.text },
      "Video not available\n(Native module missing)"
    )
  );

// Try to load the real Fishjam module, fall back to mocks if it fails
let isFishjamAvailable = false;
let useCamera: () => UseCameraReturn = createMockCamera;
let useMicrophone: () => UseMicrophoneReturn = createMockMicrophone;
let useConnection: () => UseConnectionReturn = createMockConnection;
let usePeers: () => UsePeersReturn = createMockPeers;
let useSandbox: (config: { fishjamId: string }) => UseSandboxReturn = () => createMockSandbox();
let VideoPreviewView: React.ComponentType<{ style?: object }> = MockVideoPreviewView;
let VideoRendererView: React.ComponentType<{
  trackId: string;
  style?: object;
  videoLayout?: string;
}> = MockVideoRendererView;

try {
  // Attempt to load the real module - this will throw if native module is missing
  const fishjam = require("@fishjam-cloud/react-native-client");

  // If we get here, the module loaded successfully
  isFishjamAvailable = true;
  useCamera = fishjam.useCamera;
  useMicrophone = fishjam.useMicrophone;
  useConnection = fishjam.useConnection;
  usePeers = fishjam.usePeers;
  useSandbox = fishjam.useSandbox;
  VideoPreviewView = fishjam.VideoPreviewView;
  VideoRendererView = fishjam.VideoRendererView;
} catch (error) {
  // Native module not available - keep using mocks
  console.warn("[Fishjam] Native module not available, using mocks:", error);
}

export {
  isFishjamAvailable,
  useCamera,
  useMicrophone,
  useConnection,
  usePeers,
  useSandbox,
  VideoPreviewView,
  VideoRendererView,
};

// Re-export types
export type { PeerStatus, Camera, Track, RemotePeer };
