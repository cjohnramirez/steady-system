/**
 * The product's name and the Lean mark (a smaller form tipped against a taller
 * one). The office running the system keeps its own name in the organization
 * table; this brands the software.
 */
export const BRAND = {
  name: "Steady",
  tagline: "Student guidance and counseling",
  description:
    "Book a counselor, check in on how you feel, and find articles, events and playlists picked for you.",
} as const;

/**
 * Hex copies of the brand tokens in globals.css (--brand, --brand-light), for
 * generated images such as the favicon and social card, which can't read CSS.
 */
export const BRAND_HEX = {
  brand: "#aa5f04",
  brandLight: "#ffc878",
  background: "#fafafa",
  foreground: "#0a0a0a",
  muted: "#737373",
} as const;

/** The Lean mark's shapes on a 40-unit grid, shared by the React mark and generated images. */
export const MARK_SHAPES = {
  back: {
    x: 9,
    y: 13,
    width: 9,
    height: 21,
    rx: 4.5,
    rotate: "rotate(12 13.5 34)",
  },
  front: { x: 19.5, y: 6, width: 9, height: 28, rx: 4.5 },
} as const;

/** The mark as a standalone SVG string, for <img> data URIs in generated images. */
export function markSvg({
  front,
  back,
  tile,
}: {
  front: string;
  back: string;
  tile?: string;
}) {
  const { back: b, front: f } = MARK_SHAPES;
  const shapes = `<rect x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" rx="${b.rx}" transform="${b.rotate}" fill="${back}"/><rect x="${f.x}" y="${f.y}" width="${f.width}" height="${f.height}" rx="${f.rx}" fill="${front}"/>`;
  const body = tile
    ? `<rect width="40" height="40" fill="${tile}"/><g transform="translate(5.6 5.6) scale(0.72)">${shapes}</g>`
    : shapes;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">${body}</svg>`;
}

export function svgDataUri(svg: string) {
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
