const paths = {
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.2V12l3.2 2.2" />
    </>
  ),
  gear: (
    <>
      <path d="M4 7.5h7" />
      <path d="M15.5 7.5H20" />
      <path d="M4 16.5h4.5" />
      <path d="M13.5 16.5H20" />
      <circle cx="13" cy="7.5" r="2.4" />
      <circle cx="10.5" cy="16.5" r="2.4" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="14.5" r="3.8" />
      <path d="M10.8 11.8 19 3.6" />
      <path d="M15.6 7l2.6 2.6" />
      <path d="M17.8 4.8l2.6 2.6" />
    </>
  ),
  check: <path d="M5 12.8l4.5 4.4L19 7.5" />,
  close: (
    <>
      <path d="M6.5 6.5l11 11" />
      <path d="M17.5 6.5l-11 11" />
    </>
  ),
  left: <path d="M14.5 5.5 8 12l6.5 6.5" />,
  right: <path d="M9.5 5.5 16 12l-6.5 6.5" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M15 6.2A2.2 2.2 0 0 0 12.8 4H6.2A2.2 2.2 0 0 0 4 6.2v6.6A2.2 2.2 0 0 0 6.2 15" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5.5" width="17" height="15" rx="3" />
      <path d="M3.5 10h17" />
      <path d="M8 3.5v4" />
      <path d="M16 3.5v4" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M4 4l16 16" />
      <path d="M9.6 6.3A9.6 9.6 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3 3.6" />
      <path d="M6.4 8.4A16.6 16.6 0 0 0 2.5 12S6 18 12 18a9.7 9.7 0 0 0 3.3-.6" />
      <path d="M9.9 10.1a3 3 0 0 0 4.2 4.2" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4.5 21 19.5H3z" />
      <path d="M12 10v4" />
      <path d="M12 16.8v.2" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.4-5.7" />
      <path d="M20 4v4.5h-4.5" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 4.5l1.7 4.3 4.3 1.7-4.3 1.7L12 16.5l-1.7-4.3L6 10.5l4.3-1.7z" />
      <path d="M18.5 16.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.8 20a7.4 7.4 0 0 1 14.4 0" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.4 2.4 3.6 5.3 3.6 8.5s-1.2 6.1-3.6 8.5c-2.4-2.4-3.6-5.3-3.6-8.5S9.6 5.9 12 3.5Z" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M4.5 12h15" />
      <path d="M13.5 6l6 6-6 6" />
    </>
  ),
  bolt: <path d="M13 3 5.5 13.5H12L11 21l7.5-10.5H12z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.8v2.2" />
      <path d="M12 19v2.2" />
      <path d="M2.8 12H5" />
      <path d="M19 12h2.2" />
      <path d="m5.5 5.5 1.6 1.6" />
      <path d="m16.9 16.9 1.6 1.6" />
      <path d="M18.5 5.5 16.9 7.1" />
      <path d="M7.1 16.9 5.5 18.5" />
    </>
  ),
  moon: <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4 8.5 8.5 0 1 0 20 14.2Z" />,
  inbox: (
    <>
      <path d="M3.5 13.5h4l1.5 3h6l1.5-3h4" />
      <path d="M5.5 5.5h13l2 8v5a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-5z" />
    </>
  ),
}

export default function Icon({ name, size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}
