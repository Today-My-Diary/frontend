import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export function CTAArea() {
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <h2 className="text-secondary text-center text-3xl font-bold md:text-5xl">
        매일 <span className="text-primary">3개의 질문</span>에{" "}
        <br className="md:hidden" />
        답변해보세요.
      </h2>
      <div className="text-secondary text-center text-xl font-light">
        하루에 단 10분, 나를 되돌아보며 <br className="md:hidden" />
        나만의 영상 일기를 기록해요.
      </div>
      <Link to="/login" className="mt-4">
        <Button variant="primary" size="lg">
          지금, 오늘의 이야기 기록하기
        </Button>
      </Link>
    </div>
  );
}
