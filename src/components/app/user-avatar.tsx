import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SteadyMascot } from "@/components/app/steady-mascot";
import { cn } from "@/lib/utils";

const SIZES = {
  xs: { box: "size-6" },
  sm: { box: "size-10" },
  md: { box: "size-20" },
  lg: { box: "size-28 md:size-36" },
} as const;

/**
 * A person's photo, or the animated Steady Brand Mascot in brand blue by default
 * (matching Figma 678:17585).
 */
export function UserAvatar({
  src,
  name,
  size = "sm",
  tone = "blue",
  className,
}: {
  src?: string | null;
  name: string;
  size?: keyof typeof SIZES;
  tone?: "blue" | "emerald";
  className?: string;
}) {
  return (
    <Avatar className={cn(SIZES[size].box, "overflow-hidden", className)}>
      {src ? (
        <AvatarImage src={src} alt={name} className="object-cover" />
      ) : null}
      <AvatarFallback className="p-0" aria-label={name}>
        <SteadyMascot tone={tone} aria-label={name} />
      </AvatarFallback>
    </Avatar>
  );
}
