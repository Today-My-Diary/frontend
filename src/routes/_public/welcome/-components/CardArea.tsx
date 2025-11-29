import { Card } from "@/components/ui/card";
import smile_icon from "@/assets/icons/smile_icon.svg";
import cam_icon from "@/assets/icons/cam_icon.svg";
import rise_icon from "@/assets/icons/rise_icon.svg";

const FEATURES = [
  {
    icon: smile_icon,
    title: "매일 새로운 질문",
    description:
      "랜덤으로 제시되는 3개의 질문에 답하며 자연스럽게 일상을 기록합니다.",
  },
  {
    icon: cam_icon,
    title: "내 모습을 담은 일기",
    description:
      "텍스트와 달리 그 날의 표정, 말투와 분위기를 생생하게 담아냅니다.",
  },
  {
    icon: rise_icon,
    title: "나의 변화 추적",
    description:
      "과거 영상을 통해 내 생각과 모습이 어떻게 바뀌고 있는지 알 수 있습니다.",
  },
] as const;

export function CardArea() {
  return (
    <div className="mt-10 mb-40 flex w-full flex-wrap justify-center gap-8">
      {FEATURES.map((feature) => (
        <Card key={feature.title} className="text-secondary w-80">
          <img
            src={feature.icon}
            alt={feature.title}
            className="mb-3 h-12 w-12"
          />
          <h3 className="text-center text-lg font-semibold">{feature.title}</h3>
          <p className="text-center text-base break-keep">
            {feature.description}
          </p>
        </Card>
      ))}
    </div>
  );
}
