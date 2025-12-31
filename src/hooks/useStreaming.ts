import { useState, useCallback } from 'react';
import {
  useCamera,
  useConnection,
  useMicrophone,
  usePeers,
  useSandbox,
} from '@fishjam-cloud/react-native-client';
import { FISHJAM_CONFIG } from '@/config';
import { useStreamStore } from '@/stores/streamStore';

interface UseStreamingReturn {
  // State
  isConnected: boolean;
  isConnecting: boolean;
  isCameraOn: boolean;
  isMicOn: boolean;
  error: string | null;
  remotePeers: ReturnType<typeof usePeers>['remotePeers'];

  // Actions
  startBroadcast: (roomName: string, displayName: string) => Promise<void>;
  joinAsViewer: (roomName: string, displayName: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  toggleMicrophone: () => Promise<void>;
  switchCamera: () => Promise<void>;
}

export function useStreaming(): UseStreamingReturn {
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Fishjam hooks
  const { prepareCamera, isCameraOn, toggleCamera, switchCamera, cameras, currentCamera } = useCamera();
  const { isMicrophoneOn, toggleMicrophone } = useMicrophone();
  const { joinRoom, leaveRoom: fishjamLeaveRoom, peerStatus } = useConnection();
  const { remotePeers } = usePeers();

  // Sandbox hook for generating tokens without a backend
  const { getSandboxPeerToken } = useSandbox({
    fishjamId: FISHJAM_CONFIG.fishjamId,
  });

  // Store actions
  const { startBroadcast: storeStartBroadcast, endBroadcast: storeEndBroadcast } = useStreamStore();

  const isConnected = peerStatus === 'connected';

  // Start broadcasting (as host)
  const startBroadcast = useCallback(
    async (roomName: string, displayName: string) => {
      // Prevent rejoining if already connected
      if (peerStatus === 'connected' || peerStatus === 'connecting') {
        return;
      }

      try {
        setError(null);
        setIsConnecting(true);

        // Prepare camera first
        await prepareCamera({ cameraEnabled: true });

        // Get peer token from sandbox API
        const peerToken = await getSandboxPeerToken(roomName, displayName);

        if (!peerToken) {
          throw new Error('Failed to get peer token');
        }

        // Join the room
        await joinRoom({
          peerToken,
          fishjamId: FISHJAM_CONFIG.fishjamId,
          peerMetadata: { displayName, isHost: true },
        });

        // Update store
        storeStartBroadcast(roomName, peerToken);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to start broadcast';
        setError(message);
        console.error('Start broadcast error:', err);
        throw err;
      } finally {
        setIsConnecting(false);
      }
    },
    [peerStatus, prepareCamera, getSandboxPeerToken, joinRoom, storeStartBroadcast]
  );

  // Join as viewer
  const joinAsViewer = useCallback(
    async (roomName: string, displayName: string) => {
      // Prevent rejoining if already connected
      if (peerStatus === 'connected' || peerStatus === 'connecting') {
        return;
      }

      try {
        setError(null);
        setIsConnecting(true);

        // Get peer token from sandbox API
        const peerToken = await getSandboxPeerToken(roomName, displayName);

        if (!peerToken) {
          throw new Error('Failed to get peer token');
        }

        // Join the room (without camera)
        await joinRoom({
          peerToken,
          fishjamId: FISHJAM_CONFIG.fishjamId,
          peerMetadata: { displayName, isHost: false },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to join stream';
        setError(message);
        console.error('Join stream error:', err);
        throw err;
      } finally {
        setIsConnecting(false);
      }
    },
    [peerStatus, getSandboxPeerToken, joinRoom]
  );

  // Leave the room
  const leaveRoom = useCallback(async () => {
    try {
      setError(null);
      await fishjamLeaveRoom();
      storeEndBroadcast();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to leave room';
      setError(message);
      console.error('Leave room error:', err);
    }
  }, [fishjamLeaveRoom, storeEndBroadcast]);

  // Switch between front and back camera
  const handleSwitchCamera = useCallback(async () => {
    if (cameras.length > 1 && currentCamera) {
      const currentIndex = cameras.findIndex((c) => c.id === currentCamera.id);
      const nextIndex = (currentIndex + 1) % cameras.length;
      await switchCamera(cameras[nextIndex].id);
    }
  }, [cameras, currentCamera, switchCamera]);

  return {
    isConnected,
    isConnecting,
    isCameraOn,
    isMicOn: isMicrophoneOn,
    error,
    remotePeers,

    startBroadcast,
    joinAsViewer,
    leaveRoom,
    toggleCamera,
    toggleMicrophone,
    switchCamera: handleSwitchCamera,
  };
}
