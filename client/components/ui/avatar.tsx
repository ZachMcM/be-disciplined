import { Image, type ImageProps, type ImageSource } from 'expo-image';
import { StyleSheet as RNStyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { AspectRatio } from './aspect-ratio';
import { Text } from './text';

const styles = StyleSheet.create((theme) => ({
  root: {
    position: 'relative',
    flexShrink: 0,
    overflow: 'hidden',
    borderRadius: theme.radius.full,
  },
  fallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.secondary,
  },
  fallbackText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.secondaryForeground,
  },
  image: {
    width: '100%',
    height: '100%',
  },
}));

type AvatarProps = Omit<ImageProps, 'style'> & {
  alt?: string;
  /** Pixel size of the (square) avatar. Defaults to 28. */
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function Avatar({ source, alt, size = 28, style, ...props }: AvatarProps) {
  const hasImage = !!source && !!(source as ImageSource).uri;
  return (
    <AspectRatio ratio={1} style={RNStyleSheet.flatten([styles.root, { width: size, height: size }, style])}>
      {hasImage ? (
        <Image {...props} source={source} style={styles.image} contentFit="cover" />
      ) : (
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>{alt}</Text>
        </View>
      )}
    </AspectRatio>
  );
}
