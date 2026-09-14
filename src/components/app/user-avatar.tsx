import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * Circle size and initials size per avatar size. The text size has to sit on the
 * fallback itself: AvatarFallback sets its own text-sm, which overrode a size set
 * on the root, so every avatar showed 14px initials and the 24px nav avatar
 * overflowed.
 */
const SIZES = {
  xs: { box: "size-6", text: "text-[9px]" },
  sm: { box: "size-10", text: "text-xs" },
  md: { box: "size-20", text: "text-base" },
  lg: { box: "size-28 md:size-36", text: "text-xl" },
} as const;

/**
 * A person's photo, or their initials on the brand gradient when there is none.
 *
 * The gradient circle is the site's signature placeholder and appeared as thirteen
 * separate hand-written divs, none of which could show an actual photo.
 */
export function UserAvatar({
  src,
  name,
  size = "sm",
  className,
}: {
  src?: string | null;
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <Avatar className={cn(SIZES[size].box, className)}>
      {src ? <AvatarImage src={src} alt="" className="object-cover" /> : null}
      <AvatarFallback
        className={cn(
          "from-brand-light to-brand text-brand-foreground bg-linear-to-t font-medium tracking-wide",
          SIZES[size].text,
        )}
        aria-label={name}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
