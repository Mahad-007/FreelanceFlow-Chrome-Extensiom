import React from "react";

const paths: Record<string, string> = {
  sun: "M8 1.5v1.25m0 10.5v1.25M1.5 8h1.25m10.5 0h1.25M3.4 3.4l.88.88m7.44 7.44l.88.88M3.4 12.6l.88-.88m7.44-7.44l.88-.88M11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
  moon: "M13.36 10.18A6 6 0 0 1 5.82 2.64a6 6 0 1 0 7.54 7.54z",
  settings: "M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm5.66-1.34l.94.54a.5.5 0 0 1 .18.68l-1 1.74a.5.5 0 0 1-.68.18l-.94-.54a4.47 4.47 0 0 1-1.16.67v1.07a.5.5 0 0 1-.5.5H5.5a.5.5 0 0 1-.5-.5v-1.07a4.47 4.47 0 0 1-1.16-.67l-.94.54a.5.5 0 0 1-.68-.18l-1-1.74a.5.5 0 0 1 .18-.68l.94-.54A4.5 4.5 0 0 1 2.5 8c0-.23.02-.45.06-.66l-.96-.56a.5.5 0 0 1-.18-.68l1-1.74a.5.5 0 0 1 .68-.18l.94.54c.34-.28.73-.5 1.16-.67V2.98a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1.07c.43.17.82.39 1.16.67l.94-.54a.5.5 0 0 1 .68.18l1 1.74a.5.5 0 0 1-.18.68l-.94.54c.04.22.06.44.06.66s-.02.45-.06.66z",
  copy: "M5.5 2.5h6.5a1 1 0 0 1 1 1v6.5m-3-7.5h-6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1z",
  check: "M3.5 8.5l3 3 6-7",
  chevronDown: "M4.5 6.5l3.5 3 3.5-3",
  chevronUp: "M4.5 9.5l3.5-3 3.5 3",
  close: "M4.5 4.5l7 7m-7 0l7-7",
  search: "M11 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zm-.5 3.5l3 3",
  refresh: "M2.5 8a5.5 5.5 0 0 1 9.68-3.57M13.5 8a5.5 5.5 0 0 1-9.68 3.57M12.18 2.5v2h-2M3.82 13.5v-2h2",
  fileText: "M4.5 2h5l3 3v8.5a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm4.5 0v3h3M6 8h4M6 10.5h4M6 6h1.5",
  zap: "M8.5 1.5L4 9h4l-.5 5.5L12 7H8l.5-5.5z",
  clipboard: "M5.5 3h-1a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-1M6.5 2h3a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5z",
  sparkle: "M8 2v2m0 8v2M2 8h2m8 0h2M4.1 4.1l1.4 1.4m5 5l1.4 1.4M4.1 11.9l1.4-1.4m5-5l1.4-1.4",
  star: "M8 2l1.76 3.57 3.94.57-2.85 2.78.67 3.93L8 10.9l-3.52 1.85.67-3.93L2.3 6.14l3.94-.57L8 2z",
  clock: "M8 4v4l2.5 1.5M14 8a6 6 0 1 1-12 0 6 6 0 0 1 12 0z",
  globe: "M14 8a6 6 0 1 1-12 0 6 6 0 0 1 12 0zM2.5 8h11M8 2a9 9 0 0 1 2.83 6A9 9 0 0 1 8 14a9 9 0 0 1-2.83-6A9 9 0 0 1 8 2z",
};

interface IconProps {
  name: string;
  className?: string;
}

export default function Icon({ name, className = "w-4 h-4" }: IconProps) {
  const d = paths[name];
  if (!d) return null;
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}
