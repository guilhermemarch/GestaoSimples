import Image from "next/image";
import { cn } from "@/lib/utils";

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-green-100 text-green-700",
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
];

export function getAvatarColor(name: string): string {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function UserAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sizeClass = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-lg" }[size];
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${sizeClass} ${getAvatarColor(name)}`}
    >
      {getInitials(name)}
    </div>
  );
}

export const PRODUCT_PLACEHOLDER_COLORS = [
  "#E8F5EE",
  "#FEF3C7",
  "#DBEAFE",
  "#F3E8FF",
  "#FCE7F3",
];

type ProductThumbnailProps = {
  name: string;
  index?: number;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: { box: "h-8 w-8", text: "text-sm", img: 32 },
  md: { box: "h-10 w-10", text: "text-lg", img: 40 },
  lg: { box: "h-16 w-16", text: "text-2xl", img: 64 },
};

export function ProductThumbnail({
  name,
  index = 0,
  imageUrl,
  size = "md",
  className,
}: ProductThumbnailProps) {
  const bg = PRODUCT_PLACEHOLDER_COLORS[index % PRODUCT_PLACEHOLDER_COLORS.length];
  const s = sizeMap[size];

  if (imageUrl) {
    return (
      <div className={cn("relative shrink-0 overflow-hidden rounded-lg bg-muted", s.box, className)}>
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes={`${s.img}px`}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg font-medium",
        s.box,
        s.text,
        className,
      )}
      style={{ backgroundColor: bg }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
