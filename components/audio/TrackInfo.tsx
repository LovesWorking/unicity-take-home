import { AudioTrack } from "@/constants/AudioTracks";
import { COLORS, TYPOGRAPHY } from "@/constants/Colors";
import { Text, useColorModeValue, VStack } from "native-base";
import React from "react";

interface TrackInfoProps {
  currentTrack: AudioTrack | null;
}

export const TrackInfo: React.FC<TrackInfoProps> = ({ currentTrack }) => {
  const textColor = useColorModeValue(COLORS.light.text, COLORS.dark.text);

  return (
    <VStack space={2} alignItems="center">
      <Text
        fontSize="xl"
        fontWeight="bold"
        color={textColor}
        fontFamily={TYPOGRAPHY.fontFamily}
      >
        {currentTrack?.title || "No Track Selected"}
      </Text>
      <Text
        fontSize="md"
        color={COLORS.gray.medium}
        fontFamily={TYPOGRAPHY.fontFamily}
      >
        {currentTrack?.artist || "Select a track to play"}
      </Text>
    </VStack>
  );
};
