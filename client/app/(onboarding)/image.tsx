import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/auth-client";
import { patchUserImage, uploadUserImage } from "@/lib/endpoints";
import { useMutation } from "@tanstack/react-query";
import { File } from "expo-file-system";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Camera, ImageIcon } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { toast } from "sonner-native";

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
    gap: 24,
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
  avatarBox: {
    position: "relative",
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.muted,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  buttonGroup: {
    width: "100%",
    flexDirection: "column",
    gap: 12,
  },
  fullWidth: {
    width: "100%",
  },
}));

export default function ImageOnboardingScreen() {
  const { theme } = useUnistyles();
  const { refetch: refetchAuthClient } = authClient.useSession();

  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const { mutate: upload, isPending: isUploading } = useMutation({
    mutationFn: async (asset: ImagePicker.ImagePickerAsset) => {
      const name = asset.fileName ?? `avatar.${asset.uri.split(".").pop() ?? "jpg"}`;
      const file = new File(asset.uri);
      const formData = new FormData();
      formData.append("image", file, name);
      return uploadUserImage(formData);
    },
    onSuccess: ({ url }) => {
      setUploadedUrl(url);
    },
    onError: (error) => {
      setPreviewUri(null);
      console.log(error)
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

  const pickerOptions: ImagePicker.ImagePickerOptions = {
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  };

  const handleAsset = (asset: ImagePicker.ImagePickerAsset) => {
    setPreviewUri(asset.uri);
    setUploadedUrl(null);
    upload(asset);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
    if (result.canceled) return;
    handleAsset(result.assets[0]);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      toast.error("Camera access is needed to take a photo", {
        position: "bottom-center",
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync(pickerOptions);
    if (result.canceled) return;
    handleAsset(result.assets[0]);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.headerGroup}>
          <Text style={styles.title}>Add a profile photo</Text>
          <Text style={styles.subtitleCenter} variant="muted">
            This helps others find and identify you.
          </Text>
        </View>

        <Pressable onPress={pickImage} disabled={isUploading || isSaving}>
          <View style={styles.avatarBox}>
            {previewUri ? (
              <Image
                source={{ uri: previewUri }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : (
              <Icon as={Camera} size={48} color={theme.colors.mutedForeground} />
            )}
          </View>
        </Pressable>

        <View style={styles.buttonGroup}>
          <Button
            variant="outline"
            onPress={takePhoto}
            disabled={isUploading || isSaving}
          >
            <Icon as={Camera} size={16} />
            <Text>Take a photo</Text>
          </Button>
          <Button
            variant="outline"
            onPress={pickImage}
            disabled={isUploading || isSaving}
          >
            <Icon as={ImageIcon} size={16} />
            <Text>
              {previewUri ? "Choose a different photo" : "Choose a photo"}
            </Text>
          </Button>
        </View>

        <Button
          style={styles.fullWidth}
          size="lg"
          disabled={!uploadedUrl || isUploading || isSaving}
          onPress={() => uploadedUrl && save(uploadedUrl)}
        >
          <Text>Continue</Text>
          {isSaving && (
            <ActivityIndicator size="small" color={theme.colors.primaryForeground} />
          )}
        </Button>
      </View>
    </View>
  );
}
