// Turns a name into a URL-friendly slug: "Black Women's Gown" -> "black-womens-gown"
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/'/g, '') // women's -> womens
    .replace(/[^\p{L}\p{N}]+/gu, '-') // any run of non letters/digits becomes one hyphen
    .replace(/^-+|-+$/g, ''); // trim hyphens from both ends
}

// Adds -2, -3, ... until the slug is free, like WordPress does
export async function makeUniqueSlug(
  base: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  let candidate = base;
  let counter = 2;
  while (await isTaken(candidate)) {
    candidate = `${base}-${counter}`;
    counter++;
  }
  return candidate;
}