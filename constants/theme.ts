/** safeTalk design tokens — Dark & Gray Monochrome */

export type ThemeColorTokens = {
  background: {
    primary: string;
    surface: string;
    surfaceAlt: string;
  };
  border: {
    hairline: string;
  };
  ink: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  action: {
    primaryFill: string;
    primaryText: string;
    primaryPressed: string;
    secondaryBorder: string;
    tertiaryFill: string;
    tertiaryText: string;
  };
  chip: {
    languageFill: string;
    languageText: string;
    specialtyBorder: string;
    specialtyText: string;
  };
  brand: {
    orange: string;
    orangePressed: string;
    plum: string;
    plumPressed: string;
  };
  accent: {
    amber: string;
  };
  status: {
    online: string;
    rating: string;
    error: string;
  };
  disabled: string;
};

export type AppTheme = {
  mode: 'light' | 'dark';
  colors: ThemeColorTokens;
};

/** Status ring colors — fixed functional indicators. */
export const StatusIndicatorColors = {
  online: '#5FCB7A',
  selected: '#ECECEE',
} as const;

export type FlatColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  ink: string;
  inkSecondary: string;
  inkTertiary: string;
  primary: string;
  primaryDark: string;
  secondary: string;
  secondaryDark: string;
  amber: string;
  rating: string;
  success: string;
  error: string;
  disabled: string;
  offline: string;
  sunsetStart: string;
  sunsetEnd: string;
  text: string;
  textSecondary: string;
  textLight: string;
  accent: string;
  warning: string;
  online: string;
  wallet: string;
  onPrimary: string;
  onSecondary: string;
  actionPrimaryFill: string;
  actionPrimaryText: string;
  actionPrimaryPressed: string;
  actionSecondaryBorder: string;
  actionTertiaryFill: string;
  actionTertiaryText: string;
  chipLanguageFill: string;
  chipLanguageText: string;
  chipSpecialtyBorder: string;
  chipSpecialtyText: string;
};

export function flattenThemeColors(colors: ThemeColorTokens): FlatColors {
  return {
    background: colors.background.primary,
    surface: colors.background.surface,
    surfaceAlt: colors.background.surfaceAlt,
    border: colors.border.hairline,
    ink: colors.ink.primary,
    inkSecondary: colors.ink.secondary,
    inkTertiary: colors.ink.tertiary,
    primary: colors.action.primaryFill,
    primaryDark: colors.action.primaryPressed,
    secondary: colors.action.secondaryBorder,
    secondaryDark: colors.action.secondaryBorder,
    amber: colors.status.rating,
    rating: colors.status.rating,
    success: colors.status.online,
    error: colors.status.error,
    disabled: colors.disabled,
    offline: colors.disabled,
    sunsetStart: colors.action.primaryFill,
    sunsetEnd: colors.background.surfaceAlt,
    text: colors.ink.primary,
    textSecondary: colors.ink.secondary,
    textLight: colors.ink.tertiary,
    accent: colors.status.rating,
    warning: colors.status.rating,
    online: colors.status.online,
    wallet: colors.action.primaryFill,
    onPrimary: colors.action.primaryText,
    onSecondary: colors.ink.primary,
    actionPrimaryFill: colors.action.primaryFill,
    actionPrimaryText: colors.action.primaryText,
    actionPrimaryPressed: colors.action.primaryPressed,
    actionSecondaryBorder: colors.action.secondaryBorder,
    actionTertiaryFill: colors.action.tertiaryFill,
    actionTertiaryText: colors.action.tertiaryText,
    chipLanguageFill: colors.chip.languageFill,
    chipLanguageText: colors.chip.languageText,
    chipSpecialtyBorder: colors.chip.specialtyBorder,
    chipSpecialtyText: colors.chip.specialtyText,
  };
}

const monochromeDark: ThemeColorTokens = {
  background: {
    primary: '#121214',
    surface: '#1C1C1F',
    surfaceAlt: '#242427',
  },
  border: {
    hairline: '#34343A',
  },
  ink: {
    primary: '#F2F2F4',
    secondary: '#9A9AA1',
    tertiary: '#6B6B70',
  },
  action: {
    primaryFill: '#ECECEE',
    primaryText: '#121214',
    primaryPressed: '#D6D6D9',
    secondaryBorder: '#C7C7CB',
    tertiaryFill: '#2A2A2E',
    tertiaryText: '#D0D0D4',
  },
  chip: {
    languageFill: '#29292D',
    languageText: '#E4E4E7',
    specialtyBorder: '#44444A',
    specialtyText: '#C7C7CB',
  },
  brand: {
    orange: '#ECECEE',
    orangePressed: '#D6D6D9',
    plum: '#C7C7CB',
    plumPressed: '#44444A',
  },
  accent: {
    amber: '#E8B84B',
  },
  status: {
    online: '#5FCB7A',
    rating: '#E8B84B',
    error: '#E5685A',
  },
  disabled: '#6B6B70',
};

