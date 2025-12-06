import { useEffect, useRef, useState } from "react";
import type { Timestamp } from "@/types/recording";
import zoom_in_icon from "@/assets/icons/zoom_in_icon.svg";
import zoom_out_icon from "@/assets/icons/zoom_out_icon.svg";
import { useHlsPlayer, type QualityLevel } from "@/hooks/useHlsPlayer";
import { cn } from "@/lib/utils";
import type { SeekCommand } from "../types/recording";
import { Button } from "./ui/button";

interface VideoPlayerProps {
  videoUrl: string;
  timestamps: Timestamp[];
  seekCommand?: SeekCommand | null;
  className?: string;
}

function QualitySelector({
  levels,
  currentIndex,
  onSelect,
}: {
  levels: QualityLevel[];
  currentIndex: number;
  onSelect: (index: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (levels.length === 0) return null;

  const currentLabel =
    levels.find((q) => q.levelIndex === currentIndex)?.label || "Auto";

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="glass"
        size="sm"
        title="화질 선택"
        onClick={() => setIsOpen(!isOpen)}
      >
        {currentLabel}
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 flex flex-col overflow-hidden rounded-lg bg-black/80 whitespace-nowrap text-white backdrop-blur-md">
          {levels.map((q) => (
            <button
              key={q.levelIndex}
              onClick={() => {
                onSelect(q.levelIndex);
                setIsOpen(false);
              }}
              className={cn(
                "cursor-pointer px-4 py-2 text-left text-sm font-light transition-colors hover:bg-white/20",
                currentIndex === q.levelIndex && "text-primary font-semibold",
              )}
            >
              {q.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function VideoPlayer({
  videoUrl,
  timestamps,
  seekCommand,
  className,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { videoRef, qualityLevels, currentLevel, changeQuality, player } =
    useHlsPlayer(videoUrl);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>("");

  // 전체화면 상태 감지
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // 타임스탬프 이동 처리
  useEffect(() => {
    if (!seekCommand) return;

    const index = seekCommand.timestampIndex;
    if (index >= 0 && index < timestamps.length) {
      player.seekTo(timestamps[index]?.time ?? 0);
      player.play();
    }
  }, [seekCommand, timestamps, player]);

  const reversedTimestamps = [...timestamps].reverse();
  const handleTimeUpdate = () => {
    const currentTime = player.getCurrentTime();
    const activeTimestamp = reversedTimestamps.find(
      (t) => t.time <= currentTime,
    );

    if (activeTimestamp) {
      setCurrentSubtitle((prev) =>
        prev !== activeTimestamp.label ? activeTimestamp.label : prev,
      );
    } else {
      setCurrentSubtitle((prev) => (prev !== "" ? "" : prev));
    }
  };

  const focusVideo = () => player.focus();

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
    focusVideo();
  };

  const handleQualityChange = (levelIndex: number) => {
    changeQuality(levelIndex);
    focusVideo();
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative flex items-center justify-center overflow-hidden bg-black",
        className,
      )}
    >
      <video
        ref={videoRef}
        controls
        className="aspect-video w-full object-contain [&::-webkit-media-controls-fullscreen-button]:hidden"
        playsInline
        onTimeUpdate={handleTimeUpdate}
      />

      {/* 우측 상단 컨트롤 버튼 그룹 */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <QualitySelector
          levels={qualityLevels}
          currentIndex={currentLevel}
          onSelect={handleQualityChange}
        />

        <Button
          variant="glass"
          size="icon"
          title="전체화면"
          onClick={toggleFullScreen}
        >
          {isFullscreen ? (
            <img src={zoom_out_icon} alt="축소" />
          ) : (
            <img src={zoom_in_icon} alt="전체화면" />
          )}
        </Button>
      </div>

      {/* 자막 표시 영역 */}
      {currentSubtitle && (
        <div className="pointer-events-none absolute right-0 bottom-12 left-0 flex w-full justify-center transition duration-300">
          <div
            className={cn(
              "w-fit rounded-lg bg-black/60 text-center text-white backdrop-blur-sm",
              isFullscreen ? "mb-14 px-6 py-3 text-2xl" : "text-md px-3 py-2",
            )}
          >
            {currentSubtitle}
          </div>
        </div>
      )}
    </div>
  );
}
