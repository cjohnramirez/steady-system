import Link from "next/link";
import { ArrowUpRight, BookOpen, Megaphone, Music } from "lucide-react";
import { IconBadge } from "@/components/app/icon-badge";

const LINKS = [
  {
    href: "/portal#articles",
    label: "Articles",
    hint: "Picked for your mood",
    icon: BookOpen,
  },
  {
    href: "/portal#announcements",
    label: "Announcements",
    hint: "Events and programs",
    icon: Megaphone,
  },
  {
    href: "/portal#playlists",
    label: "Playlists",
    hint: "Music to match the moment",
    icon: Music,
  },
];

export default function QuickLinks() {
  return (
    <nav
      aria-label="Resources"
      className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1"
    >
      {LINKS.map(({ href, label, hint, icon }) => (
        <Link
          key={href}
          href={href}
          className="bg-card hover:bg-muted/60 focus-visible:ring-ring/50 group flex items-center gap-4 rounded-2xl border p-4 transition-colors outline-none focus-visible:ring-[3px]"
        >
          <IconBadge icon={icon} />
          <span className="min-w-0 flex-1">
            <span className="block font-medium">{label}</span>
            <span className="text-muted-foreground block truncate">{hint}</span>
          </span>
          <ArrowUpRight
            aria-hidden
            strokeWidth={1.25}
            className="text-muted-foreground group-hover:text-foreground size-5 shrink-0 transition-colors"
          />
        </Link>
      ))}
    </nav>
  );
}
