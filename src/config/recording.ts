export const RECORDING_CONFIG = {
  VIDEO_CONSTRAINTS: {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    facingMode: "user" as const,
  },
  AUDIO_CONSTRAINTS: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  VIDEO_BITRATE: 2_500_000, // 2.5 Mbps
  MAX_RECORDING_DURATION: 600, // 최대 녹화 시간
  BLOB_TIME_SLICE: 100, // Blob 분할 시간 (ms)
  SNAPSHOT_TYPE: "image/jpeg", // 스냅샷 이미지 포맷
  SNAPSHOT_QUALITY: 0.95, // 스냅샷 품질 (0.0 ~ 1.0)
};
