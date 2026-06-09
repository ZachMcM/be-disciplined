import { Redirect } from 'expo-router';

/**
 * Tab-bar slot for the center "+" button. The button itself links straight to the
 * `/create` modal, so this route only acts as a fallback if it is ever reached
 * directly (e.g. via a deep link).
 */
export default function AddTabAnchor() {
  return <Redirect href="/create" />;
}
