import { useEffect, useRef } from "react";

interface CanvasOverlayProps {
  question: string;
  index: number;
  totalCount: number;
  onNext: () => void;
}

// NOTE: Only for benchmark test
// DO NOT USE in production
export function CanvasOverlay({
  question,
  index,
  totalCount,
  onNext,
}: CanvasOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const buttonBoundsRef = useRef<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };
    resize();
    window.addEventListener("resize", resize);

    let animationId: number;

    const render = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, height * 0.5, 0, height);
      gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.8)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.font = "bold 24px Pretendard, sans-serif";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const textX = width / 2;
      const textY = height - 180;
      wrapText(ctx, question, textX, textY, width - 40, 32);

      ctx.font = "16px Pretendard, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fillText(`${index + 1} / ${totalCount}`, width / 2, height - 120);

      const btnW = 120;
      const btnH = 48;
      const btnX = (width - btnW) / 2;
      const btnY = height - 80;

      buttonBoundsRef.current = { x: btnX, y: btnY, w: btnW, h: btnH };

      ctx.fillStyle = "#FF5C00";
      ctx.beginPath();
      ctx.roundRect(btnX, btnY, btnW, btnH, 24);
      ctx.fill();

      ctx.font = "bold 16px Pretendard, sans-serif";
      ctx.fillStyle = "white";
      ctx.fillText(
        index === totalCount - 1 ? "완료" : "다음 질문",
        width / 2,
        btnY + btnH / 2,
      );

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [question, index, totalCount]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const bounds = buttonBoundsRef.current;
    if (!bounds) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (
      x >= bounds.x &&
      x <= bounds.x + bounds.w &&
      y >= bounds.y &&
      y <= bounds.y + bounds.h
    ) {
      onNext();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className="absolute inset-0 z-10 h-full w-full touch-none"
    />
  );
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split("");
  let line = "";
  const lines = [];

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i];
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && i > 0) {
      lines.push(line);
      line = words[i];
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  lines.forEach((l, i) => {
    ctx.fillText(
      l,
      x,
      y - ((lines.length - 1) * lineHeight) / 2 + i * lineHeight,
    );
  });
}