const monochromeLight: ThemeColorTokens = {
  background: {
    primary: '#F2F2F4',
    surface: '#FFFFFF',
    surfaceAlt: '#ECECEE',
  },
  border: {
    hairline: '#D6D6D9',
  },
  ink: {
    primary: '#121214',
    secondary: '#6B6B70',
    tertiary: '#9A9AA1',
  },
  action: {
    primaryFill: '#121214',
    primaryText: '#F2F2F4',
    primaryPressed: '#2A2A2E',
    secondaryBorder: '#44444A',
    tertiaryFill: '#E4E4E7',
    tertiaryText: '#44444A',
  },
  chip: {
    languageFill: '#E4E4E7',
    languageText: '#121214',
    specialtyBorder: '#C7C7CB',
    specialtyText: '#44444A',
  },
  brand: {
    orange: '#121214',
    orangePressed: '#2A2A2E',
    plum: '#44444A',
    plumPressed: '#6B6B70',
  },
  accent: {
    amber: '#E8B84B',
  },
  status: {
    online: '#5FCB7A',
    rating: '#E8B84B',
    error: '#E5685A',
  },
  disabled: '#9A9AA1',
};

export const lightTheme: AppTheme = { mode: 'light', colors: monochromeLight };
export const darkTheme: AppTheme = { mode: 'dark', colors: monochromeDark };

/** @deprecated Use useTheme().colors */
export const Colors = flattenThemeColors(monochromeLight);

export const Fonts = {
  headlineBold: 'Sora_700Bold',
  headlineSemi: 'Sora_600SemiBold',
  headlineExtra: 'Sora_800ExtraBold',
  body: 'PlusJakartaSans_400Regular',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodySemiBold: 'PlusJakartaSans_600SemiBold',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  card: 20,
  lg: 20,
  xl: 24,
  pill: 28,
  full: 9999,
};

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 26,
  hero: 32,
};

export const LineHeight = {
  tight: 1.4,
  normal: 1.5,
};

export type TypographyTokens = {
  headlineLarge: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    color: string;
  };
  headlineMedium: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    color: string;
  };
  headlineSmall: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    color: string;
  };
  body: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    color: string;
  };
  bodyMedium: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    color: string;
  };
  caption: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    color: string;
  };
};

export function createTypography(colors: FlatColors): TypographyTokens {
  return {
    headlineLarge: {
      fontFamily: Fonts.headlineExtra,
      fontSize: FontSize.xxl,
      lineHeight: FontSize.xxl * LineHeight.tight,
      color: colors.ink,
    },
    headlineMedium: {
      fontFamily: Fonts.headlineBold,
      fontSize: FontSize.xl,
      lineHeight: FontSize.xl * LineHeight.tight,
      color: colors.ink,
    },
    headlineSmall: {
      fontFamily: Fonts.headlineSemi,
      fontSize: FontSize.lg,
      lineHeight: FontSize.lg * LineHeight.tight,
      color: colors.ink,
    },
    body: {
      fontFamily: Fonts.body,
      fontSize: FontSize.md,
      lineHeight: FontSize.md * LineHeight.normal,
      color: colors.ink,
    },
    bodyMedium: {
      fontFamily: Fonts.bodyMedium,
      fontSize: FontSize.md,
      lineHeight: FontSize.md * LineHeight.normal,
      color: colors.ink,
    },
    caption: {
      fontFamily: Fonts.body,
      fontSize: FontSize.sm,
      lineHeight: FontSize.sm * LineHeight.normal,
      color: colors.inkSecondary,
    },
  };
}

/** @deprecated Use useTheme().typography */
export const Typography = createTypography(Colors);

export type ElevationStyle = {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
  backgroundColor?: string;
  borderWidth?: number;
  borderColor?: string;
};

export function createElevation(isDark: boolean, colors: FlatColors) {
  return {
    soft: {
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
    } satisfies ElevationStyle,
    card: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    } satisfies ElevationStyle,
  };
}

/** @deprecated Use useTheme().elevation */
export const Shadow = {
  soft: {
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
};
