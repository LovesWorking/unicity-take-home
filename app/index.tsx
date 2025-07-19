import {
  AlbumArt,
  AudioControls,
  PlaybackControls,
  ProgressSlider,
  TrackInfo,
  TrackList,
} from "@/components/audio";
import { IconButton } from "@/components/ui/IconButton";
import { SearchInput } from "@/components/ui/SearchInput";
import { AudioTrack } from "@/constants/AudioTracks";
import { COLORS } from "@/constants/Colors";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import {
  Box,
  HStack,
  Pressable,
  useColorModeValue,
  useDisclose,
  VStack,
} from "native-base";
import React, { useState } from "react";

export default function MainScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen, onOpen, onClose } = useDisclose();

  // Use the custom audio player hook
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    isLoading,
    isMuted,
    isShuffleOn,
    isRepeatOn,
    isSeeking,
    sliderValue,
    loadAudio,
    playPause,
    seekForward,
    seekBackward,
    onSliderChange,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    formatTime,
  } = useAudioPlayer();

  // Theme colors
  const bgColor = useColorModeValue(
    COLORS.light.background,
    COLORS.dark.background
  );
  const iconColor = useColorModeValue(COLORS.primary, COLORS.secondary);
  const inputBgColor = useColorModeValue(
    COLORS.gray.white,
    COLORS.dark.background
  );

  const handleTrackSelect = (track: AudioTrack) => {
    loadAudio(track);
  };

  return (
    <Box flex={1} bg={bgColor} safeArea px={4}>
      {/* Side Menu */}
      {isOpen && (
        <TrackList
          searchQuery={searchQuery}
          onTrackSelect={handleTrackSelect}
          onClose={onClose}
        />
      )}

      {/* Main Content */}
      <VStack flex={1} space={6} px={4}>
        {/* Header with Menu and Search */}
        <HStack space={4} alignItems="center" pt={4}>
          <IconButton name="menu" color={iconColor} onPress={onOpen} p={2} />
          <SearchInput
            placeholder="Search tracks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            bg={inputBgColor}
            iconColor={iconColor}
          />
        </HStack>

        {/* Album Art */}
        <Box flex={1}>
          <AlbumArt
            currentTrack={currentTrack}
            position={position}
            duration={duration}
            isPlaying={isPlaying}
            isSeeking={isSeeking}
          />
        </Box>

        {/* Track Info */}
        <TrackInfo currentTrack={currentTrack} />

        {/* Progress Slider */}
        <VStack space={3}>
          <ProgressSlider
            currentTrack={currentTrack}
            sliderValue={sliderValue}
            position={position}
            duration={duration}
            onSliderChange={onSliderChange}
            formatTime={formatTime}
          />

          <AudioControls
            currentTrack={currentTrack}
            isMuted={isMuted}
            isShuffleOn={isShuffleOn}
            isRepeatOn={isRepeatOn}
            onToggleMute={toggleMute}
            onToggleShuffle={toggleShuffle}
            onToggleRepeat={toggleRepeat}
          />
        </VStack>

        {/* Control Buttons */}
        <PlaybackControls
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          isLoading={isLoading}
          onPlayPause={playPause}
          onSeekBackward={seekBackward}
          onSeekForward={seekForward}
        />
      </VStack>

      {/* Overlay when menu is open */}
      {isOpen && (
        <Pressable
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="black"
          opacity={0.4}
          onPress={onClose}
        />
      )}
    </Box>
  );
}
