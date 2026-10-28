// Small display helpers shared by list views.

// Up to two initials from a title or name, e.g. "Clean Code" -> "CC".
export function initials(text: string): string {
  return text
    .split(/\s+/)
    .filter((w) => /[a-z0-9]/i.test(w))
    .slice(0, 2)
    .map((w) => w.replace(/[^a-z0-9]/gi, '')[0] ?? '')
    .join('')
    .toUpperCase();
}

// Stable hue derived from a string, used to tint avatars.
// Kept within teal → blue (170–225) so tints stay on-brand and never drift into purple.
export function hue(text: string): number {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return 170 + (h % 56);
}
