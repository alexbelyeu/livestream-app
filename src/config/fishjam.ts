// ===========================================
// FISHJAM CONFIGURATION
// ===========================================
// Get these from https://fishjam.io/app
// 1. Create an account at fishjam.io
// 2. Create a new app
// 3. Copy your Fishjam ID from the dashboard
// 4. Create a .env file with: EXPO_PUBLIC_FISHJAM_ID=your_id
// ===========================================

export const FISHJAM_CONFIG = {
  // Your Fishjam App ID (from environment or fallback for development)
  fishjamId: process.env.EXPO_PUBLIC_FISHJAM_ID || "YOUR_FISHJAM_ID",

  // Use sandbox mode for testing (generates tokens client-side)
  // Set to false when you have a backend
  useSandbox: true,
} as const;

// Validate config
export function validateFishjamConfig(): boolean {
  const id = FISHJAM_CONFIG.fishjamId as string;
  if (!id || id === "YOUR_FISHJAM_ID") {
    console.warn("⚠️ Fishjam ID not configured. Get your ID from https://fishjam.io/app");
    return false;
  }
  return true;
}
