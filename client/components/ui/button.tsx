import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { StyleSheet, type UnistylesVariants } from 'react-native-unistyles';
import { TextStyleContext } from './text';

const styles = StyleSheet.create((theme) => ({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexShrink: 0,
    borderRadius: theme.radius.full,
    variants: {
      variant: {
        default: { backgroundColor: theme.colors.primary },
        // destructive surface = destructive @ 20% opacity
        destructive: { backgroundColor: '#ff656833' },
        outline: {
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.background,
        },
        secondary: { backgroundColor: theme.colors.secondary },
        ghost: { backgroundColor: 'transparent' },
        link: { backgroundColor: 'transparent' },
      },
      size: {
        default: { height: 40, paddingHorizontal: 16, paddingVertical: 8 },
        sm: { height: 36, paddingHorizontal: 12, gap: 6 },
        lg: { height: 44, paddingHorizontal: 24 },
        icon: { height: 40, width: 40 },
      },
    },
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    variants: {
      variant: {
        default: { color: theme.colors.primaryForeground },
        destructive: { color: theme.colors.destructive },
        outline: { color: theme.colors.foreground },
        secondary: { color: theme.colors.secondaryForeground },
        ghost: { color: theme.colors.foreground },
        link: { color: theme.colors.foreground, textDecorationLine: 'underline' },
      },
      size: {
        default: {},
        sm: {},
        lg: {},
        icon: {},
      },
    },
  },
}));

// Per-variant press feedback — dark-mode values from the original `active:*` classes.
const pressedStyles = StyleSheet.create((theme) => ({
  default: { backgroundColor: '#e5e5e5e6' }, // primary @ 90%
  destructive: { backgroundColor: '#ff656550' }, // destructive surface, pressed
  outline: { backgroundColor: '#34343480' }, // input @ 50%
  secondary: { backgroundColor: '#262626cc' }, // secondary @ 80%
  ghost: { backgroundColor: theme.colors.accent + '80' }, // accent @ 50%
  link: {},
}));

type ButtonProps = Omit<PressableProps, 'style'> &
  UnistylesVariants<typeof styles> & {
    style?: StyleProp<ViewStyle>;
  };

function Button({ variant, size, style, disabled, ...props }: ButtonProps) {
  styles.useVariants({ variant, size });
  return (
    <TextStyleContext.Provider value={styles.label}>
      <Pressable
        role="button"
        disabled={disabled}
        style={({ pressed }) => [
          styles.base,
          pressed && pressedStyles[variant ?? 'default'],
          disabled && styles.disabled,
          style,
        ]}
        {...props}
      />
    </TextStyleContext.Provider>
  );
}

export { Button };
export type { ButtonProps };
