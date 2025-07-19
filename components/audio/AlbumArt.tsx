import { AudioTrack } from "@/constants/AudioTracks";
import { COLORS } from "@/constants/Colors";
import { Box, Center } from "native-base";
import React, { useEffect } from "react";
import { Image } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface AlbumArtProps {
  currentTrack: AudioTrack | null;
  position: number;
  duration: number;
  isPlaying: boolean;
  isSeeking: boolean;
}

export const AlbumArt: React.FC<AlbumArtProps> = ({
  currentTrack,
  position,
  duration,
  isPlaying,
  isSeeking,
}) => {
  const rotation = useSharedValue(0);

  // Debug logs
  console.log("AlbumArt render:", {
    hasTrack: !!currentTrack,
    trackTitle: currentTrack?.title,
    hasAlbumArt: !!currentTrack?.albumArt,
    isPlaying,
  });

  // Calculate rotation angle based on position and duration
  const calculateRotation = (
    currentPosition: number,
    trackDuration: number
  ) => {
    if (trackDuration === 0) return 0;
    return (currentPosition / trackDuration) * 360;
  };

  // Update rotation when position changes (during playback)
  useEffect(() => {
    if (!isSeeking && duration > 0) {
      const targetRotation = calculateRotation(position, duration);

      if (isPlaying) {
        // Smooth animation during playback
        rotation.value = withTiming(targetRotation, {
          duration: 100,
          easing: Easing.linear,
        });
      } else {
        // Immediate update when paused
        rotation.value = targetRotation;
      }
    }
  }, [position, duration, isPlaying, isSeeking, rotation]);

  // Reset rotation when track changes
  useEffect(() => {
    if (currentTrack) {
      console.log("Resetting rotation for new track:", currentTrack.title);
      rotation.value = 0;
    }
  }, [currentTrack, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // For debugging, let's try a simple test image first
  const imageUri = currentTrack?.albumArt || "https://picsum.photos/300/300";

  console.log("AlbumArt rendering with image URI:", imageUri);

  return (
    <Center flex={1}>
      <Box
        width="300px"
        height="300px"
        rounded="full"
        overflow="hidden"
        position="relative"
      >
        <Animated.View
          style={[{ width: "100%", height: "100%" }, animatedStyle]}
        >
          <Image
            source={{ uri: imageUri }}
            resizeMode="cover"
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 150,
            }}
            onError={(error) => console.error("Image load error:", error)}
            onLoad={() => console.log("Image loaded successfully:", imageUri)}
          />
        </Animated.View>

        {/* Center hole */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          style={{
            width: 40,
            height: 40,
            backgroundColor: COLORS.gray.white,
            borderRadius: 20,
            transform: [{ translateX: -20 }, { translateY: -20 }],
          }}
        />
      </Box>
    </Center>
  );
};
