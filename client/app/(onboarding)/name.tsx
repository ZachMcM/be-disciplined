import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/auth-client";
import { patchUserName } from "@/lib/endpoints";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { toast } from "sonner-native";
import * as z from "zod";

const NameSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

type NameFormValues = z.infer<typeof NameSchema>;

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  container: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    padding: 32,
  },
  headerGroup: {
    width: "100%",
    flexDirection: "column",
    gap: 4,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitleCenter: {
    textAlign: "center",
  },
  row: {
    width: "100%",
    flexDirection: "row",
    gap: 8,
  },
  field: {
    flex: 1,
    flexDirection: "column",
    gap: 8,
  },
  inputError: {
    borderColor: theme.colors.destructive,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.destructive,
  },
  fullWidth: {
    width: "100%",
  },
}));

export default function NameOnboardingScreen() {
  const { theme } = useUnistyles();
  const { refetch: refetchAuthClient } = authClient.useSession();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NameFormValues>({
    resolver: zodResolver(NameSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: ({ firstName, lastName }: NameFormValues) =>
      patchUserName(`${firstName} ${lastName}`),
    onSuccess: async () => {
      refetchAuthClient();
      toast.success("Height saved!", { position: "bottom-center" });
    },
    onError: (error) => {
      toast.error(error.message ?? "Something went wrong", {
        position: "bottom-center",
      });
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <View style={styles.container}>
        <View style={styles.headerGroup}>
          <Text style={styles.title}>What's your name?</Text>
          <Text style={styles.subtitleCenter} variant="muted">
            This helps others find and identify you.
          </Text>
        </View>
        <View style={styles.row}>
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.field}>
                <Input
                  autoFocus
                  placeholder="First"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  style={errors.firstName && styles.inputError}
                  autoCapitalize="words"
                  textContentType="givenName"
                  returnKeyType="next"
                />
                {errors.firstName && (
                  <Text style={styles.errorText}>{errors.firstName.message}</Text>
                )}
              </View>
            )}
          />
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.field}>
                <Input
                  placeholder="Last"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  style={errors.lastName && styles.inputError}
                  autoCapitalize="words"
                  textContentType="familyName"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit((values) => mutate(values))}
                />
                {errors.lastName && (
                  <Text style={styles.errorText}>{errors.lastName.message}</Text>
                )}
              </View>
            )}
          />
        </View>

        <Button
          style={styles.fullWidth}
          size="lg"
          disabled={isPending}
          onPress={handleSubmit((values) => mutate(values))}
        >
          <Text>Continue</Text>
          {isPending && (
            <ActivityIndicator size="small" color={theme.colors.primaryForeground} />
          )}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
