import React from 'react';

export type MascotMood = 'idle' | 'speaking' | 'thinking' | 'celebrating';

interface TenaliRamaMascotProps {
  mood?: MascotMood;
  className?: string;
  onClick?: () => void;
}

/**
 * Animated Vector Tenali Rama Mascot (తెనాలి రామకృష్ణుడు)
 * Authentic royal Vijayanagara court jester & poet with responsive cartoon animations.
 */
export const TenaliRamaMascot: React.FC<TenaliRamaMascotProps> = ({
  mood = 'idle',
  className = 'w-28 h-36 md:w-36 md:h-44',
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center select-none cursor-pointer transition-transform ${
        mood === 'celebrating' ? 'animate-bounce' : 'hover:scale-105 active:scale-95'
      } ${className}`}
      title="తెనాలి రామకృష్ణుడు (క్లిక్ చేయండి!)"
    >
      {/* Golden Divine Aura Glow behind Mascot */}
      <div
        className={`absolute inset-0 rounded-full blur-xl transition-opacity duration-500 pointer-events-none ${
          mood === 'celebrating'
            ? 'bg-amber-400/40 opacity-100 scale-125'
            : mood === 'speaking'
            ? 'bg-amber-500/25 opacity-90'
            : 'bg-amber-600/15 opacity-60'
        }`}
      />

      {/* Floating Sparkles when Celebrating */}
      {mood === 'celebrating' && (
        <div className="absolute -top-3 inset-x-0 flex justify-around pointer-events-none animate-pulse">
          <span className="text-amber-400 text-lg">✨</span>
          <span className="text-yellow-300 text-xl">🌟</span>
          <span className="text-amber-400 text-lg">✨</span>
        </div>
      )}

      {/* SVG Cartoon Character */}
      <svg
        viewBox="0 0 200 240"
        className="w-full h-full drop-shadow-md overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft Ground Shadow */}
        <ellipse cx="100" cy="228" rx="48" ry="8" fill="#451a03" fillOpacity="0.25" />

        {/* Torso & Royal Red Angavastram with Gold Embroidered Borders */}
        <g className="transition-transform duration-300">
          <path
            d="M60 165 C40 185 36 215 50 225 C80 230 120 230 150 225 C164 215 160 185 140 165 Z"
            fill="#991b1b"
            stroke="#f59e0b"
            strokeWidth="2.5"
          />
          {/* Angavastram Pleats */}
          <path d="M72 165 C85 195 115 195 128 165 C118 215 82 215 72 165 Z" fill="#b91c1c" />
          <path d="M52 205 Q100 228 148 205" stroke="#facc15" strokeWidth="3.5" strokeLinecap="round" />

          {/* Rudraksha & Pearl Malas */}
          <circle cx="85" cy="168" r="3" fill="#fbbf24" />
          <circle cx="95" cy="172" r="3.5" fill="#fef08a" />
          <circle cx="105" cy="172" r="3.5" fill="#fef08a" />
          <circle cx="115" cy="168" r="3" fill="#fbbf24" />
        </g>

        {/* Neck */}
        <rect x="86" y="136" width="28" height="22" rx="6" fill="#f6c297" />

        {/* Head Group (tilts during thinking or speaking) */}
        <g
          className={`origin-[100px_140px] transition-transform duration-300 ${
            mood === 'thinking'
              ? '-rotate-6'
              : mood === 'speaking'
              ? 'animate-pulse'
              : mood === 'celebrating'
              ? 'rotate-3'
              : ''
          }`}
        >
          {/* Face Base */}
          <ellipse cx="100" cy="116" rx="42" ry="38" fill="#fbd3ad" />

          {/* Ears & Golden Kundalalu (Earrings) */}
          <ellipse cx="58" cy="118" rx="6.5" ry="10" fill="#f6c297" />
          <circle cx="56" cy="128" r="4.5" fill="#fbbf24" stroke="#b45309" strokeWidth="1.2" />

          <ellipse cx="142" cy="118" rx="6.5" ry="10" fill="#f6c297" />
          <circle cx="144" cy="128" r="4.5" fill="#fbbf24" stroke="#b45309" strokeWidth="1.2" />

          {/* Sacred Vibhuti & Kumkum Tilak */}
          <path d="M88 100 H112 M86 103 H114 M88 106 H112" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="100" cy="103" r="2.5" fill="#dc2626" />

          {/* Eyes (Animated for Blinks & Direction) */}
          <g>
            {/* Sclera */}
            <ellipse cx="85" cy="114" rx="7" ry="5.5" fill="#ffffff" />
            <ellipse cx="115" cy="114" rx="7" ry="5.5" fill="#ffffff" />

            {/* Pupils */}
            {mood === 'thinking' ? (
              <>
                {/* Looking up-right thoughtfully */}
                <circle cx="87" cy="111" r="3" fill="#1e1b4b" />
                <circle cx="117" cy="111" r="3" fill="#1e1b4b" />
              </>
            ) : (
              <>
                {/* Looking straight with sparkle */}
                <circle cx="86" cy="114" r="3.2" fill="#1e1b4b" />
                <circle cx="116" cy="114" r="3.2" fill="#1e1b4b" />
                <circle cx="87.5" cy="112.5" r="1.1" fill="#ffffff" />
                <circle cx="117.5" cy="112.5" r="1.1" fill="#ffffff" />
              </>
            )}

            {/* Eyelids during blink */}
            <path
              d="M78 111 Q85 108 92 111"
              stroke="#451a03"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M108 111 Q115 108 122 111"
              stroke="#451a03"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Nose */}
          <path
            d="M98 116 Q100 124 95 125 Q103 126 102 120"
            stroke="#b45309"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Expressive Mustache */}
          <path
            d="M82 128 Q100 137 118 128"
            stroke="#451a03"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />

          {/* Mouth (Speaking vs Smiling) */}
          {mood === 'speaking' ? (
            /* Open talking mouth */
            <g className="animate-pulse">
              <ellipse cx="100" cy="136" rx="7" ry="5.5" fill="#991b1b" stroke="#78350f" strokeWidth="1" />
              <path d="M96 133 Q100 135 104 133" fill="#ffffff" />
            </g>
          ) : mood === 'celebrating' ? (
            /* Big joyous grin */
            <g>
              <path d="M85 131 Q100 148 115 131" fill="#991b1b" stroke="#78350f" strokeWidth="1.5" />
              <path d="M88 132 Q100 138 112 132" fill="#ffffff" />
            </g>
          ) : (
            /* Friendly gentle smile */
            <path
              d="M88 132 Q100 142 112 132"
              fill="#b91c1c"
              stroke="#78350f"
              strokeWidth="1.2"
            />
          )}

          {/* Majestic Red & Gold Vijayanagara Turban (పాగా) */}
          <g>
            {/* Base wrapping */}
            <path
              d="M52 102 C50 62 80 42 100 42 C120 42 150 62 148 102 C130 92 70 92 52 102 Z"
              fill="#b91c1c"
              stroke="#f59e0b"
              strokeWidth="2"
            />
            {/* Turban Crown Dome */}
            <path
              d="M65 82 C60 52 90 32 110 29 C135 27 148 52 142 82 C125 69 80 69 65 82 Z"
              fill="#dc2626"
            />
            {/* Golden Silk Folds */}
            <path d="M60 88 Q100 68 142 88" stroke="#facc15" strokeWidth="2.8" fill="none" />
            <path d="M66 72 Q100 52 136 70" stroke="#facc15" strokeWidth="2.2" fill="none" />

            {/* Royal Peacock Feather (నెమలి పించం) */}
            <path d="M125 48 Q145 23 155 8" stroke="#059669" strokeWidth="2.8" strokeLinecap="round" />
            <ellipse cx="152" cy="12" rx="8" ry="12" transform="rotate(30 152 12)" fill="#0284c7" />
            <ellipse cx="152" cy="12" rx="4.5" ry="7" transform="rotate(30 152 12)" fill="#047857" />
            <circle cx="152" cy="12" r="2.8" fill="#fbbf24" />

            {/* Padmaragam Gold Brooch */}
            <circle cx="100" cy="68" r="8" fill="#fbbf24" stroke="#78350f" strokeWidth="1.8" />
            <circle cx="100" cy="68" r="4.5" fill="#dc2626" />
          </g>
        </g>
      </svg>
    </div>
  );
};
