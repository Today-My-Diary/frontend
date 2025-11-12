const QUESTIONS = [
  [
    "오늘 하루 중, 당신을 가장 활짝 웃게 만든 순간은 언제였나요?",
    "오늘 스스로 '이건 정말 잘했다' 하고 칭찬해주고 싶은 일이 있나요?",
  ],
  [
    "오늘 당신의 마음을 가장 무겁게 했거나, 속상하게 했던 일은 무엇인가요?",
    "오늘 '아, 이래서 행복하구나' 하고 느꼈던 아주 작은 순간이 있나요?",
  ],
  [
    "오늘 먹었던 것 중 가장 맛있는 음식을 다른 사람에게 묘사해주세요!",
    "지금 머릿속을 복잡하게 만드는 고민이 있나요?",
  ],
  [
    "오늘 문득 고마운 마음이 들었던 사람이 있나요?",
    "오늘 당신의 눈길을 가장 오래 사로잡았던 풍경이나 장면은 무엇이었나요?",
  ],
  [
    "오늘 나눈 대화 중 가장 기억에 남는 말이 있다면 들려주세요.",
    "오늘 있었던 일 중 가장 황당한 일은 무엇인가요?",
  ],
  [
    "내일이 기대되는 이유가 있다면, 딱 한 가지만 알려주세요.",
    "10년 뒤의 나에게 한 마디만 전해줄 수 있다면, 어떤 말을 하실 건가요?",
  ],
] as const;

export function QuestionAnimation() {
  return (
    <div className="relative select-none">
      <div className="text-secondary-semilight w-full space-y-4 overflow-clip text-4xl font-semibold">
        {QUESTIONS.map((pair, index) => (
          <div
            key={index}
            className="scroll-animate animate-move-right inline-block whitespace-nowrap"
          >
            {pair.map((question, qIndex) => (
              <span key={qIndex} className={qIndex > 0 ? "ml-8" : ""}>
                {question}
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="to-secondary-light pointer-events-none absolute inset-0 bg-linear-to-b from-transparent" />
    </div>
  );
}
