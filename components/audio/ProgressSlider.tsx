import { AudioTrack } from "@/constants/AudioTracks";
import { COLORS, TYPOGRAPHY } from "@/constants/Colors";
import { HStack, Slider, Text, VStack } from "native-base";
import React from "react";

interface ProgressSliderProps {
  currentTrack: AudioTrack | null;
  sliderValue: number;
  position: number;
  duration: number;
  onSliderChange: (value: number) => void;
  formatTime: (milliseconds: number) => string;
}

export const ProgressSlider: React.FC<ProgressSliderProps> = ({
  currentTrack,
  sliderValue,
  position,
  duration,
  onSliderChange,
  formatTime,
}) => {
  return (
    <VStack space={3}>
      <HStack justifyContent="space-between" alignItems="center">
        <Text
          fontSize="sm"
          color={COLORS.gray.medium}
          fontFamily={TYPOGRAPHY.fontFamily}
        >
          {formatTime(position)}
        </Text>
        <Text
          fontSize="sm"
          color={COLORS.gray.medium}
          fontFamily={TYPOGRAPHY.fontFamily}
        >
          {formatTime(duration)}
        </Text>
      </HStack>

      <Slider
        value={sliderValue}
        onChange={onSliderChange}
        isDisabled={!currentTrack}
      >
        <Slider.Track bg={COLORS.secondary}>
          <Slider.FilledTrack bg="#83CFF7" />
        </Slider.Track>
        <Slider.Thumb bg="#83CFF7" />
      </Slider>
    </VStack>
  );
};
