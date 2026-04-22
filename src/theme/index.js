// src/theme/index.js
export const colors = {
  bg:         '#0A0A0A',
  bgCard:     '#111111',
  bgElevated: '#1A1A1A',
  textPrimary:   '#F0F0F0',
  textSecondary: '#888888',
  textMuted:     '#444444',
  accent:      '#CC0000',
  accentBright: '#FF1111',
  accentDim:   '#660000',
  border:     '#222222',
  borderBright: '#333333',
  like:    '#CC0000',
  dislike: '#333333',
  white:   '#FFFFFF',
};

export const typography = {
  display: {
    fontFamily: 'System',
    fontWeight: '900',
    letterSpacing: -1,
  },
  headline: {
    fontFamily: 'System',
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  body: {
    fontFamily: 'System',
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  mono: {
    fontFamily: 'Courier New',
    fontWeight: '400',
    letterSpacing: 1,
  },
  label: {
    fontFamily: 'System',
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const radii = {
  sm: 4,
  md: 8,
  lg: 16,
  pill: 100,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  accent: {
    shadowColor: '#CC0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
};