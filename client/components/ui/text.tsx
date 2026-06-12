import * as Slot from '@rn-primitives/slot';
import * as React from 'react';
import { Text as RNText, type Role, type StyleProp, type TextStyle } from 'react-native';
import { StyleSheet, type UnistylesVariants } from 'react-native-unistyles';

const styles = StyleSheet.create((theme) => ({
  text: {
    color: theme.colors.foreground,
    fontSize: 16,
    lineHeight: 24,
    variants: {
      variant: {
        default: {},
        h1: {
          ...theme.typography['4xl'],
          fontWeight: '800',
          letterSpacing: -0.5,
          textAlign: 'center',
        },
        h2: {
          ...theme.typography['3xl'],
          fontWeight: '600',
          letterSpacing: -0.5,
          paddingBottom: 8,
          borderBottomWidth: 1,
          borderColor: theme.colors.border,
        },
        h3: {
          ...theme.typography['2xl'],
          fontWeight: '600',
          letterSpacing: -0.5,
        },
        h4: {
          ...theme.typography.xl,
          fontWeight: '600',
          letterSpacing: -0.5,
        },
        p: {
          marginTop: 12,
          lineHeight: 28,
        },
        blockquote: {
          marginTop: 16,
          paddingLeft: 12,
          borderLeftWidth: 2,
          borderColor: theme.colors.border,
          fontStyle: 'italic',
        },
        code: {
          ...theme.typography.sm,
          fontFamily: 'monospace',
          fontWeight: '600',
          backgroundColor: theme.colors.muted,
          borderRadius: theme.radius.sm,
          paddingHorizontal: 5,
          paddingVertical: 3,
        },
        lead: {
          ...theme.typography.xl,
          color: theme.colors.mutedForeground,
        },
        large: {
          ...theme.typography.lg,
          fontWeight: '600',
        },
        small: {
          fontSize: 14,
          lineHeight: 14,
          fontWeight: '500',
        },
        muted: {
          ...theme.typography.sm,
          color: theme.colors.mutedForeground,
        },
      },
    },
  },
}));

type TextVariant = NonNullable<UnistylesVariants<typeof styles>['variant']>;

const ROLE: Partial<Record<TextVariant, Role>> = {
  h1: 'heading',
  h2: 'heading',
  h3: 'heading',
  h4: 'heading',
};

const ARIA_LEVEL: Partial<Record<TextVariant, number>> = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
};

/** Lets a parent (e.g. `Button`, `Card`) push a text style — usually a `color` — onto descendant `Text`/`Icon`. */
const TextStyleContext = React.createContext<StyleProp<TextStyle> | undefined>(undefined);

type TextProps = React.ComponentProps<typeof RNText> &
  UnistylesVariants<typeof styles> & {
    asChild?: boolean;
  };

function Text({ variant, asChild = false, style, ...props }: TextProps) {
  const contextStyle = React.useContext(TextStyleContext);
  styles.useVariants({ variant });
  const Component = asChild ? Slot.Text : RNText;
  return (
    <Component
      style={[styles.text, contextStyle, style]}
      role={variant ? ROLE[variant] : undefined}
      aria-level={variant ? ARIA_LEVEL[variant] : undefined}
      {...props}
    />
  );
}

export { Text, TextStyleContext };
