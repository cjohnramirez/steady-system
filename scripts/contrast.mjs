// WCAG contrast between two OKLCH colours. Used to check brand tokens before
// changing them: node scripts/contrast.mjs "0.56 0.16 52" "1 0 0"
function oklchToLinearSrgb([L, C, h]) {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((v) => Math.min(1, Math.max(0, v)));
}
const luminance = (c) => {
  const [r, g, b] = oklchToLinearSrgb(c);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
const toHex = (c) =>
  "#" +
  oklchToLinearSrgb(c)
    .map((v) => {
      const s = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
      return Math.round(s * 255)
        .toString(16)
        .padStart(2, "0");
    })
    .join("");
const parse = (s) => s.trim().split(/\s+/).map(Number);
if (process.argv[2]) {
  const [a, b = [1, 0, 0]] = process.argv.slice(2).map(parse);
  console.log(toHex(a), toHex(b), contrast(a, b).toFixed(2));
}
