import { Button } from "@/components/ui/button";

interface QuestionOverlayProps {
  question: string;
  index: number;
  totalCount: number;
  onNext: () => void;
}

export function QuestionOverlay({
  question,
  index,
  totalCount,
  onNext,
}: QuestionOverlayProps) {
  const isLast = index === totalCount - 1;

  return (
    <div className="absolute right-0 bottom-15 left-0 z-10 flex flex-col items-center gap-6 px-2">
      <div className="flex flex-col items-center gap-4 rounded-lg bg-black/60 p-8 text-center shadow-lg backdrop-blur-sm">
        <span className="text-md text-white">{index + 1}번째 질문</span>
        <h2
          key={index}
          className="animate-in fade-in zoom-in-95 text-lg font-semibold break-keep text-white duration-300 md:text-xl"
        >
          {question}
        </h2>
      </div>

      <Button
        onClick={onNext}
        variant={isLast ? "primary" : "white"}
        className="backdrop-blur-sm"
      >
        {isLast ? "녹화 완료" : "다음 질문 →"}
      </Button>
    </div>
  );
}
