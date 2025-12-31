# Architectural Decisions

This document explains the key architectural decisions made in this project, the alternatives considered, and the rationale for each choice.

---

## 1. Framework: React Native with Expo

### Decision
Use Expo (managed workflow with prebuild capability) for React Native development.

### Alternatives Considered
- **Bare React Native**: Maximum flexibility, full native access from day one
- **Expo Go**: Fastest iteration, but limited to Expo SDK modules only

### Rationale
Expo with prebuild provides the optimal balance for this project:
- **Native module support**: Required for Fishjam's camera/microphone access via `npx expo prebuild`
- **Developer velocity**: Expo's tooling (hot reload, OTA updates, EAS Build) accelerates development
- **Maintained ecosystem**: Expo SDK modules are well-tested across platforms
- **Clear migration path**: Can eject or add custom native code via config plugins if needed

### Trade-offs
- Build times are longer than pure JS updates in Expo Go
- Some native libraries require custom config plugins
- Larger binary size than bare React Native (mitigated by tree shaking)

---

## 2. State Management: Zustand

### Decision
Use Zustand for global state management instead of Redux or React Context.

### Alternatives Considered
- **Redux Toolkit**: Industry standard, excellent devtools, large ecosystem
- **React Context + useReducer**: Built-in, no dependencies
- **Jotai/Recoil**: Atomic state model, fine-grained subscriptions
- **MobX**: Observable-based, less boilerplate than Redux

### Rationale
- **Minimal boilerplate**: No providers, reducers, or action creators required
- **TypeScript inference**: Excellent type inference out of the box
- **Selective subscriptions**: Built-in selector pattern prevents unnecessary re-renders
- **Small bundle size**: ~1KB gzipped vs ~10KB for Redux Toolkit
- **Simpler mental model**: Easy to onboard new team members

### Code Example
```typescript
// Clean, type-safe store definition
const useAuthStore = create<AuthState>((set) => ({
  user: null,
  signIn: async () => {
    const user = await authApi.signIn();
    set({ user, isAuthenticated: true });
  },
}));

// Selective subscription - only re-renders when isAuthenticated changes
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
```

### Trade-offs
- Smaller ecosystem than Redux
- No built-in dev tools (uses Redux devtools adapter)
- Less structured for very large applications

---

## 3. Navigation: Expo Router (File-based)

### Decision
Use Expo Router for file-based navigation instead of React Navigation's imperative API.

### Alternatives Considered
- **React Navigation (imperative)**: More established, more control over navigation behavior

### Rationale
- **File-based routing**: Routes are automatically generated from file structure, reducing configuration
- **Type-safe routes**: With `typedRoutes: true`, navigation is type-checked at compile time
- **Automatic deep linking**: URL scheme handling comes free with route structure
- **Modern patterns**: Route groups `(auth)`, `(app)` enable layout composition without affecting URLs
- **Server components ready**: Architecture aligns with React Server Components direction

### Code Example
```
app/
├── (auth)/
│   └── sign-in.tsx        → /sign-in
└── (app)/
    ├── (tabs)/
    │   ├── home.tsx       → /home
    │   └── profile.tsx    → /profile
    └── stream/
        └── [id].tsx       → /stream/abc123 (deep link ready)
```

### Trade-offs
- Less flexibility for complex custom transitions
- Newer technology with fewer community examples
- File naming conventions require learning

---

## 4. Project Structure: Hybrid Layer/Feature Organization

### Decision
Organize code by layer (components, hooks, stores, services) with domain-specific groupings within each layer.

### Structure
```
src/
├── components/
│   ├── ui/              # Reusable primitives
│   ├── streaming/       # Domain-specific
│   └── layout/          # Structural
├── hooks/               # Custom hooks
├── stores/              # Zustand stores
├── services/            # API clients
├── theme/               # Design tokens
└── types/               # TypeScript types
```

### Alternatives Considered
- **Feature-based**: All stream code in `/features/streaming/`
- **Pure layer-based**: Strict separation (`/components/`, `/hooks/` with no subdirectories)

### Rationale
- **Reusability**: Layer-based structure promotes component reuse across features
- **Discoverability**: Clear where to find components, hooks, or stores
- **Scalable**: Domain subdirectories (`streaming/`) keep related code together

### Trade-offs
- May need restructuring as app grows significantly
- Some cross-referencing between directories

---

## 5. Design System: Theme Tokens + Constrained Variants

### Decision
Implement a design system using centralized theme tokens with component variants.

### Structure
```typescript
// Centralized tokens
const colors = {
  primary: '#9146FF',
  background: '#0E0E10',
  surface: '#18181B',
  // ...
};

// Component with constrained variants
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';
```

