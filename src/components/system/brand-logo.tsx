import Image from "next/image";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { img: 36, text: "text-lg" },
  md: { img: 44, text: "text-2xl" },
  lg: { img: 52, text: "text-3xl" },
} as const;

type Props = {
  size?: keyof typeof SIZES;
  showText?: boolean;
  className?: string;
};

export function BrandLogo({ size = "md", showText = true, className }: Props) {
  const { img, text } = SIZES[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/brand/logo.png"
        alt="GestãoSimples"
        width={img}
        height={img}
        className="shrink-0 rounded-lg"
        priority
      />
      {showText && (
        <span className={cn("font-bold text-foreground", text)}>
          Gestão<span className="font-normal">Simples</span>
        </span>
      )}
    </div>
  );
}
