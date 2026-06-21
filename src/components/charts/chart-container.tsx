"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  /** classes de altura responsiva (default: h-[var(--chart-h-sm)] sm:h-[var(--chart-h)]) */
  heightClassName?: string;
  className?: string;
  children: (dims: { width: number; height: number }) => React.ReactNode;
};

/**
 * Container estavel para graficos Recharts.
 *
 * So renderiza o filho (ResponsiveContainer) quando o container ja tem
 * largura/altura positivas, evitando o warning `width(-1) and height(-1)`.
 * Usa ResizeObserver para reagir a mudancas de layout (ex: troca de Tab).
 */
export function ChartContainer({
  heightClassName = "h-[var(--chart-h-sm)] sm:h-[var(--chart-h)]",
  className,
  children,
}: Props) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [dims, setDims] = React.useState<{ width: number; height: number } | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDims((prev) => {
          if (prev && prev.width === rect.width && prev.height === rect.height) return prev;
          return { width: rect.width, height: rect.height };
        });
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn("relative w-full min-w-0", heightClassName, className)}>
      <div className="absolute inset-0">{dims ? children(dims) : null}</div>
    </div>
  );
}
