import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const SIZES = {
  xs: "size-6 text-[10px]",
  sm: "size-10 text-sm",
  md: "size-20 text-xl",
  lg: "size-28 text-3xl md:size-36",
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
    <Avatar className={cn(SIZES[size], className)}>
      {src ? <AvatarImage src={src} alt="" className="object-cover" /> : null}
      <AvatarFallback
        className="from-brand-light to-brand text-brand-foreground bg-linear-to-t font-medium"
        aria-label={name}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
