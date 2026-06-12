import * as LabelPrimitive from '@rn-primitives/label';
import * as React from 'react';
import { StyleSheet as RNStyleSheet } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

const styles = StyleSheet.create((theme) => ({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: theme.colors.foreground,
    fontSize: 14,
    fontWeight: '500',
  },
}));

function Label({
  style,
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  disabled,
  ...props
}: LabelPrimitive.TextProps & React.RefAttributes<LabelPrimitive.TextRef>) {
  return (
    <LabelPrimitive.Root
      style={RNStyleSheet.flatten([styles.root, disabled && styles.disabled])}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}>
      <LabelPrimitive.Text style={[styles.text, style]} {...props} />
    </LabelPrimitive.Root>
  );
}

export { Label };
