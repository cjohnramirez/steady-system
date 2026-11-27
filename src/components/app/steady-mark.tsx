import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * The official Steady icon mark (Figma 678:15858 / Frame 176):
 * Brand-blue rounded square with white inner shadow and two outlined pills.
 */
export function SteadyMark({ className }: { className?: string }) {
  const uid = useId();
  const filterId = `${uid}-inner`;
  const maskId = `${uid}-stroke`;

  return (
    <svg
      viewBox="0 0 51 51"
      fill="none"
      aria-hidden
      className={cn("size-10 shrink-0", className)}
    >
      <defs>
        <filter
          id={filterId}
          x="0"
          y="0"
          width="55"
          height="55"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="4" dy="4" />
          <feGaussianBlur stdDeviation="4.05" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_steady_mark"
          />
        </filter>
        <mask id={maskId} fill="white">
          <path d="M27.1731 17.3701C27.1731 14.6804 29.3776 12.5 32.0971 12.5C34.8166 12.5 37.0212 14.6804 37.0212 17.3701V33.1299C37.0212 35.8196 34.8166 38 32.0971 38C29.3776 38 27.1731 35.8196 27.1731 33.1299V17.3701Z" />
          <path d="M16.8416 20.9884C17.7118 18.4339 20.5044 17.0508 23.0789 17.8991C25.6534 18.7474 27.035 21.5058 26.1648 24.0602L22.5836 34.5718C21.7134 37.1263 18.9208 38.5094 16.3463 37.6611C13.7718 36.8128 12.3902 34.0544 13.2604 31.5L16.8416 20.9884Z" />
        </mask>
      </defs>
      <g filter={`url(#${filterId})`}>
        <rect width="51" height="51" rx="10" className="fill-primary" />
        <path
          d="M32.0971 38C29.3776 38 27.1731 35.8196 27.1731 33.1299V17.3701C27.1731 14.6804 29.3776 12.5 32.0971 12.5C34.8166 12.5 37.0212 14.6804 37.0212 17.3701V33.1299C37.0212 35.8196 34.8166 38 32.0971 38ZM16.3463 37.6611C13.7718 36.8128 12.3902 34.0544 13.2604 31.5L16.8416 20.9884C17.7118 18.4339 20.5044 17.0508 23.0789 17.8991C25.6534 18.7474 27.035 21.5058 26.1648 24.0602L22.5836 34.5718C21.7134 37.1263 18.9208 38.5094 16.3463 37.6611Z"
          strokeWidth="4"
          stroke="white"
          mask={`url(#${maskId})`}
        />
      </g>
    </svg>
  );
}
