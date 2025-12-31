const palette = {
    orange: {
        primary: '#F57C00',
        dark: '#E65100',
        light: '#FFB74D',
    },
    slate: {
        50: '#F8FAFC',
        100: '#F1F5F9',
        200: '#E2E8F0',
        300: '#CBD5E1',
        400: '#94A3B8',
        500: '#64748B',
        600: '#475569',
        700: '#334155',
        800: '#1E293B',
        900: '#0F172A',
        950: '#020617',
    },
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
};

export const lightTheme = {
    primary: palette.orange.primary,
    primaryDark: palette.orange.dark,
    primaryLight: palette.orange.light,
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceHighlight: palette.slate[50],
    border: palette.slate[200],
    text: palette.slate[900],
    textSecondary: palette.slate[500],
    textLight: palette.slate[400],
    card: '#FFFFFF',
    tabBar: '#FFFFFF',
    error: palette.error,
    success: palette.success,
    warning: palette.warning,
    info: palette.info,
    gradients: {
        primary: ['#FFFFFF', '#F8F9FA'],
        button: [palette.orange.primary, palette.orange.dark],
    }
};

export const darkTheme = {
    primary: palette.orange.primary,
    primaryDark: palette.orange.dark,
    primaryLight: palette.orange.light,
    background: palette.slate[950],
    surface: palette.slate[900],
    surfaceHighlight: palette.slate[800],
    border: palette.slate[800],
    text: '#FFFFFF',
    textSecondary: palette.slate[400],
    textLight: palette.slate[500],
    card: palette.slate[900],
    tabBar: palette.slate[900],
    error: palette.error,
    success: palette.success,
    warning: palette.warning,
    info: palette.info,
    gradients: {
        primary: [palette.slate[900], palette.slate[950]],
        button: [palette.orange.primary, palette.orange.dark],
    }
};

// Default export for backward compatibility
export const colors = lightTheme;