### Rationale
- **Consistency**: Single source of truth for colors, spacing, typography
- **Maintainability**: Change theme tokens, UI updates globally
- **Designer-friendly**: Token names map to design system terminology
- **Type safety**: Variants prevent arbitrary styling

---

## 6. Streaming: Fishjam WebRTC

### Decision
Use Fishjam Cloud (`@fishjam-cloud/react-native-client`) for WebRTC streaming.

### Alternatives Considered
- **LiveKit**: Popular, well-documented, self-hostable
- **Agora**: Enterprise-grade, but proprietary and expensive
- **Raw WebRTC**: Maximum control, but significant complexity
- **Amazon IVS**: AWS-integrated, but vendor lock-in

### Rationale
- **High-level React hooks**: `useCamera()`, `usePeers()`, `useConnection()` simplify integration
- **Cloud-hosted**: Reduces infrastructure complexity for MVP
- **Sandbox mode**: Easy testing without backend initially
- **React Native support**: First-class mobile SDK

### Sandbox Mode Implementation
For development, we use Fishjam's sandbox mode which allows:
- **Client-side token generation**: No backend required for peer tokens
- **Quick testing**: Start streaming immediately after setup
- **Room creation**: Rooms are created on-demand via `useSandbox` hook

```typescript
// Sandbox hook generates tokens without a backend
const { getSandboxPeerToken } = useSandbox({
  fishjamId: FISHJAM_CONFIG.fishjamId,
});

// Get token and join room
const peerToken = await getSandboxPeerToken(roomName, displayName);
await joinRoom({ peerToken, fishjamId, peerMetadata: { isHost: true } });
```

### Trade-offs
- Less control than raw WebRTC
- Dependency on Fishjam service availability
- Pricing at scale needs evaluation
- Sandbox mode not suitable for production (no access control)

### Production Path
For production deployment:
1. **Backend token generation**: Server creates signed tokens with proper permissions
2. **Room management**: Backend controls who can create/join rooms
3. **Webhook handling**: Process stream events (start, end, viewer count)
4. **Recording integration**: Store VODs in cloud storage (S3/GCS)

---

## 7. Authentication: Mock Auth (Intentional Scoping)

### Decision
Implement mock authentication rather than a real auth system.

### What Mock Auth Includes
- Simulated sign-in flow with loading states
- Zustand store with user state
- Protected route guards
- Sign-out functionality

### What's Intentionally Excluded
- Real JWT tokens
- Refresh token rotation
- Password validation
- OAuth providers

### Rationale
Mock auth allows demonstrating:
- Auth flow architecture
- Protected route patterns
- State management
- UI/UX for auth screens

Without the complexity of:
- Backend auth service
- Token storage security
- OAuth configuration

### Production Path
For production, would implement:
1. **Auth0 or Clerk**: Managed auth with social providers
2. **expo-secure-store**: Secure token storage
3. **JWT with refresh**: Short-lived access + refresh rotation
4. **Biometric auth**: FaceID/TouchID for returning users

---

## 8. What I Would Do Differently at Scale

This section acknowledges intentional simplifications and outlines the production path.

### Database
**Current**: In-memory mock data
**Production**: PostgreSQL with Prisma ORM
- Type-safe queries
- Migration management
- Connection pooling

### Caching
**Current**: None
**Production**: Redis for:
- Session storage
- Stream metadata caching
- Rate limiting

### Monitoring
**Current**: Console logs
**Production**:
- **Sentry**: Error tracking with source maps
- **Analytics**: Amplitude or Mixpanel for user behavior
- **Performance**: Custom metrics for stream latency

### Testing
**Current**: Manual testing
**Production**:
- **Jest + React Native Testing Library**: Component tests
- **Detox**: E2E testing on simulators/devices
- **Maestro**: Visual regression testing

### CI/CD
**Current**: Manual builds
**Production**:
- **GitHub Actions**: Lint, type-check, test on PR
- **EAS Build**: Automated iOS/Android builds
- **EAS Submit**: Automated App Store/Play Store submission

### Feature Flags
**Current**: None
**Production**: LaunchDarkly for:
- Gradual rollouts
- A/B testing
- Kill switches for features

---

## Summary

This architecture demonstrates:
1. **Pragmatic technology choices**: Selecting tools that balance development speed with scalability
2. **Clear separation of concerns**: Components, state, services are properly isolated
3. **Production awareness**: Understanding what's simplified vs. what production requires
4. **Trade-off awareness**: Each decision includes alternatives and rationale
