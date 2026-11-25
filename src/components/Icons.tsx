import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

function I({ children, ...p }: P & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
      {children}
    </svg>
  )
}

export const IconHome = (p: P) => (
  <I {...p}>
    <path d="M3.5 10.5 12 3.5l8.5 7" />
    <path d="M5.5 9v10.5h4.5V14h4v5.5h4.5V9" />
  </I>
)
export const IconPath = (p: P) => (
  <I {...p}>
    <circle cx="6" cy="18" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5" />
  </I>
)
export const IconGame = (p: P) => (
  <I {...p}>
    <path d="M7 7h10a5 5 0 0 1 4.9 6l-.6 3a2.6 2.6 0 0 1-4.5 1.2L15 15H9l-1.8 2.2a2.6 2.6 0 0 1-4.5-1.2l-.6-3A5 5 0 0 1 7 7Z" />
    <path d="M8 10v3M6.5 11.5h3" />
    <circle cx="15.5" cy="10.5" r=".6" fill="currentColor" />
    <circle cx="17.5" cy="12.5" r=".6" fill="currentColor" />
  </I>
)
export const IconGrid = (p: P) => (
  <I {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
  </I>
)
export const IconUser = (p: P) => (
  <I {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20.5c1.2-3.8 4.3-5.5 8-5.5s6.8 1.7 8 5.5" />
  </I>
)
export const IconClose = (p: P) => (
  <I {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </I>
)
export const IconBack = (p: P) => (
  <I {...p}>
    <path d="M15 5l-7 7 7 7" />
  </I>
)
export const IconChevron = (p: P) => (
  <I {...p}>
    <path d="M9 5l7 7-7 7" />
  </I>
)
export const IconGear = (p: P) => (
  <I {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </I>
)
export const IconSpeaker = (p: P) => (
  <I {...p}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
    <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
  </I>
)
export const IconReplay = (p: P) => (
  <I {...p}>
    <path d="M4 12a8 8 0 1 0 2.4-5.7" />
    <path d="M4 4v4.5h4.5" />
  </I>
)
export const IconBulb = (p: P) => (
  <I {...p}>
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2h5c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3Z" />
  </I>
)
export const IconCheck = (p: P) => (
  <I {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </I>
)
export const IconFlame = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path
      d="M12.6 2.2c.4 2.6-.6 4.3-2 5.9-1.5 1.6-3.6 3.4-3.6 6.6a5 5 0 0 0 10 0c0-2-.8-3.5-1.7-4.6.1 1.4-.4 2.5-1.3 3 .4-3.2-.4-7.6-1.4-10.9Z"
      fill="currentColor"
    />
    <path d="M12 21a2.8 2.8 0 0 1-2.8-2.8c0-1.6 1.2-2.6 2.1-3.6.2 1 .7 1.7 1.6 2.1.3-.6.5-1.3.4-2 1 .9 1.5 2.1 1.5 3.3A2.8 2.8 0 0 1 12 21Z" fill="#ffe08a" />
  </svg>
)
export const IconStar = (p: P & { filled?: boolean }) => {
  const { filled = true, ...rest } = p
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...rest}>
      <path
        d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9L12 2.8Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}
export const IconSnow = (p: P) => (
  <I {...p}>
    <path d="M12 2.5v19M4 7l16 10M20 7 4 17" />
    <path d="M9.5 4 12 6l2.5-2M9.5 20l2.5-2 2.5 2" />
  </I>
)
export const IconTrophy = (p: P) => (
  <I {...p}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
    <path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v3M8.5 20.5h7M9.5 17.5h5v3h-5z" />
  </I>
)
export const IconPencil = (p: P) => (
  <I {...p}>
    <path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5z" />
    <path d="M13.5 7l3 3" />
  </I>
)
export const IconPlay = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.2-6.5a1 1 0 0 0 0-1.7L9.5 4.6A1 1 0 0 0 8 5.5Z" fill="currentColor" />
  </svg>
)
export const IconLock = (p: P) => (
  <I {...p}>
    <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
  </I>
)
export const IconInfo = (p: P) => (
  <I {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5M12 7.6v.1" />
  </I>
)
export const IconDownload = (p: P) => (
  <I {...p}>
    <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14" />
  </I>
)
export const IconUpload = (p: P) => (
  <I {...p}>
    <path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 19.5h14" />
  </I>
)
export const IconTrash = (p: P) => (
  <I {...p}>
    <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" />
  </I>
)
export const IconEye = (p: P) => (
  <I {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </I>
)
export const IconBolt = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path d="M13.5 2 4.5 13.5H11L9.5 22l9-11.5H12L13.5 2Z" fill="currentColor" />
  </svg>
)
export const IconCards = (p: P) => (
  <I {...p}>
    <rect x="3" y="6" width="11" height="14" rx="2.5" transform="rotate(-8 8.5 13)" />
    <rect x="10" y="4" width="11" height="14" rx="2.5" transform="rotate(8 15.5 11)" />
  </I>
)
export const IconDrop = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path d="M12 2.5c1 2.5 7 8.3 7 12.5a7 7 0 0 1-14 0c0-4.2 6-10 7-12.5Z" fill="currentColor" />
  </svg>
)
export const IconRefresh = (p: P) => (
  <I {...p}>
    <path d="M20 11a8 8 0 0 0-14.6-4.5M4 13a8 8 0 0 0 14.6 4.5" />
    <path d="M5 3v4h4M19 21v-4h-4" />
  </I>
)
export const IconSun = (p: P) => (
  <I {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
  </I>
)
export const IconMoon = (p: P) => (
  <I {...p}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
  </I>
)
