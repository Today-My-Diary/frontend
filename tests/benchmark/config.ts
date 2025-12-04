const mbpsToBytes = (mbps: number) => (mbps * 1024 * 1024) / 8;

export const BENCHMARK_CONFIG = {
  // 녹화 설정
  RECORDING: {
    CPU_THROTTLE_RATE: 8, // CPU 8배 느리게
    DURATION_MS: 1 * 60 * 1000, // 1분
    MIN_FPS_THRESHOLD: 30, // DOM에서의 최소 FPS 기준치
  },

  // 업로드 설정
  UPLOAD: {
    TIMEOUT_MS: 15 * 60 * 1000, // 15분
    DUMMY_FILE_SIZE_BYTES: 50 * 1024 * 1024, // 50MB
    INTERRUPTION: {
      UPLOAD_DURATION_BEFORE_CUT: 30 * 1000, // 30초
      OFFLINE_DURATION: 10 * 1000, // 10초
    },
  },

  // 재생 설정
  PLAYBACK: {
    PRE_SEEK_PLAY_MS: 3 * 1000, // 3초
    OBSERVATION_MS: 10 * 1000, // 10초
  },

  // 네트워크 프리셋
  NETWORK: {
    FAST_4G: {
      offline: false,
      latency: 60,
      downloadThroughput: mbpsToBytes(9.0),
      uploadThroughput: mbpsToBytes(1.5),
    },
    SLOW_4G: {
      offline: false,
      latency: 150,
      downloadThroughput: mbpsToBytes(1.6),
      uploadThroughput: mbpsToBytes(0.75),
    },
    OFFLINE: {
      offline: true,
      latency: 0,
      downloadThroughput: 0,
      uploadThroughput: 0,
    },
    NORMAL: {
      offline: false,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1,
    },
  },

  PATHS: {
    RECORD_PAGE: "/record/studio",
    PLAYBACK_PAGE: (date: string) => `/video/${date}`,
  },

  API: {
    QUESTIONS: "**/questions/*",
    VIDEO_DETAIL: "**/videos/*",
    CHECK_LIMIT: "**/videos/today",
    FCM_TOKEN: "**/fcm/token",
  },
};
