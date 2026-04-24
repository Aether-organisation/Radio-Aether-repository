export const Colors = {
  // Backgrounds
  void:           '#09090F',
  surface:        '#111118',
  surfaceGlass:   'rgba(255,255,255,0.05)',
  surfaceBorder:  'rgba(255,255,255,0.08)',
  surfaceActive:  'rgba(102,252,241,0.07)',

  // Accents
  cyan:           '#66FCF1',
  cyanMuted:      '#45A29E',
  cyanGlow:       'rgba(102,252,241,0.25)',
  aiPurple:       '#8A2BE2',
  aiPurpleGlow:   'rgba(138,43,226,0.30)',
  favorite:       '#FF6B8A',

  // Text
  textPrimary:    '#FFFFFF',
  textSecondary:  '#8B8D9B',
  textTertiary:   'rgba(255,255,255,0.35)',
  textError:      '#FF5C5C',
};

export const Radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 999,
};

export const Typography = {
  hero:    { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  title:   { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.3 },
  heading: { fontSize: 16, fontWeight: '700' as const },
  body:    { fontSize: 14, fontWeight: '500' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
  micro:   { fontSize: 10, fontWeight: '600' as const, letterSpacing: 0.5 },
};

export const Shadows = {
  cyan: {
    shadowColor: '#66FCF1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  aiPurple: {
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
};
