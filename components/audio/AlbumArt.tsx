import { AudioTrack } from "@/constants/AudioTracks";
import { COLORS } from "@/constants/Colors";
import { Box, Center } from "native-base";
import React, { useEffect, useRef } from "react";
import { Image, StyleSheet } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const styles = StyleSheet.create({
  albumArtShadow: {
    boxShadow: `0px 0px 78px 30px rgba(242, 215, 230, 0.7)`, // 1.5x stronger glow - balanced intensity
  },
});

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
  const prevPosition = useRef(position);
  const isSeekingBackwards = useRef(false);

  // Track seeking direction
  useEffect(() => {
    if (isSeeking) {
      // Only check direction during active seeking, not during normal playback updates
      const positionDiff = position - prevPosition.current;
      const significantChange = Math.abs(positionDiff) > 1000; // 1 second threshold

      if (significantChange) {
        isSeekingBackwards.current = positionDiff < 0;
      }
    } else {
      // Reset seeking direction when not seeking
      isSeekingBackwards.current = false;
    }
    prevPosition.current = position;
  }, [position, isSeeking]);

  // Handle rotation based on playback and seeking state
  useEffect(() => {
    if (isSeeking) {
      // During seeking, rotate based on direction
      if (isSeekingBackwards.current) {
        // Rotate backwards when seeking backwards
        rotation.value = withRepeat(
          withTiming(-360, {
            duration: 2000, // Faster rotation during seeking
            easing: Easing.linear,
          }),
          -1,
          false
        );
      } else {
        // Rotate forwards when seeking forwards
        rotation.value = withRepeat(
          withTiming(360, {
            duration: 2000, // Faster rotation during seeking
            easing: Easing.linear,
          }),
          -1,
          false
        );
      }
    } else if (isPlaying) {
      // Normal forward rotation when playing
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 10000, // 10 seconds for one full rotation
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      // Stop rotation when paused
      cancelAnimation(rotation);
    }
  }, [isPlaying, isSeeking, rotation]);

  // Reset rotation when track changes
  useEffect(() => {
    if (currentTrack) {
      cancelAnimation(rotation);
      rotation.value = 0;
      prevPosition.current = 0;
      isSeekingBackwards.current = false;

      // If playing when track changes, start rotation after reset
      if (isPlaying && !isSeeking) {
        rotation.value = withRepeat(
          withTiming(360, {
            duration: 10000,
            easing: Easing.linear,
          }),
          -1,
          false
        );
      }
    }
  }, [currentTrack, rotation, isPlaying, isSeeking]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const imageUri =
    currentTrack?.albumArt || require("@/assets/images/default.jpg");

  return (
    <Center flex={1}>
      <Box
        width="300px"
        height="300px"
        rounded="full"
        overflow="hidden"
        position="relative"
        style={styles.albumArtShadow}
      >
        <Animated.View
          style={[{ width: "100%", height: "100%" }, animatedStyle]}
        >
          <Image
            source={typeof imageUri === "string" ? { uri: imageUri } : imageUri}
            resizeMode="cover"
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 150,
            }}
            onError={(error) => {
              console.error("Image load error:", error);
              // Could set a state here to force fallback to default image if needed
            }}
            onLoad={() => console.log("Image loaded successfully:", imageUri)}
            defaultSource={require("@/assets/images/default.jpg")}
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
