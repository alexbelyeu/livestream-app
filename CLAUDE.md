# CLAUDE.md

This file provides context for Claude Code when working on this project.

## Project Overview

A React Native livestreaming app demonstrating 1-to-many broadcasting (like Twitch/Kick) using Fishjam Cloud for WebRTC streaming.

## Tech Stack

- **React Native 0.81** with **Expo SDK 54** (managed workflow + prebuild)
- **Expo Router 6** - File-based navigation
- **Zustand 5** - State management
- **Fishjam Cloud** (`@fishjam-cloud/react-native-client`) - WebRTC streaming
- **TypeScript 5.9**

## Key Commands

```bash
# Start Metro bundler
npm start

# Run on iOS device (required for camera)
npx expo run:ios --device

# Run on iOS simulator (viewer only)
npx expo run:ios

# Run on Android
npx expo run:android

# Type check
npx tsc --noEmit

# Rebuild native modules after adding dependencies
npx expo prebuild
```

## Project Structure

```
app/                        # Expo Router screens
├── _layout.tsx            # Root layout
├── index.tsx              # Entry redirect based on auth
├── (auth)/sign-in.tsx     # Mock sign-in screen
└── (app)/                 # Protected routes (requires auth)
    ├── _layout.tsx        # Auth guard
    ├── (tabs)/            # Tab navigation
    │   ├── home.tsx       # Browse/join streams
    │   ├── go-live.tsx    # Pre-broadcast setup
    │   └── profile.tsx    # User profile
    └── stream/
        ├── broadcast.tsx  # Active broadcasting screen
        └── [id].tsx       # Watch stream screen

src/
├── components/            # Reusable components
│   ├── ui/               # Primitives (Button, Input, etc.)
│   ├── streaming/        # VideoPreview, StreamPlayer
│   └── layout/           # SafeArea, ScreenContainer
├── hooks/
│   ├── useStreaming.ts   # Main streaming hook (sandbox mode)
│   └── usePermissions.ts # Camera/mic permissions
├── stores/
│   ├── authStore.ts      # Mock auth state
│   └── streamStore.ts    # Stream state
├── config/
│   └── fishjam.ts        # Fishjam configuration
└── theme/                # Design tokens
    ├── colors.ts
    ├── typography.ts
    └── spacing.ts
```

## Important Patterns

### Fishjam Sandbox Mode
The app uses Fishjam's sandbox mode for development, which generates tokens client-side without needing a backend:

```typescript
const { getSandboxPeerToken } = useSandbox({
  fishjamId: FISHJAM_CONFIG.fishjamId,
});
```

### Peer Metadata Structure
When accessing peer metadata from Fishjam, the structure is nested:
```typescript
// Correct: metadata.peer.isHost
const isHost = peer.metadata?.peer?.isHost;

// Wrong: metadata.isHost (this won't work)
```

### Unique Peer Names
Peers must have unique display names to avoid connection conflicts:
- Broadcaster: `${username}-host`
- Viewer: `${username}-viewer-${timestamp}`

### Protected Routes
Auth guard is in `app/(app)/_layout.tsx` - redirects to sign-in if not authenticated.

## Configuration

Fishjam ID is configured in `src/config/fishjam.ts`. For production, replace sandbox mode with backend token generation.

## Common Issues

1. **Camera not working**: Must use physical device, not simulator
2. **Native module error**: Run `npx expo prebuild` then rebuild
3. **Metro connection issues**: Try `npx expo start --clear`
4. **CocoaPods issues**: Use `bundle exec pod install` in ios/ directory

## Documentation

See `DECISIONS.md` for architectural decisions and trade-offs.
