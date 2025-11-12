// 이 파일은 LLM으로 생성되었습니다.
// 이유: 복잡한 SVG 애니메이션 컴포넌트 직접 구현의 어려움

interface FairyCharacterProps {
  size?: number;
  className?: string;
}

export default function FairyCharacter({
  size = 60,
  className = "",
}: FairyCharacterProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Floating animation container - using Tailwind animate-bounce with custom duration */}
      <div className="animate-fairy-float h-full w-full will-change-transform">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          {/* Magic sparkles around fairy - using Tailwind animate-pulse */}
          <circle
            cx="15"
            cy="25"
            r="1.5"
            fill="#FFD700"
            className="animate-pulse"
            style={{ animationDelay: "0s" }}
          />
          <circle
            cx="85"
            cy="35"
            r="1.5"
            fill="#FFD700"
            className="animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />
          <circle
            cx="20"
            cy="70"
            r="1.5"
            fill="#FFD700"
            className="animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <circle
            cx="80"
            cy="75"
            r="1.5"
            fill="#FFD700"
            className="animate-pulse"
            style={{ animationDelay: "1.5s" }}
          />

          {/* Left wing */}
          <path
            d="M 35 45 Q 20 35 15 45 Q 20 55 35 50 Z"
            fill="url(#wingGradient)"
            opacity="0.8"
            className="animate-fairy-wing-left"
            style={{ transformOrigin: "35px 47.5px" }}
          />

          {/* Right wing */}
          <path
            d="M 65 45 Q 80 35 85 45 Q 80 55 65 50 Z"
            fill="url(#wingGradient)"
            opacity="0.8"
            className="animate-fairy-wing-right"
            style={{ transformOrigin: "65px 47.5px" }}
          />

          {/* Body - dress shape */}
          <path d="M 50 45 L 40 70 Q 50 75 60 70 Z" fill="url(#bodyGradient)" />

          {/* Head */}
          <circle cx="50" cy="35" r="12" fill="url(#skinGradient)" />

          {/* Hair */}
          <path d="M 38 32 Q 38 22 50 20 Q 62 22 62 32" fill="#8B5E3C" />
          <circle cx="42" cy="32" r="4" fill="#8B5E3C" />
          <circle cx="58" cy="32" r="4" fill="#8B5E3C" />

          {/* Eyes - no animation, just follow the face */}
          <g>
            <circle cx="45" cy="35" r="2" fill="#4A3728" />
            <circle cx="55" cy="35" r="2" fill="#4A3728" />
          </g>

          {/* Smile */}
          <path
            d="M 45 38 Q 50 41 55 38"
            stroke="#FF9A6C"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Blush */}
          <circle cx="42" cy="37" r="2.5" fill="#FFB88C" opacity="0.5" />
          <circle cx="58" cy="37" r="2.5" fill="#FFB88C" opacity="0.5" />

          {/* Magic wand */}
          <g
            className="animate-fairy-wand"
            style={{ transformOrigin: "65px 55px" }}
          >
            <line
              x1="65"
              y1="55"
              x2="75"
              y2="65"
              stroke="#D4A574"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 75 65 L 73 62 L 78 63 L 75 58 L 77 63 L 82 62 L 77 65 L 82 68 L 77 67 L 75 72 L 73 67 L 68 68 L 73 65 Z"
              fill="#FFD700"
              className="animate-spin"
              style={{ transformOrigin: "75px 65px", animationDuration: "3s" }}
            />
          </g>

          {/* Gradients */}
          <defs>
            <linearGradient
              id="wingGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#E8D5FF" />
              <stop offset="100%" stopColor="#FFE8F0" />
            </linearGradient>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFE8D6" />
              <stop offset="100%" stopColor="#FFD4B8" />
            </linearGradient>
            <linearGradient id="skinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFF0E6" />
              <stop offset="100%" stopColor="#FFE8D6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Additional floating sparkle - reduced movement */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2">
          <div className="animate-fairy-sparkle-float h-1.5 w-1.5 rounded-full bg-yellow-300" />
        </div>
      </div>
    </div>
  );
}
