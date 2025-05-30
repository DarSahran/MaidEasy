export const COLORS = {
  primary: '#fa442a',
  secondary: '#f97316',
  tertiary: '#10b981',
  white: '#ffffff',
  black: '#222222',
  darkGray: '#666666',
  lightGray: '#e5e5e5',
  background: '#f8f9fa',
  error: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
  info: '#3b82f6',
};

export const FONTS = {
  h1: { fontSize: 32, fontWeight: 'bold' as const },
  h2: { fontSize: 28, fontWeight: 'bold' as const },
  h3: { fontSize: 24, fontWeight: '600' as const },
  h4: { fontSize: 20, fontWeight: '600' as const },
  body1: { fontSize: 18, fontWeight: 'normal' as const },
  body2: { fontSize: 16, fontWeight: 'normal' as const },
  body3: { fontSize: 14, fontWeight: 'normal' as const },
  body4: { fontSize: 12, fontWeight: 'normal' as const },
};

export const SIZES = {
  padding: 16,
  margin: 16,
  radius: 12,
  base: 8,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};
