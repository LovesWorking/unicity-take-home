import { IconButton } from "@/components/ui/IconButton";
import { AudioTrack, SAMPLE_TRACKS } from "@/constants/AudioTracks";
import { COLORS, TYPOGRAPHY } from "@/constants/Colors";
import * as FileSystem from "expo-file-system";
import {
  Box,
  HStack,
  Image,
  Pressable,
  ScrollView,
  Text,
  useColorModeValue,
  useToast,
  VStack,
} from "native-base";
import React, { useState } from "react";

interface TrackListProps {
  searchQuery: string;
  onTrackSelect: (track: AudioTrack) => void;
  onClose: () => void;
}

export const TrackList: React.FC<TrackListProps> = ({
  searchQuery,
  onTrackSelect,
  onClose,
}) => {
  const [downloadProgress, setDownloadProgress] = useState<{
    [key: number]: number;
  }>({});
  const toast = useToast();

  // Theme colors
  const bgColor = useColorModeValue(
    COLORS.light.background,
    COLORS.dark.background
  );
  const textColor = useColorModeValue(COLORS.light.text, COLORS.dark.text);
  const iconColor = useColorModeValue(COLORS.primary, COLORS.secondary);

  // Filter tracks based on search query
  const filteredTracks = SAMPLE_TRACKS.filter(
    (track) =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleTrackSelect = (track: AudioTrack) => {
    onTrackSelect(track);
    onClose();
  };

  return (
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
              onPress={() => handleTrackSelect(track)}
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
  );
};
