import React from 'react';

export type MascotMood = 'idle' | 'speaking' | 'thinking' | 'celebrating';

interface TenaliRamaMascotProps {
  mood?: MascotMood;
  className?: string;
  onClick?: () => void;
}

/**
 * Fully Rigged Animated Vector Tenali Rama Mascot (తెనాలి రామకృష్ణుడు)
 * Features articulated moving hands, animated speaking mouth visemes,
 * blinking eyes, swaying peacock feather, and reactive gestures.
 */
export const TenaliRamaMascot: React.FC<TenaliRamaMascotProps> = ({
  mood = 'idle',
  className = 'w-32 h-40 md:w-40 md:h-48',
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center select-none cursor-pointer transition-transform ${
        mood === 'celebrating' ? 'scale-105' : 'hover:scale-105 active:scale-95'
      } ${className}`}
      title="తెనాలి రామకృష్ణుడు (క్లిక్ చేయండి!)"
    >
      {/* Dynamic Aura Glow */}
      <div
        className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 pointer-events-none ${
          mood === 'celebrating'
            ? 'bg-amber-400/50 scale-125 animate-pulse'
            : mood === 'speaking'
            ? 'bg-amber-500/30 scale-110'
            : mood === 'thinking'
            ? 'bg-indigo-500/20 scale-100'
            : 'bg-amber-600/20 scale-95'
        }`}
      />

      {/* Floating Sparkles when Celebrating */}
      {mood === 'celebrating' && (
        <div className="absolute -top-4 inset-x-0 flex justify-between pointer-events-none animate-bounce">
          <span className="text-amber-400 text-lg">✨</span>
          <span className="text-yellow-300 text-2xl">🌟</span>
          <span className="text-amber-400 text-lg">✨</span>
        </div>
      )}

      {/* Embedded CSS Animations for Joint Articulation & Lip-Flap */}
      <style>{`
        /* Breathing Torso */
        @keyframes tenaliBreathe {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-2px) scaleY(1.015); }
        }

        /* Head Bobbing while Talking */
        @keyframes tenaliHeadTalk {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          25% { transform: rotate(-2.5deg) translateY(-1px); }
          50% { transform: rotate(1deg) translateY(0.5px); }
          75% { transform: rotate(-1.5deg) translateY(-0.5px); }
        }

        /* Continuous Lip-Sync Mouth Flap */
        @keyframes tenaliMouthFlap {
          0%, 100% { transform: scaleY(0.4) scaleX(0.9); }
          20% { transform: scaleY(1.1) scaleX(1.05); }
          40% { transform: scaleY(0.6) scaleX(0.95); }
          60% { transform: scaleY(1.25) scaleX(1.1); }
          80% { transform: scaleY(0.5) scaleX(0.92); }
        }

        /* Right Arm Gesturing Towards Crossword Grid */
        @keyframes tenaliArmGesture {
          0%, 100% { transform: rotate(0deg); }
          30% { transform: rotate(-14deg) translateY(-3px); }
          65% { transform: rotate(-8deg) translateY(-1px); }
        }

        /* Hand Pointing / Beckoning */
        @keyframes tenaliHandWave {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(18deg); }
        }

        /* Thinking Arm Stroke Chin */
        @keyframes tenaliArmThink {
          0%, 100% { transform: rotate(-22deg) translateY(-6px); }
          50% { transform: rotate(-26deg) translateY(-9px); }
        }

        /* Celebrating Arms Raised High */
        @keyframes tenaliArmCelebrate {
          0%, 100% { transform: rotate(-45deg) translateY(-12px); }
          50% { transform: rotate(-52deg) translateY(-16px); }
        }

        /* Eye Blinking */
        @keyframes tenaliBlink {
          0%, 92%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.08); }
        }

        /* Peacock Feather Inertia Sway */
        @keyframes tenaliFeatherSway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(6deg); }
        }

        .anim-breathe {
          animation: tenaliBreathe 3.5s ease-in-out infinite;
          transform-origin: 100px 220px;
        }

        .anim-head-talk {
          animation: tenaliHeadTalk 1.2s ease-in-out infinite;
          transform-origin: 100px 145px;
        }

        .anim-mouth-talk {
          animation: tenaliMouthFlap 0.28s ease-in-out infinite;
          transform-origin: 100px 136px;
        }

        .anim-arm-gesture {
          animation: tenaliArmGesture 2.2s ease-in-out infinite;
          transform-origin: 135px 165px;
        }

        .anim-hand-point {
          animation: tenaliHandWave 1.4s ease-in-out infinite;
          transform-origin: 172px 148px;
        }

        .anim-arm-think {
          animation: tenaliArmThink 2s ease-in-out infinite;
          transform-origin: 135px 165px;
        }

        .anim-arm-celebrate {
          animation: tenaliArmCelebrate 0.8s ease-in-out infinite;
          transform-origin: 135px 165px;
        }

        .anim-arm-left-celebrate {
          animation: tenaliArmCelebrate 0.8s ease-in-out infinite reverse;
          transform-origin: 65px 165px;
        }

        .anim-blink {
          animation: tenaliBlink 4.2s infinite;
          transform-origin: center;
        }

        .anim-feather {
          animation: tenaliFeatherSway 2.5s ease-in-out infinite;
          transform-origin: 125px 48px;
        }
      `}</style>

      {/* Scalable Vector Cartoon Tenali Rama */}
      <svg
        viewBox="0 0 220 250"
        className="w-full h-full drop-shadow-lg overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft Ambient Ground Shadow */}
        <ellipse cx="110" cy="235" rx="52" ry="9" fill="#381a08" fillOpacity="0.28" />

        {/* LEFT ARM & TALAPATRA SCROLL */}
        <g
          className={
            mood === 'celebrating'
              ? 'anim-arm-left-celebrate'
              : 'transition-transform duration-300'
          }
        >
          {/* Left Upper Arm & Shoulder */}
          <path
            d="M65 165 C50 175 42 195 48 215 C52 220 62 218 64 210 C62 195 72 180 75 168 Z"
            fill="#b91c1c"
            stroke="#f59e0b"
            strokeWidth="1.8"
          />
          {/* Left Forearm */}
          <path d="M48 208 C45 218 52 228 62 226 C68 222 66 212 62 208 Z" fill="#f6c297" />

          {/* Left Hand holding Royal Talapatra Palm-Leaf Scroll */}
          {mood !== 'celebrating' && (
            <g transform="translate(38, 202) rotate(-15)">
              <rect x="0" y="0" width="30" height="9" rx="3" fill="#eab308" stroke="#78350f" strokeWidth="1.2" />
              <rect x="3" y="1" width="24" height="7" rx="2" fill="#fef08a" />
              <line x1="6" y1="3.5" x2="24" y2="3.5" stroke="#92400e" strokeWidth="0.8" />
              <line x1="6" y1="5.5" x2="20" y2="5.5" stroke="#92400e" strokeWidth="0.8" />
              {/* Silk ribbon tie */}
              <circle cx="15" cy="4.5" r="2.5" fill="#dc2626" />
            </g>
          )}
        </g>

        {/* TORSO & ROYAL VESTMENTS (Breathing Animation) */}
        <g className="anim-breathe">
          {/* Royal Red Angavastram Base */}
          <path
            d="M68 165 C48 185 45 220 60 230 C85 235 135 235 160 230 C175 220 172 185 152 165 Z"
            fill="#991b1b"
            stroke="#f59e0b"
            strokeWidth="2.5"
          />
          {/* Golden Embroidered Pleats & Folds */}
          <path d="M80 165 C95 198 125 198 140 165 C130 220 90 220 80 165 Z" fill="#b91c1c" />
          <path d="M62 210 Q110 234 158 210" stroke="#facc15" strokeWidth="3.5" strokeLinecap="round" />

          {/* Rudraksha & Gold Pearl Necklace */}
          <circle cx="95" cy="168" r="3" fill="#fbbf24" />
          <circle cx="105" cy="172" r="3.5" fill="#fef08a" />
          <circle cx="115" cy="172" r="3.5" fill="#fef08a" />
          <circle cx="125" cy="168" r="3" fill="#fbbf24" />
        </g>

        {/* HEAD & FACE GROUP (Articulated with Bobbing & Speaking) */}
        <g
          className={
            mood === 'speaking'
              ? 'anim-head-talk'
              : mood === 'thinking'
              ? '-rotate-6 origin-[110px_145px] transition-transform duration-500'
              : mood === 'celebrating'
              ? 'rotate-3 origin-[110px_145px]'
              : 'anim-breathe'
          }
        >
          {/* Neck */}
          <rect x="96" y="136" width="28" height="22" rx="6" fill="#f6c297" />

          {/* Chubby Cheerful Face */}
          <ellipse cx="110" cy="116" rx="42" ry="38" fill="#fbd3ad" />

          {/* Ears with Golden Kundalalu (Temple Earrings) */}
          <ellipse cx="68" cy="118" rx="6.5" ry="10" fill="#f6c297" />
          <circle cx="66" cy="128" r="4.5" fill="#fbbf24" stroke="#b45309" strokeWidth="1.2" />

          <ellipse cx="152" cy="118" rx="6.5" ry="10" fill="#f6c297" />
          <circle cx="154" cy="128" r="4.5" fill="#fbbf24" stroke="#b45309" strokeWidth="1.2" />

          {/* Sacred Vibhuti & Kumkum Tilak */}
          <path d="M98 100 H122 M96 103 H124 M98 106 H122" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="110" cy="103" r="2.8" fill="#dc2626" />

          {/* Animated Blinking Eyes */}
          <g className="anim-blink">
            {/* Eye whites */}
            <ellipse cx="95" cy="114" rx="7" ry="5.5" fill="#ffffff" />
            <ellipse cx="125" cy="114" rx="7" ry="5.5" fill="#ffffff" />

            {/* Dynamic Pupils based on Mood */}
            {mood === 'thinking' ? (
              <>
                {/* Looking up-right thoughtfully */}
                <circle cx="97" cy="110.5" r="3.2" fill="#1e1b4b" />
                <circle cx="127" cy="110.5" r="3.2" fill="#1e1b4b" />
              </>
            ) : mood === 'speaking' ? (
              <>
                {/* Looking towards the crossword board */}
                <circle cx="98" cy="114" r="3.2" fill="#1e1b4b" />
                <circle cx="128" cy="114" r="3.2" fill="#1e1b4b" />
                <circle cx="99.5" cy="112.5" r="1.1" fill="#ffffff" />
                <circle cx="129.5" cy="112.5" r="1.1" fill="#ffffff" />
              </>
            ) : (
              <>
                {/* Gentle straight look with twinkle */}
                <circle cx="96" cy="114" r="3.2" fill="#1e1b4b" />
                <circle cx="126" cy="114" r="3.2" fill="#1e1b4b" />
                <circle cx="97.5" cy="112.5" r="1.1" fill="#ffffff" />
                <circle cx="127.5" cy="112.5" r="1.1" fill="#ffffff" />
              </>
            )}

            {/* Eyelash arcs */}
            <path d="M88 111 Q95 108 102 111" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M118 111 Q125 108 132 111" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          </g>

          {/* Nose */}
          <path
            d="M108 116 Q110 124 105 125 Q113 126 112 120"
            stroke="#b45309"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Expressive Witty Mustache */}
          <path
            d="M92 128 Q110 137 128 128"
            stroke="#451a03"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* DYNAMIC ANIMATED MOUTH (LIP-FLAP TALKING) */}
          {mood === 'speaking' ? (
            /* Animated Talking Mouth Cycle */
            <g className="anim-mouth-talk">
              {/* Open Mouth cavity */}
              <ellipse cx="110" cy="136" rx="8.5" ry="6.5" fill="#7f1d1d" stroke="#581c87" strokeWidth="0.8" />
              {/* Upper White Teeth Row */}
              <path d="M104 133 Q110 135 116 133" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
              {/* Red Tongue */}
              <ellipse cx="110" cy="139" rx="5.5" ry="3" fill="#dc2626" />
            </g>
          ) : mood === 'celebrating' ? (
            /* Joyful Wide Smile */
            <g>
              <path d="M94 131 Q110 149 126 131" fill="#991b1b" stroke="#78350f" strokeWidth="1.5" />
              <path d="M98 132 Q110 138 122 132" fill="#ffffff" />
            </g>
          ) : mood === 'thinking' ? (
            /* Pursed Witty Grin */
            <path
              d="M102 133 Q114 137 124 131"
              stroke="#451a03"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            /* Gentle Pleasant Smile */
            <path
              d="M98 132 Q110 142 122 132"
              fill="#b91c1c"
              stroke="#78350f"
              strokeWidth="1.2"
            />
          )}

          {/* ROYAL VIJAYANAGARA TURBAN (పాగా) */}
          <g>
            {/* Turban Base Wrapping */}
            <path
              d="M62 102 C60 62 90 42 110 42 C130 42 160 62 158 102 C140 92 80 92 62 102 Z"
              fill="#b91c1c"
              stroke="#f59e0b"
              strokeWidth="2"
            />
            {/* Turban Crest Swirl */}
            <path
              d="M75 82 C70 52 100 32 120 29 C145 27 158 52 152 82 C135 69 90 69 75 82 Z"
              fill="#dc2626"
            />
            {/* Golden Silk Folds */}
            <path d="M70 88 Q110 68 152 88" stroke="#facc15" strokeWidth="2.8" fill="none" />
            <path d="M76 72 Q110 52 146 70" stroke="#facc15" strokeWidth="2.2" fill="none" />

            {/* SWAYING PEACOCK FEATHER (నెమలి పించం) */}
            <g className="anim-feather">
              <path d="M135 48 Q155 23 165 8" stroke="#059669" strokeWidth="2.8" strokeLinecap="round" />
              <ellipse cx="162" cy="12" rx="8" ry="12" transform="rotate(30 162 12)" fill="#0284c7" />
              <ellipse cx="162" cy="12" rx="4.5" ry="7" transform="rotate(30 162 12)" fill="#047857" />
              <circle cx="162" cy="12" r="2.8" fill="#fbbf24" />
            </g>

            {/* Padmaragam Ruby & Gold Medallion */}
            <circle cx="110" cy="68" r="8.5" fill="#fbbf24" stroke="#78350f" strokeWidth="1.8" />
            <circle cx="110" cy="68" r="4.8" fill="#dc2626" />
          </g>
        </g>

        {/* RIGHT ARM & GESTURING HAND (Fully Rigged & Articulated) */}
        <g
          className={
            mood === 'speaking'
              ? 'anim-arm-gesture'
              : mood === 'thinking'
              ? 'anim-arm-think'
              : mood === 'celebrating'
              ? 'anim-arm-celebrate'
              : 'anim-breathe'
          }
        >
          {/* Right Shoulder & Upper Arm */}
          <path
            d="M152 165 C170 175 185 190 188 208 C185 214 175 215 168 208 C162 195 156 182 146 168 Z"
            fill="#b91c1c"
            stroke="#f59e0b"
            strokeWidth="1.8"
          />

          {/* Right Forearm & Wrist */}
          {mood === 'speaking' ? (
            /* Forearm extending forward gesturing toward the board */
            <g>
              <path
                d="M178 202 C188 192 198 178 202 165 C208 168 209 175 204 184 C195 198 186 210 178 208 Z"
                fill="#f6c297"
              />
              {/* Articulated Hand Pointing/Beckoning to the Board */}
              <g className="anim-hand-point" transform="translate(196, 162)">
                {/* Palm */}
                <ellipse cx="6" cy="4" rx="5" ry="4" fill="#fbd3ad" />
                {/* Index finger pointing rightward */}
                <path d="M8 2 C14 0 18 1 19 3 C18 5 14 5 8 5 Z" fill="#f6c297" />
                {/* Curled other fingers */}
                <circle cx="6" cy="6" r="2.5" fill="#f6c297" />
                <circle cx="4" cy="7" r="2.2" fill="#f6c297" />
                {/* Thumb pointing up */}
                <path d="M4 2 Q5 -3 8 -3 Q9 -1 7 2 Z" fill="#f6c297" />
              </g>
            </g>
          ) : mood === 'thinking' ? (
            /* Hand reaching up to stroke chin/cheek */
            <g>
              <path
                d="M176 198 C172 178 162 160 148 142 C154 138 160 142 165 152 C174 168 182 185 180 202 Z"
                fill="#f6c297"
              />
              {/* Hand touching chin */}
              <g transform="translate(138, 134) rotate(-35)">
                <ellipse cx="6" cy="5" rx="5" ry="4" fill="#fbd3ad" />
                <path d="M6 2 Q8 -3 11 -2 Q10 2 8 4 Z" fill="#f6c297" />
                <circle cx="4" cy="6" r="2.5" fill="#f6c297" />
              </g>
            </g>
          ) : mood === 'celebrating' ? (
            /* Arm raised high in victory */
            <g>
              <path
                d="M172 170 C182 150 192 125 198 102 C204 105 204 114 198 126 C190 145 180 168 172 175 Z"
                fill="#f6c297"
              />
              {/* Open cheering palm */}
              <g transform="translate(192, 92) rotate(-20)">
                <ellipse cx="6" cy="6" rx="6" ry="5" fill="#fbd3ad" />
                <line x1="4" y1="2" x2="4" y2="-4" stroke="#f6c297" strokeWidth="2" strokeLinecap="round" />
                <line x1="7" y1="2" x2="8" y2="-5" stroke="#f6c297" strokeWidth="2" strokeLinecap="round" />
                <line x1="10" y1="3" x2="12" y2="-4" stroke="#f6c297" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="5" x2="15" y2="0" stroke="#f6c297" strokeWidth="1.8" strokeLinecap="round" />
              </g>
            </g>
          ) : (
            /* Idle: Hand resting gracefully on golden waist sash */
            <g>
              <path
                d="M174 195 C170 210 162 220 152 222 C148 218 152 212 158 206 C165 198 172 192 176 195 Z"
                fill="#f6c297"
              />
              <circle cx="152" cy="220" r="5" fill="#fbd3ad" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
