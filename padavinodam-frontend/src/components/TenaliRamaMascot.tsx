import React from 'react';

export type MascotMood =
  | 'idle'
  | 'speaking'
  | 'inspecting'
  | 'hint_casting'
  | 'chilling_coconut'
  | 'celebrating'
  | 'facepalm';

interface TenaliRamaMascotProps {
  mood?: MascotMood;
  className?: string;
  onClick?: () => void;
}

/**
 * Extraordinary Multi-Action Animated Tenali Rama Character Engine
 * Features 7 distinct animated gameplay states:
 * 1. Inspecting: Peering through an ornate brass magnifying glass.
 * 2. Hint Casting: Throwing swirling golden stardust & glowing Telugu glyphs.
 * 3. Chilling / Idle: Sipping fresh green tender coconut water through a straw.
 * 4. Celebrating: Leaping high with arms up amidst showering golden coins.
 * 5. Speaking: Articulated pointing arm and synchronized cartoon lip-flap.
 * 6. Facepalm: Comical despair on incorrect verification.
 * 7. Idle: Natural torso breathing, blinking eyes, and swaying peacock feather.
 */
export const TenaliRamaMascot: React.FC<TenaliRamaMascotProps> = ({
  mood = 'idle',
  className = 'w-36 h-44 md:w-44 md:h-52',
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center select-none cursor-pointer transition-transform ${
        mood === 'celebrating'
          ? 'scale-105 animate-bounce'
          : mood === 'hint_casting'
          ? 'scale-105'
          : 'hover:scale-105 active:scale-95'
      } ${className}`}
      title="తెనాలి రామకృష్ణుడు (విభిన్న భంగిమలు చూడటానికి క్లిక్ చేయండి!)"
    >
      {/* Dynamic Aura Glow */}
      <div
        className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 pointer-events-none ${
          mood === 'celebrating'
            ? 'bg-amber-400/50 scale-125'
            : mood === 'hint_casting'
            ? 'bg-yellow-400/40 scale-120 animate-pulse'
            : mood === 'inspecting'
            ? 'bg-cyan-500/25 scale-110'
            : mood === 'chilling_coconut'
            ? 'bg-emerald-500/25 scale-100'
            : mood === 'facepalm'
            ? 'bg-rose-500/20 scale-95'
            : mood === 'speaking'
            ? 'bg-amber-500/30 scale-105'
            : 'bg-amber-600/20 scale-95'
        }`}
      />

      {/* Embedded High-Performance CSS Animations */}
      <style>{`
        @keyframes tenaliBreathe {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-2px) scaleY(1.02); }
        }

        @keyframes tenaliMouthFlap {
          0%, 100% { transform: scaleY(0.4) scaleX(0.9); }
          25% { transform: scaleY(1.15) scaleX(1.08); }
          50% { transform: scaleY(0.6) scaleX(0.95); }
          75% { transform: scaleY(1.25) scaleX(1.1); }
        }

        @keyframes tenaliArmGesture {
          0%, 100% { transform: rotate(0deg); }
          30% { transform: rotate(-14deg) translateY(-3px); }
          65% { transform: rotate(-8deg) translateY(-1px); }
        }

        @keyframes tenaliStardustStream {
          0% { stroke-dashoffset: 200; opacity: 0.3; }
          50% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0.8; }
        }

        @keyframes tenaliGlyphFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.85; }
          50% { transform: translateY(-5px) scale(1.1); opacity: 1; }
        }

        @keyframes tenaliMagnifierHover {
          0%, 100% { transform: rotate(0deg) translate(0, 0); }
          50% { transform: rotate(-5deg) translate(-2px, -3px); }
        }

        @keyframes tenaliCoconutSip {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-2px) rotate(2deg); }
        }

        @keyframes tenaliCoinShower {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
          40% { opacity: 1; }
          100% { transform: translateY(25px) rotate(180deg); opacity: 0; }
        }

        @keyframes tenaliBlink {
          0%, 92%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.08); }
        }

        @keyframes tenaliFeatherSway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(6deg); }
        }

        .anim-breathe {
          animation: tenaliBreathe 3.5s ease-in-out infinite;
          transform-origin: 110px 220px;
        }

        .anim-mouth-talk {
          animation: tenaliMouthFlap 0.28s ease-in-out infinite;
          transform-origin: 110px 136px;
        }

        .anim-arm-gesture {
          animation: tenaliArmGesture 2s ease-in-out infinite;
          transform-origin: 145px 165px;
        }

        .anim-stardust {
          stroke-dasharray: 20 10;
          animation: tenaliStardustStream 1.5s linear infinite;
        }

        .anim-glyph {
          animation: tenaliGlyphFloat 1.8s ease-in-out infinite;
        }

        .anim-magnifier {
          animation: tenaliMagnifierHover 2.5s ease-in-out infinite;
          transform-origin: 155px 130px;
        }

        .anim-coconut {
          animation: tenaliCoconutSip 3s ease-in-out infinite;
          transform-origin: 145px 185px;
        }

        .anim-coin-1 { animation: tenaliCoinShower 1.2s ease-in infinite; }
        .anim-coin-2 { animation: tenaliCoinShower 1.4s ease-in infinite 0.3s; }
        .anim-coin-3 { animation: tenaliCoinShower 1.1s ease-in infinite 0.6s; }

        .anim-blink {
          animation: tenaliBlink 4.2s infinite;
          transform-origin: center;
        }

        .anim-feather {
          animation: tenaliFeatherSway 2.5s ease-in-out infinite;
          transform-origin: 135px 48px;
        }
      `}</style>

      {/* SVG Cartoon Artwork */}
      <svg
        viewBox="0 0 240 260"
        className="w-full h-full drop-shadow-lg overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft Ambient Ground Shadow */}
        <ellipse cx="110" cy="242" rx="55" ry="9" fill="#381a08" fillOpacity="0.28" />

        {/* ================= BACKGROUND PILLAR FOR CHILLING POSE ================= */}
        {mood === 'chilling_coconut' && (
          <g opacity="0.6">
            <rect x="25" y="40" width="35" height="205" rx="4" fill="#a88566" />
            <rect x="22" y="35" width="41" height="10" rx="3" fill="#855f41" />
            <rect x="22" y="235" width="41" height="10" rx="3" fill="#855f41" />
            <line x1="30" y1="50" x2="30" y2="230" stroke="#704e33" strokeWidth="2" />
            <line x1="55" y1="50" x2="55" y2="230" stroke="#704e33" strokeWidth="2" />
          </g>
        )}

        {/* ================= LEFT ARM & ACCESSORY ================= */}
        <g>
          {mood === 'celebrating' ? (
            /* Left Arm Raised High */
            <g transform="translate(0, -10)">
              <path
                d="M68 170 C52 145 42 120 38 98 C44 95 52 98 56 108 C64 125 74 148 78 172 Z"
                fill="#f6c297"
              />
              {/* Left open palm cheering */}
              <ellipse cx="36" cy="92" rx="6" ry="5" fill="#fbd3ad" />
              <line x1="34" y1="88" x2="32" y2="82" stroke="#f6c297" strokeWidth="2" strokeLinecap="round" />
              <line x1="37" y1="87" x2="36" y2="80" stroke="#f6c297" strokeWidth="2" strokeLinecap="round" />
              <line x1="40" y1="88" x2="41" y2="81" stroke="#f6c297" strokeWidth="2" strokeLinecap="round" />
            </g>
          ) : mood === 'chilling_coconut' ? (
            /* Arm resting casually against pillar */
            <path
              d="M68 165 C50 170 38 185 36 205 C42 208 48 205 52 195 C56 182 66 172 74 168 Z"
              fill="#b91c1c"
              stroke="#f59e0b"
              strokeWidth="1.5"
            />
          ) : (
            /* Standard: Holding Royal Palm-Leaf Manuscript (తాళపత్ర గ్రంథం) */
            <g>
              <path
                d="M68 165 C52 175 44 195 48 215 C52 220 62 218 64 210 C62 195 72 180 75 168 Z"
                fill="#b91c1c"
                stroke="#f59e0b"
                strokeWidth="1.8"
              />
              <path d="M48 208 C45 218 52 228 62 226 C68 222 66 212 62 208 Z" fill="#f6c297" />
              <g transform="translate(38, 202) rotate(-15)">
                <rect x="0" y="0" width="30" height="9" rx="3" fill="#eab308" stroke="#78350f" strokeWidth="1.2" />
                <rect x="3" y="1" width="24" height="7" rx="2" fill="#fef08a" />
                <line x1="6" y1="3.5" x2="24" y2="3.5" stroke="#92400e" strokeWidth="0.8" />
                <line x1="6" y1="5.5" x2="20" y2="5.5" stroke="#92400e" strokeWidth="0.8" />
                <circle cx="15" cy="4.5" r="2.5" fill="#dc2626" />
              </g>
            </g>
          )}
        </g>

        {/* ================= TORSO & ATTIRE ================= */}
        <g className="anim-breathe">
          <path
            d="M68 165 C48 185 45 220 60 230 C85 235 135 235 160 230 C175 220 172 185 152 165 Z"
            fill="#991b1b"
            stroke="#f59e0b"
            strokeWidth="2.5"
          />
          <path d="M80 165 C95 198 125 198 140 165 C130 220 90 220 80 165 Z" fill="#b91c1c" />
          <path d="M62 210 Q110 234 158 210" stroke="#facc15" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="95" cy="168" r="3" fill="#fbbf24" />
          <circle cx="105" cy="172" r="3.5" fill="#fef08a" />
          <circle cx="115" cy="172" r="3.5" fill="#fef08a" />
          <circle cx="125" cy="168" r="3" fill="#fbbf24" />
        </g>

        {/* ================= HEAD & FACIAL EXPRESSIONS ================= */}
        <g
          className={
            mood === 'speaking'
              ? 'animate-pulse'
              : mood === 'facepalm'
              ? 'rotate-6 origin-[110px_145px]'
              : 'anim-breathe'
          }
        >
          {/* Neck */}
          <rect x="96" y="136" width="28" height="22" rx="6" fill="#f6c297" />

          {/* Chubby Cheerful Face */}
          <ellipse cx="110" cy="116" rx="42" ry="38" fill="#fbd3ad" />

          {/* Earrings (Kundalalu) */}
          <ellipse cx="68" cy="118" rx="6.5" ry="10" fill="#f6c297" />
          <circle cx="66" cy="128" r="4.5" fill="#fbbf24" stroke="#b45309" strokeWidth="1.2" />

          <ellipse cx="152" cy="118" rx="6.5" ry="10" fill="#f6c297" />
          <circle cx="154" cy="128" r="4.5" fill="#fbbf24" stroke="#b45309" strokeWidth="1.2" />

          {/* Sacred Vibhuti & Kumkum Tilak */}
          <path d="M98 100 H122 M96 103 H124 M98 106 H122" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="110" cy="103" r="2.8" fill="#dc2626" />

          {/* Eyes (Expression-Specific) */}
          {mood === 'chilling_coconut' ? (
            /* Blissful closed / half-shut eyes */
            <g>
              <path d="M88 114 Q95 119 102 114" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M118 114 Q125 119 132 114" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </g>
          ) : mood === 'inspecting' ? (
            /* Raised eyebrow, one eye enlarged under lens */
            <g>
              {/* Left normal eye */}
              <ellipse cx="95" cy="114" rx="7" ry="5.5" fill="#ffffff" />
              <circle cx="97" cy="114" r="3.2" fill="#1e1b4b" />
              {/* Left normal brow */}
              <path d="M88 108 Q95 106 102 109" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              {/* Right arched quizzical eyebrow */}
              <path d="M116 104 Q125 98 134 105" stroke="#451a03" strokeWidth="3" strokeLinecap="round" fill="none" />
              <ellipse cx="125" cy="114" rx="9" ry="8" fill="#ffffff" />
              <circle cx="127" cy="114" r="4.5" fill="#1e1b4b" />
            </g>
          ) : mood === 'facepalm' ? (
            /* Comical squinted despair eyes */
            <g>
              <path d="M90 112 L100 117 M90 117 L100 112" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M120 112 L130 117 M120 117 L130 112" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" />
            </g>
          ) : (
            /* Animated Blinking Standard Eyes */
            <g className="anim-blink">
              <ellipse cx="95" cy="114" rx="7" ry="5.5" fill="#ffffff" />
              <ellipse cx="125" cy="114" rx="7" ry="5.5" fill="#ffffff" />
              <circle cx="97" cy="114" r="3.2" fill="#1e1b4b" />
              <circle cx="127" cy="114" r="3.2" fill="#1e1b4b" />
              <circle cx="98.5" cy="112.5" r="1.1" fill="#ffffff" />
              <circle cx="128.5" cy="112.5" r="1.1" fill="#ffffff" />
              <path d="M88 111 Q95 108 102 111" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M118 111 Q125 108 132 111" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* Nose */}
          <path
            d="M108 116 Q110 124 105 125 Q113 126 112 120"
            stroke="#b45309"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Mustache */}
          <path d="M92 128 Q110 137 128 128" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Mouth (Mood-Reactive) */}
          {mood === 'speaking' ? (
            <g className="anim-mouth-talk">
              <ellipse cx="110" cy="136" rx="8.5" ry="6.5" fill="#7f1d1d" stroke="#581c87" strokeWidth="0.8" />
              <path d="M104 133 Q110 135 116 133" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
              <ellipse cx="110" cy="139" rx="5.5" ry="3" fill="#dc2626" />
            </g>
          ) : mood === 'celebrating' ? (
            <g>
              <path d="M94 131 Q110 149 126 131" fill="#991b1b" stroke="#78350f" strokeWidth="1.5" />
              <path d="M98 132 Q110 138 122 132" fill="#ffffff" />
            </g>
          ) : mood === 'facepalm' ? (
            /* Wavy comical sigh */
            <path d="M100 137 Q105 133 110 137 Q115 141 120 137" stroke="#451a03" strokeWidth="2" strokeLinecap="round" fill="none" />
          ) : mood === 'inspecting' ? (
            /* Witty lopsided smirk */
            <path d="M100 133 Q112 134 122 129" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          ) : (
            /* Friendly gentle smile */
            <path d="M98 132 Q110 142 122 132" fill="#b91c1c" stroke="#78350f" strokeWidth="1.2" />
          )}

          {/* Turban (పాగా) */}
          <g>
            <path
              d="M62 102 C60 62 90 42 110 42 C130 42 160 62 158 102 C140 92 80 92 62 102 Z"
              fill="#b91c1c"
              stroke="#f59e0b"
              strokeWidth="2"
            />
            <path d="M75 82 C70 52 100 32 120 29 C145 27 158 52 152 82 C135 69 90 69 75 82 Z" fill="#dc2626" />
            <path d="M70 88 Q110 68 152 88" stroke="#facc15" strokeWidth="2.8" fill="none" />
            <path d="M76 72 Q110 52 146 70" stroke="#facc15" strokeWidth="2.2" fill="none" />

            {/* Swaying Peacock Feather */}
            <g className="anim-feather">
              <path d="M135 48 Q155 23 165 8" stroke="#059669" strokeWidth="2.8" strokeLinecap="round" />
              <ellipse cx="162" cy="12" rx="8" ry="12" transform="rotate(30 162 12)" fill="#0284c7" />
              <ellipse cx="162" cy="12" rx="4.5" ry="7" transform="rotate(30 162 12)" fill="#047857" />
              <circle cx="162" cy="12" r="2.8" fill="#fbbf24" />
            </g>
            <circle cx="110" cy="68" r="8.5" fill="#fbbf24" stroke="#78350f" strokeWidth="1.8" />
            <circle cx="110" cy="68" r="4.8" fill="#dc2626" />
          </g>
        </g>

        {/* ================= RIGHT ARM & DYNAMIC ACTION PROPS ================= */}
        {mood === 'inspecting' ? (
          /* ================= 1. INSPECTING: BRASS MAGNIFYING GLASS ================= */
          <g className="anim-magnifier">
            {/* Right Arm holding handle up to eye */}
            <path
              d="M152 165 C165 155 174 140 168 125 C162 122 155 128 150 138 C144 148 146 160 152 165 Z"
              fill="#f6c297"
            />
            {/* Hand gripping handle */}
            <ellipse cx="162" cy="128" rx="5" ry="4" fill="#fbd3ad" />

            {/* Ornate Brass Magnifying Glass */}
            <g transform="translate(132, 102) rotate(-20)">
              {/* Glass Lens with cyan tint */}
              <circle cx="16" cy="16" r="15" fill="#38bdf8" fillOpacity="0.35" stroke="#f59e0b" strokeWidth="3" />
              {/* Specular shine arc */}
              <path d="M8 12 A 10 10 0 0 1 18 6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              {/* Handle */}
              <path d="M26 26 L38 38" stroke="#b45309" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M26 26 L38 38" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          </g>
        ) : mood === 'hint_casting' ? (
          /* ================= 2. HINT CASTING: GLOWING STARDUST & TELUGU GLYPHS ================= */
          <g>
            {/* Arm thrusting forward */}
            <path
              d="M152 165 C172 160 190 155 208 148 C212 152 210 160 202 166 C186 174 168 178 152 170 Z"
              fill="#f6c297"
            />
            {/* Open spellcasting palm */}
            <ellipse cx="210" cy="150" rx="5.5" ry="4.5" fill="#fbd3ad" />

            {/* Swirling Stardust Beam */}
            <path
              d="M210 150 Q225 130 235 110 T240 70"
              stroke="#fbbf24"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
              className="anim-stardust"
            />

            {/* Floating Magical Telugu Glyphs */}
            <g className="anim-glyph" transform="translate(215, 125)">
              <circle cx="0" cy="0" r="10" fill="#fef08a" fillOpacity="0.4" filter="blur(2px)" />
              <text x="-5" y="4" fill="#78350f" fontSize="11" fontWeight="bold" fontFamily="serif">అ</text>
            </g>

            <g className="anim-glyph" transform="translate(228, 95)" style={{ animationDelay: '0.4s' }}>
              <circle cx="0" cy="0" r="11" fill="#fef08a" fillOpacity="0.5" filter="blur(2px)" />
              <text x="-5" y="4" fill="#92400e" fontSize="12" fontWeight="bold" fontFamily="serif">క</text>
            </g>

            <g className="anim-glyph" transform="translate(210, 75)" style={{ animationDelay: '0.8s' }}>
              <circle cx="0" cy="0" r="12" fill="#fbbf24" fillOpacity="0.6" filter="blur(2px)" />
              <text x="-6" y="5" fill="#b45309" fontSize="13" fontWeight="bold" fontFamily="serif">రా</text>
            </g>
          </g>
        ) : mood === 'chilling_coconut' ? (
          /* ================= 3. CHILLING: GREEN TENDER COCONUT & STRAW ================= */
          <g className="anim-coconut">
            {/* Arm holding coconut */}
            <path
              d="M152 165 C162 175 168 190 160 205 C154 208 148 202 145 195 C142 185 146 175 152 165 Z"
              fill="#f6c297"
            />
            {/* Green Tender Coconut */}
            <g transform="translate(142, 175)">
              <ellipse cx="14" cy="14" rx="14" ry="13" fill="#15803d" stroke="#166534" strokeWidth="1.5" />
              <ellipse cx="14" cy="4" rx="7" ry="4" fill="#86efac" />
              {/* Straw leading to mouth */}
              <path d="M14 4 L14 -12 Q14 -24 -24 -42" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </g>
          </g>
        ) : mood === 'celebrating' ? (
          /* ================= 4. CELEBRATING: LEAPING HIGH & SHOWER OF GOLD COINS ================= */
          <g>
            {/* Right Arm Raised High */}
            <path
              d="M152 165 C168 140 180 115 186 92 C180 88 172 92 168 102 C160 120 152 145 148 165 Z"
              fill="#f6c297"
            />
            <ellipse cx="188" cy="88" rx="6" ry="5" fill="#fbd3ad" />

            {/* Bursting Golden Coins & Sparkles */}
            <g className="anim-coin-1" transform="translate(195, 60)">
              <circle cx="0" cy="0" r="5" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
              <text x="-2" y="3" fontSize="6" fill="#78350f" fontWeight="bold">₹</text>
            </g>
            <g className="anim-coin-2" transform="translate(170, 45)">
              <circle cx="0" cy="0" r="6" fill="#facc15" stroke="#78350f" strokeWidth="1.2" />
              <text x="-2.5" y="3" fontSize="7" fill="#78350f" fontWeight="bold">₹</text>
            </g>
            <g className="anim-coin-3" transform="translate(205, 90)">
              <circle cx="0" cy="0" r="5" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
              <text x="-2" y="3" fontSize="6" fill="#78350f" fontWeight="bold">₹</text>
            </g>
          </g>
        ) : mood === 'facepalm' ? (
          /* ================= 5. FACEPALM: HAND ON FOREHEAD ================= */
          <g>
            <path
              d="M152 165 C165 145 158 120 135 105 C130 108 132 115 138 122 C145 135 148 152 152 165 Z"
              fill="#f6c297"
            />
            <ellipse cx="132" cy="104" rx="7" ry="5.5" fill="#fbd3ad" transform="rotate(-15 132 104)" />
          </g>
        ) : mood === 'speaking' ? (
          /* ================= 6. SPEAKING: POINTING ARM TOWARDS GRID ================= */
          <g className="anim-arm-gesture">
            <path
              d="M152 165 C170 175 185 190 188 208 C185 214 175 215 168 208 C162 195 156 182 146 168 Z"
              fill="#b91c1c"
              stroke="#f59e0b"
              strokeWidth="1.8"
            />
            <path
              d="M178 202 C188 192 198 178 202 165 C208 168 209 175 204 184 C195 198 186 210 178 208 Z"
              fill="#f6c297"
            />
            <g transform="translate(196, 162)">
              <ellipse cx="6" cy="4" rx="5" ry="4" fill="#fbd3ad" />
              <path d="M8 2 C14 0 18 1 19 3 C18 5 14 5 8 5 Z" fill="#f6c297" />
              <circle cx="6" cy="6" r="2.5" fill="#f6c297" />
              <circle cx="4" cy="7" r="2.2" fill="#f6c297" />
              <path d="M4 2 Q5 -3 8 -3 Q9 -1 7 2 Z" fill="#f6c297" />
            </g>
          </g>
        ) : (
          /* ================= 7. IDLE: HAND ON WAIST SASH ================= */
          <g>
            <path
              d="M152 165 C170 175 185 190 188 208 C185 214 175 215 168 208 C162 195 156 182 146 168 Z"
              fill="#b91c1c"
              stroke="#f59e0b"
              strokeWidth="1.8"
            />
            <path
              d="M174 195 C170 210 162 220 152 222 C148 218 152 212 158 206 C165 198 172 192 176 195 Z"
              fill="#f6c297"
            />
            <circle cx="152" cy="220" r="5" fill="#fbd3ad" />
          </g>
        )}
      </svg>
    </div>
  );
};
