import { TextInput, type TextInputProps } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

const styles = StyleSheet.create((theme) => ({
  input: {
    height: 40,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius['2xl'],
    borderWidth: 1,
    borderColor: theme.colors.input,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 16,
    lineHeight: 20,
    color: theme.colors.foreground,
    variants: {
      disabled: {
        true: { opacity: 0.5 },
        false: {},
      },
    },
  },
}));

function Input({ style, editable, ...props }: TextInputProps) {
  const { theme } = useUnistyles();
  styles.useVariants({ disabled: editable === false });
  return (
    <TextInput
      editable={editable}
      placeholderTextColor={theme.colors.mutedForeground}
      style={[styles.input, style]}
      {...props}
    />
  );
}

export { Input };
