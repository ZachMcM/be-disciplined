import { cn } from "@/lib/utils";
import * as AvatarPrimitive from "@rn-primitives/avatar";
import { Image, ImageProps, ImageSource } from "expo-image";
import { AspectRatio } from "./aspect-ratio";
import { View } from "react-native";
import { Text } from "./text";

export function Avatar({ className, source, alt, ...props }: ImageProps) {
  return (
    <AspectRatio
      ratio={1}
      className={cn(
        "relative flex size-7 shrink-0 overflow-hidden rounded-full",
        className,
      )}
    >
      {!source || !(source as ImageSource).uri ? (
        <View className="bg-secondary w-full h-full justify-center items-center">
          <Text className="font-semibold text-xs">{alt}</Text>
        </View>
      ) : (
        <Image
          {...props}
          style={{ width: "100%", height: "100%" }}
          className="absolute inset-0 object-cover"
        />
      )}
    </AspectRatio>
  );
}
