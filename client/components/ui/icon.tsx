import type { LucideIcon, LucideProps } from 'lucide-react-native';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { TextStyleContext } from './text';

type IconProps = LucideProps & {
  as: LucideIcon;
};

/**
 * Wrapper for Lucide icons. Color resolves from the explicit `color` prop, then any
 * inherited text color (e.g. inside a `Button` or `Card`), then the theme foreground.
 *
 * @example
 * import { ArrowRight } from 'lucide-react-native';
 * <Icon as={ArrowRight} size={16} />
 */
function Icon({ as: IconComponent, size = 14, color, ...props }: IconProps) {
  const { theme } = useUnistyles();
  const contextStyle = React.useContext(TextStyleContext);
  const inheritedColor = StyleSheet.flatten(contextStyle)?.color as string | undefined;
  return (
    <IconComponent
      size={size}
      color={color ?? inheritedColor ?? theme.colors.foreground}
      {...props}
    />
  );
}

export { Icon };
