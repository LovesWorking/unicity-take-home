import { IconButton } from "@/components/ui/IconButton";
import { AudioTrack } from "@/constants/AudioTracks";
import { COLORS } from "@/constants/Colors";
import { HStack, useColorModeValue } from "native-base";
import React from "react";

interface AudioControlsProps {
  currentTrack: AudioTrack | null;
  isMuted: boolean;
  isShuffleOn: boolean;
  isRepeatOn: boolean;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  currentTrack,
  isMuted,
  isShuffleOn,
  isRepeatOn,
  onToggleMute,
  onToggleShuffle,
  onToggleRepeat,
}) => {
  const iconColor = useColorModeValue(COLORS.primary, COLORS.secondary);

  return (
    <HStack justifyContent="space-between" alignItems="center">
      <IconButton
        name={isMuted ? "volume-x" : "volume-2"}
        color={iconColor}
        onPress={onToggleMute}
        disabled={!currentTrack}
        size={24}
      />
      <HStack space={4} alignItems="center">
        <IconButton
          name="repeat"
          color={isRepeatOn ? COLORS.primary : iconColor}
          onPress={onToggleRepeat}
          disabled={!currentTrack}
          size={20}
        />
        <IconButton
          name="shuffle"
          color={isShuffleOn ? COLORS.primary : iconColor}
          onPress={onToggleShuffle}
          disabled={!currentTrack}
          size={20}
        />
      </HStack>
    </HStack>
  );
};
