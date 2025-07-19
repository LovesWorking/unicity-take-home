import { IconButton } from "@/components/ui/IconButton";
import { SearchInput } from "@/components/ui/SearchInput";
import {
  AUDIO_CONFIG,
  AudioTrack,
  SAMPLE_TRACKS,
} from "@/constants/AudioTracks";
import { COLORS, TYPOGRAPHY } from "@/constants/Colors";
import { Audio, AVPlaybackStatus } from "expo-av";
import {
  Box,
  Center,
  HStack,
  Image,
  Pressable,
  ScrollView,
  Slider,
  Text,
  useColorModeValue,
  useDisclose,
  VStack,
} from "native-base";
import React, { useEffect, useState } from "react";

export default function MainScreen() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen, onOpen, onClose } = useDisclose();

  // Theme colors
  const bgColor = useColorModeValue(
    COLORS.light.background,
    COLORS.dark.background
  );
  const textColor = useColorModeValue(COLORS.light.text, COLORS.dark.text);
  const iconColor = useColorModeValue(COLORS.primary, COLORS.secondary);
  const inputBgColor = useColorModeValue(
    COLORS.gray.white,
    COLORS.dark.background
  );

  // Format time in MM:SS format
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Load audio track
  const loadAudio = async (track: AudioTrack) => {
    try {
      setIsLoading(true);
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: audioSound } = await Audio.Sound.createAsync(
        { uri: track.url },
        { shouldPlay: false }
      );

      audioSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      setSound(audioSound);
      setCurrentTrack(track);
    } catch (error) {
      console.error("Error loading audio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis || 0);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying || false);
    }
  };

  const playPause = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error("Error playing/pausing:", error);
    }
  };

  const seekForward = async () => {
    if (!sound) return;
    try {
      const newPosition = Math.min(
        position + AUDIO_CONFIG.SKIP_INTERVAL,
        duration
      );
      await sound.setPositionAsync(newPosition);
    } catch (error) {
      console.error("Error seeking forward:", error);
    }
  };

  const seekBackward = async () => {
    if (!sound) return;
    try {
      const newPosition = Math.max(position - AUDIO_CONFIG.SKIP_INTERVAL, 0);
      await sound.setPositionAsync(newPosition);
    } catch (error) {
      console.error("Error seeking backward:", error);
    }
  };

  const onSliderChange = async (value: number) => {
    if (!sound || !duration) return;
    try {
      const newPosition = (value / 100) * duration;
      await sound.setPositionAsync(newPosition);
    } catch (error) {
      console.error("Error seeking:", error);
    }
  };

  // Filter tracks based on search query
  const filteredTracks = SAMPLE_TRACKS.filter(
    (track) =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const sliderValue = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <Box flex={1} bg={bgColor} safeArea>
      {/* Side Menu */}
      {isOpen && (
        <Box
          position="absolute"
          left={0}
          top={0}
          bottom={0}
          w="80%"
          bg={bgColor}
          zIndex={1}
          shadow={9}
        >
          <VStack flex={1} space={4} p={4}>
            <Text
              fontSize="xl"
              fontWeight="bold"
              color={textColor}
              fontFamily={TYPOGRAPHY.fontFamily}
            >
              Audio Library
            </Text>
            <ScrollView>
              {filteredTracks.map((track) => (
                <Pressable
                  key={track.id}
                  onPress={() => {
                    loadAudio(track);
                    onClose();
                  }}
                  py={2}
                >
                  <HStack space={3} alignItems="center">
                    <Image
                      source={{ uri: track.albumArt }}
                      alt={track.title}
                      size="xs"
                      rounded="sm"
                    />
                    <VStack>
                      <Text
                        color={textColor}
                        fontWeight="medium"
                        fontFamily={TYPOGRAPHY.fontFamily}
                      >
                        {track.title}
                      </Text>
                      <Text
                        color={COLORS.gray.medium}
                        fontSize="sm"
                        fontFamily={TYPOGRAPHY.fontFamily}
                      >
                        {track.artist}
                      </Text>
                    </VStack>
                  </HStack>
                </Pressable>
              ))}
            </ScrollView>
          </VStack>
        </Box>
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
        <Center flex={1}>
          <Box
            size="300px"
            rounded="full"
            overflow="hidden"
            shadow={6}
            bg="gray.100"
          >
            <Image
              source={{
                uri:
                  currentTrack?.albumArt ||
                  "https://via.placeholder.com/300x300/E5E5E5/9CA3AF?text=Select+Track",
              }}
              alt="Album Art"
              size="full"
              resizeMode="cover"
            />
          </Box>
        </Center>

        {/* Track Info */}
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

        {/* Progress Slider */}
        <VStack space={3}>
          <Slider
            value={sliderValue}
            onChange={onSliderChange}
            isDisabled={!currentTrack}
          >
            <Slider.Track>
              <Slider.FilledTrack />
            </Slider.Track>
            <Slider.Thumb />
          </Slider>

          <HStack justifyContent="space-between">
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
        </VStack>

        {/* Control Buttons */}
        <HStack space={16} justifyContent="center" alignItems="center" mb={8}>
          <IconButton
            name="skip-back"
            color={iconColor}
            onPress={seekBackward}
            disabled={!currentTrack}
          />
          <IconButton
            name={isPlaying ? "pause" : "play"}
            color={iconColor}
            onPress={playPause}
            disabled={!currentTrack || isLoading}
          />
          <IconButton
            name="skip-forward"
            color={iconColor}
            onPress={seekForward}
            disabled={!currentTrack}
          />
        </HStack>
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
