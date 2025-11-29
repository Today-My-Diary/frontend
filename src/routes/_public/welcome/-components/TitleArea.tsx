import { FairyCharacter } from "@/components/FairyCharacter";
import { cn } from "@/lib/utils";

export function TitleArea() {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <FairyCharacter size={100} />
      <hgroup className="text-secondary text-center text-3xl font-bold md:text-5xl">
        <h1 className="animate-in fade-in duration-1000">
          당신의 <span className="text-primary">하루</span>를
        </h1>
        <h1
          className={cn(
            "animate-in fade-in fill-mode-backwards",
            "delay-1000 duration-1000",
          )}
        >
          필름에 담아보세요.
        </h1>
      </hgroup>
      <div
        className={cn(
          "text-secondary mt-4 text-center text-xl",
          "animate-in fade-in fill-mode-backwards",
          "delay-2000 duration-1000",
        )}
      >
        <p>
          매일의 일상을 영상으로 기록하고, <br className="md:hidden" />
          나만의 특별한 이야기를 만들어보세요.
        </p>
        <p>당신의 일상을 가장 생생하게 기록합니다.</p>
      </div>
    </div>
  );
}
