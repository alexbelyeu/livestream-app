# Livestream

A 1-to-many livestreaming app built with React Native and Expo, demonstrating real-time video broadcasting using WebRTC.

## Features

- **Live Broadcasting**: Stream video from your device's camera to viewers
- **Real-time Viewing**: Join streams using a Room ID
- **Camera Controls**: Toggle camera, microphone, and flip between front/back cameras
- **Dark Theme**: Twitch-inspired UI with purple accents

## Demo

| Broadcaster | Viewer |
|:-----------:|:------:|
| <img width="262" height="567" alt="broadcaster" src="https://github.com/user-attachments/assets/c6768196-08ca-421a-94c4-83e3af23db74" /> | <img width="262" height="567" alt="viewer" src="https://github.com/user-attachments/assets/4115bfb3-4496-4777-b343-1cfa7f5340af" />|


## Tech Stack

- **React Native** with **Expo** (managed workflow + prebuild)
- **Expo Router** - File-based navigation with type-safe routes
- **Zustand** - Lightweight state management
- **Fishjam Cloud** - WebRTC streaming infrastructure
- **TypeScript** - Full type safety

## Prerequisites

- Node.js 18+
- iOS: Xcode 15+ and CocoaPods
- Android: Android Studio with SDK 34+
- Physical device (camera doesn't work in simulator for broadcasting)
- [Fishjam Cloud](https://fishjam.io) account

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Fishjam

Get your Fishjam ID from [fishjam.io/app](https://fishjam.io/app) and update `src/config/fishjam.ts`:

```typescript
export const FISHJAM_CONFIG = {
  fishjamId: "YOUR_FISHJAM_ID",
  useSandbox: true,
};
```

### 3. Build and run

```bash
# iOS (requires physical device for camera)
npx expo run:ios --device

# Android
npx expo run:android
```

## Project Structure

```
├── app/                    # Expo Router screens
│   ├── (auth)/            # Auth screens (sign-in)
│   └── (app)/             # Protected app screens
│       ├── (tabs)/        # Tab navigation (home, go-live, profile)
│       └── stream/        # Streaming screens
├── src/
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom hooks (useStreaming, usePermissions)
│   ├── stores/            # Zustand stores
│   ├── config/            # App configuration
│   └── theme/             # Design tokens (colors, typography, spacing)
└── DECISIONS.md           # Architectural decisions documentation
```

## Usage

### Broadcasting

1. Sign in (mock auth)
2. Go to "Go Live" tab
3. Enter a stream title
4. Tap "Start Streaming"
5. Tap "Copy Room ID" to share

### Viewing

1. Sign in on another device
2. On the Home tab, paste the Room ID
3. Tap "Join" to watch the stream

## Testing Without Multiple Devices

Run the app on both a physical device (broadcaster) and the iOS Simulator (viewer):

```bash
# Terminal 1: Run on device
npx expo run:ios --device

# Terminal 2: Run on simulator
npx expo run:ios
```

## Architecture

See [DECISIONS.md](./DECISIONS.md) for detailed architectural decisions and trade-offs.

Key highlights:
- **Sandbox mode** for development (no backend required)
- **Hook composition** with `useStreaming` wrapping Fishjam SDK
- **Protected routes** using Expo Router layout groups
- **Selective Zustand subscriptions** to prevent unnecessary re-renders

## License

MIT
