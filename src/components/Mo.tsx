import { useId } from 'react'

export type MoMood = 'idle' | 'happy' | 'cheer' | 'think' | 'sad' | 'surprised' | 'sleep' | 'love' | 'wink'

interface Props {
  mood?: MoMood
  size?: number
  className?: string
  /** Winken (Begrüßung) */
  wave?: boolean
  /** Atmen & Blinzeln abschalten */
  still?: boolean
  title?: string
}

/** Mo – der kleine Tintentropfen. */
export function Mo({ mood = 'idle', size = 120, className = '', wave = false, still = false, title }: Props) {
  const uid = useId().replace(/:/g, '')
  const g = `mo-g-${uid}`
  const sh = `mo-s-${uid}`
  const showArms = wave || mood === 'cheer'
  const closedEyes = mood === 'happy' || mood === 'cheer' || mood === 'sleep'
  return (
    <svg
      className={`mo ${still ? '' : 'mo-alive'} mo-${mood} ${className}`}
      width={size}
      height={size * (130 / 120)}
      viewBox="0 0 120 130"
      role="img"
      aria-label={title ?? 'Mo, der Tintentropfen'}
    >
      <defs>
        <radialGradient id={g} cx="0.35" cy="0.45" r="0.75">
          <stop offset="0" stopColor="var(--mo-light)" />
          <stop offset="0.55" stopColor="var(--mo-mid)" />
          <stop offset="1" stopColor="var(--mo-dark)" />
        </radialGradient>
        <radialGradient id={sh} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.22" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse className="mo-shadow" cx="60" cy="125" rx="34" ry="4.5" fill={`url(#${sh})`} />
      <g className="mo-bounce">
        {showArms && (
          <g className="mo-arms" fill={`url(#${g})`}>
            <g transform="rotate(-35 17 78)">
              <ellipse className={wave ? 'mo-arm-wave' : 'mo-arm-l'} cx="17" cy="78" rx="6" ry="12" />
            </g>
            <g transform="rotate(35 103 78)">
              <ellipse className="mo-arm-r" cx="103" cy="78" rx="6" ry="12" />
            </g>
          </g>
        )}
        <g className="mo-body">
          <path
            d="M60 4 C 65 20, 104 50, 104 82 C 104 107, 85 124, 60 124 C 35 124, 16 107, 16 82 C 16 50, 55 20, 60 4 Z"
            fill={`url(#${g})`}
          />
          {/* Glanzlichter */}
          <ellipse cx="39" cy="62" rx="6" ry="12" transform="rotate(28 39 62)" fill="#fff" opacity="0.32" />
          <circle cx="45" cy="45" r="3" fill="#fff" opacity="0.4" />
          {/* Bäckchen */}
          <ellipse cx="33" cy="101" rx="7.5" ry="4.2" fill="var(--mo-cheek)" opacity={mood === 'love' ? 0.9 : 0.6} />
          <ellipse cx="87" cy="101" rx="7.5" ry="4.2" fill="var(--mo-cheek)" opacity={mood === 'love' ? 0.9 : 0.6} />
          {/* Augen */}
          <g className={closedEyes || mood === 'wink' ? '' : 'mo-eyes'}>
            {closedEyes ? (
              mood === 'sleep' ? (
                <g stroke="#f3eefe" strokeWidth="3" strokeLinecap="round" fill="none">
                  <path d="M37 88 Q45 93 53 88" />
                  <path d="M67 88 Q75 93 83 88" />
                </g>
              ) : (
                <g stroke="#f3eefe" strokeWidth="3.4" strokeLinecap="round" fill="none">
                  <path d="M37 89 Q45 80 53 89" />
                  <path d="M67 89 Q75 80 83 89" />
                </g>
              )
            ) : (
              <>
                <Eye cx={45} cy={86} mood={mood} />
                {mood === 'wink' ? (
                  <path d="M67 88 Q75 80 83 88" stroke="#f3eefe" strokeWidth="3.4" strokeLinecap="round" fill="none" />
                ) : (
                  <Eye cx={75} cy={86} mood={mood} />
                )}
              </>
            )}
          </g>
          {/* Augenbrauen bei Sorgen/Nachdenken */}
          {mood === 'sad' && (
            <g stroke="#f3eefe" strokeWidth="2.4" strokeLinecap="round" opacity="0.85">
              <path d="M36 73 L50 70" />
              <path d="M84 73 L70 70" />
            </g>
          )}
          {mood === 'think' && <path d="M67 70 Q75 65 83 70" stroke="#f3eefe" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.85" />}
          <Mouth mood={mood} />
          {mood === 'sad' && <path d="M93 60 C 96 66, 99 69, 96 72 C 93 74, 90 71, 93 60 Z" fill="var(--mo-sweat)" opacity="0.9" />}
        </g>
      </g>
      {mood === 'sleep' && (
        <g className="mo-zzz" fill="var(--ink-soft)" fontFamily="var(--font-ui)" fontWeight="800">
          <text x="92" y="36" fontSize="14">z</text>
          <text x="102" y="22" fontSize="10">z</text>
        </g>
      )}
      {mood === 'love' && (
        <g className="mo-hearts" fill="var(--sakura)">
          <path d="M98 30 c -3 -5 -10 -2 -7 4 l 7 7 l 7 -7 c 3 -6 -4 -9 -7 -4 z" />
        </g>
      )}
    </svg>
  )
}

function Eye({ cx, cy, mood }: { cx: number; cy: number; mood: MoMood }) {
  const big = mood === 'surprised'
  const ry = big ? 12 : 10.5
  const rx = big ? 10 : 9
  let px = 0
  let py = 1
  if (mood === 'think') {
    px = 2.5
    py = -3.5
  } else if (mood === 'sad') {
    py = 3
  }
  const pr = big ? 4.6 : 6.2
  if (mood === 'love') {
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff" />
        <path
          d={`M${cx} ${cy + 5} l -6 -6 c -3 -4 2 -9 6 -4 c 4 -5 9 0 6 4 z`}
          fill="var(--hanko)"
        />
      </g>
    )
  }
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff" />
      <circle className="mo-pupil" cx={cx + px} cy={cy + py} r={pr} fill="#0e0f26" />
      <circle cx={cx + px + 2.4} cy={cy + py - 2.8} r={2.3} fill="#fff" />
      <circle cx={cx + px - 2} cy={cy + py + 2.4} r={1.1} fill="#fff" opacity="0.85" />
    </g>
  )
}

