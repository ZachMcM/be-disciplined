import * as SeparatorPrimitive from '@rn-primitives/separator';
import * as React from 'react';
import { StyleSheet } from 'react-native-unistyles';

const styles = StyleSheet.create((theme) => ({
  base: {
    flexShrink: 0,
    backgroundColor: theme.colors.border,
    variants: {
      orientation: {
        horizontal: { height: 1, width: '100%' },
        vertical: { height: '100%', width: 1 },
      },
    },
  },
}));

function Separator({
  style,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: SeparatorPrimitive.RootProps & React.RefAttributes<SeparatorPrimitive.RootRef>) {
  styles.useVariants({ orientation });
  return (
    <SeparatorPrimitive.Root
      decorative={decorative}
      orientation={orientation}
      style={[styles.base, style]}
      {...props}
    />
  );
}

export { Separator };
