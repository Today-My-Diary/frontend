import { useState, useEffect } from "react";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { queries } from "@/api";
import { cn, getKSTDate, parseDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/Loading";
import { FallbackBoundary } from "@/components/FallbackBoundary";

interface CalendarGridProps {
  date: Date;
  onClick: (date: string) => void;
}

const calendarQueryOptions = (date: Date) => {
  return {
    ...queries.videos.calendar(date.getFullYear(), date.getMonth() + 1),
    staleTime: 1000 * 60 * 5,
  };
};

// Maybe need memoization?
function CalendarGrid({ date, onClick }: CalendarGridProps) {
  const { data: videos } = useSuspenseQuery(calendarQueryOptions(date));

  // 날짜 배열 생성
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const days = [];

  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(null);
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(i);
  }

  // 날짜별 비디오 매핑
  const videosByDay = new Map<number, (typeof videos)[0]>();
  videos.forEach((video) => {
    const vDate = video.uploadDate;
    if (
      vDate.getFullYear() === date.getFullYear() &&
      vDate.getMonth() === date.getMonth()
    ) {
      videosByDay.set(vDate.getDate(), video);
    }
  });

  return (
    <div className="grid grid-cols-7 gap-1 font-medium md:gap-4">
      {days.map((day, index) => {
        if (!day) return <div key={`empty-${index}`} />;
        const video = videosByDay.get(day);

        return (
          <div key={day} className="group relative aspect-square">
            {video ? (
              <button
                type="button"
                className="border-primary-semilight bg-primary-light relative flex h-full w-full overflow-hidden rounded-lg border shadow-sm transition-transform duration-300 group-hover:z-30 group-hover:scale-125 group-hover:rotate-3"
                onClick={() => onClick(parseDate(video.uploadDate))}
              >
                <img
                  src={video.thumbnailS3Url}
                  alt={`${day}일 기록`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-black opacity-30 transition-opacity duration-300 group-hover:opacity-0">
                  <span className="text-md text-white">{day}</span>
                </div>
              </button>
            ) : (
              <div className="text-secondary-semilight text-md border-primary-semilight flex h-full w-full items-center justify-center rounded-lg border bg-white/40 transition hover:scale-[1.02]">
                {day}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface CalendarProps {
  onClick: (date: string) => void;
}

export function Calendar({ onClick }: CalendarProps) {
  const [date, setDate] = useState<Date>(getKSTDate());
  const queryClient = useQueryClient();

  const today = getKSTDate();
  const isCurrentMonth =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth();

  // Prefetching
  useEffect(() => {
    const prevMonth = new Date(date);
    prevMonth.setMonth(date.getMonth() - 1);
    queryClient.prefetchQuery(calendarQueryOptions(prevMonth));

    if (!isCurrentMonth) {
      const nextMonth = new Date(date);
      nextMonth.setMonth(date.getMonth() + 1);
      queryClient.prefetchQuery(calendarQueryOptions(nextMonth));
    }
  }, [date, queryClient, isCurrentMonth]);

  const handlePrevMonth = () => {
    setDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    if (isCurrentMonth) return;
    setDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  return (
    <div className="bg-primary-light w-full max-w-5xl rounded-xl p-3 shadow-md md:p-10">
      <div className="mb-8 flex items-center justify-between px-4">
        <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
          &lt;
        </Button>
        <div className="flex items-center gap-1 md:gap-4">
          <span className="text-secondary text-md font-bold md:text-xl">
            {date.getFullYear()}년 {date.getMonth() + 1}월
          </span>
          <Button
            variant="white"
            size="sm"
            className="border-primary-semilight text-secondary border"
            onClick={() => setDate(getKSTDate())}
          >
            오늘
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextMonth}
          disabled={isCurrentMonth}
        >
          &gt;
        </Button>
      </div>

      {/* 요일 헤더 */}
      <div className="mb-4 grid grid-cols-7 text-center">
        {["일", "월", "화", "수", "목", "금", "토"].map((day, i) => (
          <span
            key={day}
            className={cn(
              "text-sm",
              i === 0 ? "text-primary" : "text-secondary",
              i === 6 ? "text-primary" : "",
            )}
          >
            {day}
          </span>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="min-h-40">
        <FallbackBoundary
          Fallback={({ type, resetErrorBoundary }) => {
            if (type === "loading") {
              return (
                <div className="flex h-40 w-full items-center justify-center">
                  <Loading variant="primary" />
                </div>
              );
            }
            if (type === "error") {
              return (
                <div className="flex h-40 w-full flex-col items-center justify-center gap-4">
                  <p className="text-secondary font-medium">
                    달력 정보를 불러오지 못했습니다.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={resetErrorBoundary}
                  >
                    다시 시도
                  </Button>
                </div>
              );
            }
            return null;
          }}
        >
          <CalendarGrid date={date} onClick={onClick} />
        </FallbackBoundary>
      </div>
    </div>
  );
}
