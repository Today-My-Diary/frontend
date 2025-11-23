import { Link } from "@tanstack/react-router";
import { FairyCharacter } from "@/components/FairyCharacter";
import { Button } from "@/components/ui/button";

export function RecordActionArea() {
  return (
    <section className="flex flex-col items-center">
      <FairyCharacter size={80} />
      <h2 className="text-secondary mb-8 text-2xl font-bold">
        오늘의 이야기를 들려주세요
      </h2>
      <Link to="/record">
        <Button>오늘의 질문에 답변하기</Button>
      </Link>
    </section>
  );
}
