// Cores alinhadas aos tokens em globals.css.
// Recharts exige valores concretos (nao aceita classes Tailwind / CSS vars
// em todas as props), por isso centralizamos os hex aqui.
export const chartColors = {
  primary: "#16a34a",
  primaryHover: "#15803d",
  danger: "#dc2626",
  warning: "#d97706",
  info: "#2563eb",
  border: "#e5e7eb",
  muted: "#64748b",
  empty: "#e5e7eb",
  success: "#16a34a",
} as const;

export const donutPalette = [
  chartColors.primary,
  chartColors.info,
  "#8b5cf6",
  chartColors.warning,
  "#ec4899",
  "#0ea5e9",
] as const;

export const tooltipStyle = {
  borderRadius: 8,
  border: `1px solid ${chartColors.border}`,
  fontSize: 12,
  boxShadow: "0 4px 16px -4px rgb(15 23 42 / 0.12)",
} as const;

export const axisTick = { fontSize: 11, fill: chartColors.muted } as const;