function Mouth({ mood }: { mood: MoMood }) {
  const s = { stroke: '#f3eefe', strokeWidth: 2.8, strokeLinecap: 'round' as const, fill: 'none' }
  switch (mood) {
    case 'happy':
    case 'love':
    case 'wink':
      return (
        <g>
          <path d="M51 99 Q60 99 69 99 Q68 110 60 110 Q52 110 51 99 Z" fill="#3a0f25" stroke="#f3eefe" strokeWidth="2" strokeLinejoin="round" />
          <path d="M54.5 106 Q60 102.5 65.5 106 Q63 109.5 60 109.5 Q57 109.5 54.5 106 Z" fill="var(--mo-tongue)" />
        </g>
      )
    case 'cheer':
      return (
        <g>
          <path d="M48 98 Q60 98 72 98 Q71 114 60 114 Q49 114 48 98 Z" fill="#3a0f25" stroke="#f3eefe" strokeWidth="2" strokeLinejoin="round" />
          <path d="M52 108 Q60 103 68 108 Q65 113 60 113 Q55 113 52 108 Z" fill="var(--mo-tongue)" />
        </g>
      )
    case 'surprised':
      return <ellipse cx="60" cy="105" rx="5" ry="6" fill="#3a0f25" stroke="#f3eefe" strokeWidth="2" />
    case 'think':
      return <ellipse cx="64" cy="104" rx="3.2" ry="3" fill="#3a0f25" stroke="#f3eefe" strokeWidth="1.8" />
    case 'sad':
      return <path d="M52 106 Q60 100 68 106" {...s} />
    case 'sleep':
      return <ellipse cx="60" cy="104" rx="3" ry="2.4" fill="#3a0f25" stroke="#f3eefe" strokeWidth="1.6" />
    default:
      return <path d="M52 101 Q60 108 68 101" {...s} />
  }
}
