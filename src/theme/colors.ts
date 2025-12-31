export const colors = {
  // Brand
  primary: '#9146FF',
  primaryLight: '#B380FF',
  primaryDark: '#7B2FE0',

  // Semantic
  success: '#00D26A',
  error: '#FF4D4D',
  warning: '#FFB800',
  live: '#FF0000',

  // Neutrals (dark theme)
  background: '#0E0E10',
  surface: '#18181B',
  surfaceHover: '#26262C',
  surfaceLight: '#3D3D42',
  border: '#3D3D42',

  // Text
  text: '#EFEFF1',
  textMuted: '#ADADB8',
  textDisabled: '#6B6B75',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
} as const;

export type Colors = typeof colors;
