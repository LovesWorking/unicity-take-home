import { IconButton } from "@/components/ui/IconButton";
import { SearchInput } from "@/components/ui/SearchInput";
import {
  AUDIO_CONFIG,
  AudioTrack,
  SAMPLE_TRACKS,
} from "@/constants/AudioTracks";
import { COLORS, TYPOGRAPHY } from "@/constants/Colors";
import { Audio, AVPlaybackStatus } from "expo-av";
import * as FileSystem from "expo-file-system";
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
  useToast,
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
  const [downloadProgress, setDownloadProgress] = useState<{
    [key: number]: number;
  }>({});
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [isRepeatOn, setIsRepeatOn] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclose();
  const toast = useToast();

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
      toast.show({
        description: "Error loading audio track",
        placement: "top",
        duration: 2000,
      });
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
      toast.show({
        description: "Error controlling playback",
        placement: "top",
        duration: 2000,
      });
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

  // Download track
  const downloadTrack = async (track: AudioTrack) => {
    const fileName = `${track.title.replace(/\s+/g, "_")}_${track.id}.m4a`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    try {
      const downloadResumable = FileSystem.createDownloadResumable(
        track.url,
        fileUri,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress((prev) => ({
            ...prev,
            [track.id]: progress * 100,
          }));
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (result?.uri) {
        toast.show({
          description: `Downloaded: ${track.title}`,
          placement: "top",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Error downloading:", error);
      toast.show({
        description: "Error downloading track",
        placement: "top",
        duration: 2000,
      });
    } finally {
      // Clear progress after download completes or fails
      setDownloadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[track.id];
        return newProgress;
      });
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

  const toggleMute = async () => {
    if (!sound) return;
    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        await sound.setIsMutedAsync(!isMuted);
        setIsMuted(!isMuted);
      }
    } catch (error) {
      console.error("Error toggling mute:", error);
      toast.show({
        description: "Error controlling volume",
        placement: "top",
        duration: 2000,
      });
    }
  };

  const toggleShuffle = () => {
    setIsShuffleOn(!isShuffleOn);
    toast.show({
      description: `Shuffle ${!isShuffleOn ? "enabled" : "disabled"}`,
      placement: "top",
      duration: 1000,
    });
  };

  const toggleRepeat = () => {
    setIsRepeatOn(!isRepeatOn);
    toast.show({
      description: `Repeat ${!isRepeatOn ? "enabled" : "disabled"}`,
      placement: "top",
      duration: 1000,
    });
  };

  return (
    <Box flex={1} bg={bgColor} safeArea px={4}>
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
          px={4}
        >
          <VStack flex={1} space={4} py={4}>
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
                  <HStack
                    space={3}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <HStack space={3} alignItems="center" flex={1}>
                      <Image
                        source={{ uri: track.albumArt }}
                        alt={track.title}
                        size="xs"
                        rounded="sm"
                      />
                      <VStack flex={1}>
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
                    <IconButton
                      name="download"
                      color={iconColor}
                      onPress={() => downloadTrack(track)}
                      disabled={downloadProgress[track.id] !== undefined}
                      p={2}
                    />
                  </HStack>
                  {downloadProgress[track.id] !== undefined && (
                    <Box w="100%" h={1} bg="gray.200" mt={2}>
                      <Box
                        h="100%"
                        bg={iconColor}
                        style={{ width: `${downloadProgress[track.id]}%` }}
                      />
                    </Box>
                  )}
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
            bg={currentTrack?.backgroundColor || "gray.100"}
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

          <HStack justifyContent="space-between" alignItems="center">
            <IconButton
              name={isMuted ? "volume-x" : "volume-2"}
              color={iconColor}
              onPress={toggleMute}
              disabled={!currentTrack}
              size={24}
            />
            <HStack space={4} alignItems="center">
              <IconButton
                name="repeat"
                color={isRepeatOn ? COLORS.primary : iconColor}
                onPress={toggleRepeat}
                disabled={!currentTrack}
                size={20}
              />
              <IconButton
                name="shuffle"
                color={isShuffleOn ? COLORS.primary : iconColor}
                onPress={toggleShuffle}
                disabled={!currentTrack}
                size={20}
              />
            </HStack>
          </HStack>
        </VStack>

        {/* Control Buttons */}
        <HStack space={12} justifyContent="center" alignItems="center" mb={8}>
          <IconButton
            name="skip-back"
            color={iconColor}
            onPress={seekBackward}
            disabled={!currentTrack}
            size={31}
          />
          <IconButton
            name={isPlaying ? "pause" : "play"}
            color={iconColor}
            onPress={playPause}
            disabled={!currentTrack || isLoading}
            size={31}
          />
          <IconButton
            name="skip-forward"
            color={iconColor}
            onPress={seekForward}
            disabled={!currentTrack}
            size={31}
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
