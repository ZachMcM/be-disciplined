import { Text, TextStyleContext } from '@/components/ui/text';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

const styles = StyleSheet.create((theme) => ({
  card: {
    flexDirection: 'column',
    gap: 24,
    paddingVertical: 24,
    borderRadius: theme.radius['2xl'],
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  foreground: {
    color: theme.colors.cardForeground,
  },
  header: {
    flexDirection: 'column',
    gap: 6,
    paddingHorizontal: 24,
  },
  title: {
    fontWeight: '600',
    lineHeight: 16,
  },
  content: {
    paddingHorizontal: 24,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
}));

function Card({ style, ...props }: ViewProps) {
  return (
    <TextStyleContext.Provider value={styles.foreground}>
      <View style={[styles.card, style]} {...props} />
    </TextStyleContext.Provider>
  );
}

function CardHeader({ style, ...props }: ViewProps) {
  return <View style={[styles.header, style]} {...props} />;
}

function CardTitle({ style, ...props }: React.ComponentProps<typeof Text>) {
  return <Text role="heading" aria-level={3} style={[styles.title, style]} {...props} />;
}

function CardDescription({ style, ...props }: React.ComponentProps<typeof Text>) {
  return <Text variant="muted" style={style} {...props} />;
}

function CardContent({ style, ...props }: ViewProps) {
  return <View style={[styles.content, style]} {...props} />;
}

function CardFooter({ style, ...props }: ViewProps) {
  return <View style={[styles.footer, style]} {...props} />;
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
