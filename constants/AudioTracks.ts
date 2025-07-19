export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  url: string;
  albumArt: string;
}

// Sample audio tracks for testing
export const SAMPLE_TRACKS: AudioTrack[] = [
  {
    id: "1",
    title: "Sample Track 1",
    artist: "Unknown Artist",
    duration: "3:45",
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    albumArt: "https://via.placeholder.com/300x300/E5E5E5/9CA3AF?text=Track+1",
  },
  {
    id: "2",
    title: "Sample Track 2",
    artist: "Unknown Artist",
    duration: "4:12",
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    albumArt: "https://via.placeholder.com/300x300/E5E5E5/9CA3AF?text=Track+2",
  },
  {
    id: "3",
    title: "Sample Track 3",
    artist: "Unknown Artist",
    duration: "2:58",
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    albumArt: "https://via.placeholder.com/300x300/E5E5E5/9CA3AF?text=Track+3",
  },
  {
    id: "4",
    title: "Sample Track 4",
    artist: "Unknown Artist",
    duration: "5:23",
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    albumArt: "https://via.placeholder.com/300x300/E5E5E5/9CA3AF?text=Track+4",
  },
  {
    id: "5",
    title: "Sample Track 5",
    artist: "Unknown Artist",
    duration: "3:17",
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    albumArt: "https://via.placeholder.com/300x300/E5E5E5/9CA3AF?text=Track+5",
  },
];

// Audio player configuration
export const AUDIO_CONFIG = {
  SKIP_INTERVAL: 15000, // 15 seconds in milliseconds
  UPDATE_INTERVAL: 100, // Position update interval in milliseconds
  DEFAULT_VOLUME: 1.0,
  FADE_DURATION: 300,
};

// Remote audio URLs for testing (when available)
export const REMOTE_AUDIO_URLS = [
  "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
  // Add more remote audio URLs here as needed
];
