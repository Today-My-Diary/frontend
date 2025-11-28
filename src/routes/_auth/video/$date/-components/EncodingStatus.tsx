import { cn } from "@/lib/utils";

export function EncodingStatus({ encoded }: { encoded: boolean }) {
  return (
    <span
      className={cn(
        "absolute top-4 left-4 z-10",
        "flex items-center gap-1 rounded-full px-2 py-1 text-[10px] transition-colors",
        "before:h-1.5 before:w-1.5 before:animate-pulse before:rounded-full before:content-['']", // 점
        encoded
          ? "bg-emerald-100/80 text-emerald-700 before:bg-emerald-500"
          : "bg-amber-100/80 text-amber-700 before:bg-amber-500",
      )}
    >
      {encoded ? "최적 화질 스트리밍" : "인코딩 진행 중"}
    </span>
  );
}
