import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/auth-client";
import { patchUserImage, uploadUserImage } from "@/lib/endpoints";
import { useMutation } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { toast } from "sonner-native";

export default function ImageOnboardingScreen() {
  const { refetch: refetchAuthClient } = authClient.useSession();

  // Local URI shown immediately for preview; remote URL returned by R2 once the
  // upload settles. Continue stays disabled until `uploadedUrl` is available.
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const { mutate: upload, isPending: isUploading } = useMutation({
    mutationFn: (asset: ImagePicker.ImagePickerAsset) => {
      const formData = new FormData();
      const name = asset.fileName ?? `avatar.${asset.uri.split(".").pop() ?? "jpg"}`;
      formData.append("image", {
        uri: asset.uri,
        name,
        type: asset.mimeType ?? "image/jpeg",
      } as any);
      return uploadUserImage(formData);
    },
    onSuccess: ({ url }) => {
      setUploadedUrl(url);
    },
    onError: (error) => {
      setPreviewUri(null);
      toast.error(error.message ?? "Failed to upload image", {
        position: "bottom-center",
      });
    },
  });

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: (image: string) => patchUserImage(image),
    onSuccess: async () => {
      refetchAuthClient();
    },
    onError: (error) => {
      toast.error(error.message ?? "Something went wrong", {
        position: "bottom-center",
      });
    },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    setPreviewUri(asset.uri);
    setUploadedUrl(null);
    upload(asset);
  };

  return (
    <View className="flex-1 items-center bg-background">
      <View className="flex w-full flex-col items-center gap-6 p-8">
        <View className="flex w-full flex-col gap-1">
          <Text className="text-xl font-bold text-center">
            Add a profile photo
          </Text>
          <Text className="text-center" variant="muted">
            This helps others find and identify you.
          </Text>
        </View>

        <Pressable onPress={pickImage} disabled={isUploading || isSaving}>
          <View className="relative size-36 items-center justify-center overflow-hidden rounded-full bg-secondary">
            {previewUri ? (
              <Image
                source={{ uri: previewUri }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            ) : (
              <Icon as={Camera} className="size-10 text-muted-foreground" />
            )}
            {isUploading && (
              <View className="absolute inset-0 items-center justify-center bg-black/40">
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}
          </View>
        </Pressable>

        <Button
          variant="outline"
          onPress={pickImage}
          disabled={isUploading || isSaving}
        >
          <Text>{previewUri ? "Choose a different photo" : "Choose a photo"}</Text>
        </Button>

        <Button
          className="w-full"
          size="lg"
          disabled={!uploadedUrl || isUploading || isSaving}
          onPress={() => uploadedUrl && save(uploadedUrl)}
        >
          <Text>Continue</Text>
          {isSaving && (
            <ActivityIndicator
              size="small"
              className="text-primary-foreground"
            />
          )}
        </Button>
      </View>
    </View>
  );
}
