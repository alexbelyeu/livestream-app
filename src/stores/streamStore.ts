import { create } from 'zustand';

interface StreamState {
  // Broadcaster state
  isLive: boolean;
  roomId: string | null;
  peerToken: string | null;
  streamTitle: string;
  viewerCount: number;

  // Viewer state
  currentStreamId: string | null;
  watchingRoomId: string | null;

  // Actions
  setStreamTitle: (title: string) => void;
  startBroadcast: (roomId: string, peerToken: string) => void;
  endBroadcast: () => void;
  updateViewerCount: (count: number) => void;
  joinStream: (streamId: string, roomId: string) => void;
  leaveStream: () => void;
}

export const useStreamStore = create<StreamState>((set) => ({
  // Initial state
  isLive: false,
  roomId: null,
  peerToken: null,
  streamTitle: '',
  viewerCount: 0,
  currentStreamId: null,
  watchingRoomId: null,

  // Actions
  setStreamTitle: (title) => set({ streamTitle: title }),

  startBroadcast: (roomId, peerToken) =>
    set({
      isLive: true,
      roomId,
      peerToken,
    }),

  endBroadcast: () =>
    set({
      isLive: false,
      roomId: null,
      peerToken: null,
      streamTitle: '',
      viewerCount: 0,
    }),

  updateViewerCount: (count) => set({ viewerCount: count }),

  joinStream: (streamId, roomId) =>
    set({
      currentStreamId: streamId,
      watchingRoomId: roomId,
    }),

  leaveStream: () =>
    set({
      currentStreamId: null,
      watchingRoomId: null,
    }),
}));
