import { AUDIO_CONFIG, AudioTrack } from "@/constants/AudioTracks";
import { Audio, AVPlaybackStatus } from "expo-av";
import { useToast } from "native-base";
import { useEffect, useState } from "react";

export interface UseAudioPlayerReturn {
  // Audio state
  sound: Audio.Sound | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  isLoading: boolean;
  currentTrack: AudioTrack | null;
  isMuted: boolean;
  isShuffleOn: boolean;
  isRepeatOn: boolean;
  isSeeking: boolean;

  // Audio controls
  loadAudio: (track: AudioTrack) => Promise<void>;
  playPause: () => Promise<void>;
  seekForward: () => Promise<void>;
  seekBackward: () => Promise<void>;
  onSliderChange: (value: number) => Promise<void>;
  toggleMute: () => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setIsSeeking: (seeking: boolean) => void;

  // Utility
  formatTime: (milliseconds: number) => string;
  sliderValue: number;
}

export const useAudioPlayer = (): UseAudioPlayerReturn => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [isRepeatOn, setIsRepeatOn] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const toast = useToast();

  // Format time in MM:SS format
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis || 0);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying || false);
    }
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
      setIsSeeking(true);
      const newPosition = (value / 100) * duration;
      await sound.setPositionAsync(newPosition);

      // Small delay to prevent conflicts with playback status updates
      setTimeout(() => setIsSeeking(false), 500);
    } catch (error) {
      console.error("Error seeking:", error);
      setIsSeeking(false);
    }
  };

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const sliderValue = duration > 0 ? (position / duration) * 100 : 0;

  return {
    // State
    sound,
    isPlaying,
    position,
    duration,
    isLoading,
    currentTrack,
    isMuted,
    isShuffleOn,
    isRepeatOn,
    isSeeking,

    // Actions
    loadAudio,
    playPause,
    seekForward,
    seekBackward,
    onSliderChange,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    setIsSeeking,

    // Utility
    formatTime,
    sliderValue,
  };
};
