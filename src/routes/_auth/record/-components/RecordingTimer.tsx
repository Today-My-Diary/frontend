import { RECORDING_CONFIG } from "@/config/recording";
import { getKSTDate } from "@/lib/utils";
import { useEffect, useState } from "react";

interface RecordingTimerProps {
  startTime: number;
  onTimeLimitReached: () => void;
}

export function RecordingTimer({
  startTime,
  onTimeLimitReached,
}: RecordingTimerProps) {
  const [seconds, setSeconds] = useState<number>(0);
  const MAX_TIME = RECORDING_CONFIG.MAX_RECORDING_DURATION;

  useEffect(() => {
    const interval = setInterval(() => {
      const now = getKSTDate().getTime();
      const diff = Math.floor((now - startTime) / 1000);

      if (diff >= MAX_TIME) {
        clearInterval(interval);
        onTimeLimitReached();
      }
      setSeconds(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, onTimeLimitReached, MAX_TIME]);

  const formatTime = (sec: number) => {
    const mm = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const ss = (sec % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  return (
    <div className="text-md absolute top-6 left-6 z-10 flex flex-row items-center gap-3 rounded-md bg-black/60 px-5 py-2.5 text-white shadow-md backdrop-blur-sm">
      <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
      {formatTime(seconds)} / {formatTime(MAX_TIME)}
    </div>
  );
}
