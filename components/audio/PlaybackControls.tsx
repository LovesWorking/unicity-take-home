import { IconButton } from "@/components/ui/IconButton";
import { AudioTrack } from "@/constants/AudioTracks";
import { COLORS } from "@/constants/Colors";
import { HStack, useColorModeValue } from "native-base";
import React from "react";

interface PlaybackControlsProps {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  onPlayPause: () => void;
  onSeekBackward: () => void;
  onSeekForward: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  currentTrack,
  isPlaying,
  isLoading,
  onPlayPause,
  onSeekBackward,
  onSeekForward,
}) => {
  const iconColor = useColorModeValue(COLORS.primary, COLORS.secondary);

  return (
    <HStack space={12} justifyContent="center" alignItems="center" mb={8}>
      <IconButton
        name="skip-back"
        color={iconColor}
        onPress={onSeekBackward}
        disabled={!currentTrack}
        size={31}
      />
      <IconButton
        name={isPlaying ? "pause" : "play"}
        color={iconColor}
        onPress={onPlayPause}
        disabled={!currentTrack || isLoading}
        size={31}
      />
      <IconButton
        name="skip-forward"
        color={iconColor}
        onPress={onSeekForward}
        disabled={!currentTrack}
        size={31}
      />
    </HStack>
  );
};
