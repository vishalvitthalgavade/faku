'use client';

const paths = {
  home: <><path d="M3 10.8 12 3l9 7.8"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9 21v-6h6v6"/></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  help: <><circle cx="12" cy="12" r="9.5"/><path d="M9.8 9a2.5 2.5 0 0 1 4.8 1c0 1.8-2.6 2-2.6 4"/><path d="M12 17.5h.01"/></>,
  qr: <><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z"/><path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z"/></>,
  arrowLeft: <path d="m15 18-6-6 6-6"/>,
  arrowRight: <path d="m9 18 6-6-6-6"/>,
  more: <><circle cx="12" cy="5" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1" fill="currentColor" stroke="none"/></>,
  send: <><path d="m4 4 16 8-16 8 3.5-8z"/><path d="M7.5 12H20"/></>,
  download: <><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></>,
  copy: <><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M5 16H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  camera: <><path d="M4 7h3l1.5-2h7L17 7h3v11H4z"/><circle cx="12" cy="12.5" r="3.2"/></>,
  upload: <><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/></>,
  refresh: <><path d="M20 11a8 8 0 0 0-14-4L4 9"/><path d="M4 4v5h5"/><path d="M4 13a8 8 0 0 0 14 4l2-2"/><path d="M20 20v-5h-5"/></>,
  flash: <path d="m13 2-8 11h6l-1 9 8-12h-6z"/>,
  filter: <><path d="M4 7h16M7 12h10M10 17h4"/><circle cx="8" cy="7" r="1.5"/><circle cx="14" cy="12" r="1.5"/><circle cx="12" cy="17" r="1.5"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  x: <><path d="m6 6 12 12M18 6 6 18"/></>,
  shield: <path d="M12 3 20 6v6c0 5-3.3 8-8 9-4.7-1-8-4-8-9V6z"/>,
};

export function Icon({ name, size = 24, strokeWidth = 2, className = '' }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.more}</svg>;
}
