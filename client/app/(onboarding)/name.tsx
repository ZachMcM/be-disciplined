import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/auth-client";
import { patchUserName } from "@/lib/endpoints";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import { toast } from "sonner-native";
import * as z from "zod";

const NameSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

type NameFormValues = z.infer<typeof NameSchema>;

export default function NameOnboardingScreen() {
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
      className="flex-1 items-center bg-background"
    >
      <View className="flex w-full flex-col items-center gap-4 p-8">
        <View className="flex w-full flex-col gap-1">
          <Text className="text-xl font-bold text-center">
            What's your name?
          </Text>
          <Text className="text-center" variant="muted">
            This helps others find and identify you.
          </Text>
        </View>
        <View className="flex w-full flex-row gap-2">
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="flex flex-1 flex-col gap-2">
                <Input
                  autoFocus
                  placeholder="First"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  className={cn(errors.firstName && "border-destructive")}
                  autoCapitalize="words"
                  textContentType="givenName"
                  returnKeyType="next"
                />
                {errors.firstName && (
                  <Text className="text-sm font-medium text-destructive">
                    {errors.firstName.message}
                  </Text>
                )}
              </View>
            )}
          />
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="flex flex-1 flex-col gap-2">
                <Input
                  placeholder="Last"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  className={cn(errors.lastName && "border-destructive")}
                  autoCapitalize="words"
                  textContentType="familyName"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit((values) => mutate(values))}
                />
                {errors.lastName && (
                  <Text className="text-sm font-medium text-destructive">
                    {errors.lastName.message}
                  </Text>
                )}
              </View>
            )}
          />
        </View>

        <Button
          className="w-full"
          size="lg"
          disabled={isPending}
          onPress={handleSubmit((values) => mutate(values))}
        >
          <Text>Continue</Text>
          {isPending && (
            <ActivityIndicator
              size="small"
              className="text-primary-foreground"
            />
          )}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
