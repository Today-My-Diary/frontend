import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export interface QualityLevel {
  height: number;
  levelIndex: number;
  label: string;
}

export function useHlsPlayer(videoUrl: string) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    const isHls = videoUrl.includes(".m3u8");

    // 기존 HLS 인스턴스 정리
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({ startFragPrefetch: true, enableWorker: true });
      hlsRef.current = hls;

      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const levels = data.levels
          .map((l, i) => ({
            height: l.height,
            levelIndex: i,
            label: `${l.height}p`,
          }))
          .sort((a, b) => b.height - a.height);

        setQualityLevels([
          { height: 0, levelIndex: -1, label: "Auto" },
          ...levels,
        ]);
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari 등 Native HLS 지원
      video.src = videoUrl;
    } else {
      // 일반 비디오
      video.src = videoUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoUrl]);

  const changeQuality = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentLevel(levelIndex);
    }
  };

  const player = {
    seekTo: (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    },
    play: () => {
      videoRef.current?.play();
    },
    pause: () => {
      videoRef.current?.pause();
    },
    focus: () => {
      videoRef.current?.focus();
    },
    getCurrentTime: () => {
      return videoRef.current?.currentTime ?? 0;
    },
  };

  return { videoRef, qualityLevels, currentLevel, changeQuality, player };
}
