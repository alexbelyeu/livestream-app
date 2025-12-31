export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

export interface Stream {
  id: string;
  roomId: string;
  hostId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  viewerCount: number;
  status: 'live' | 'ended';
  startedAt: Date;
  endedAt?: Date;
}

export interface Room {
  id: string;
  fishjamRoomId: string;
  hostPeerToken: string;
  createdAt: Date;
}
