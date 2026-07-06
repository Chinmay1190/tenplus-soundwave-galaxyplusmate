// Brand logos with multi-source fallback:
//  1. Clearbit Logo API — high quality, no key, works for real company domains.
//  2. simple-icons CDN  — clean SVG marks for popular tech brands.
//  3. Google favicon    — last-resort raster.
//  4. SVG letter avatar — inline data-URI, never 404s.
//
// The consumer (<img onError>) walks the list, so every brand renders
// something recognisable.

const DOMAINS: Record<string, string> = {
  Apple: "apple.com",
  Sony: "sony.com",
  Bose: "bose.com",
  Sennheiser: "sennheiser.com",
  JBL: "jbl.com",
  Beats: "beatsbydre.com",
  Nothing: "nothing.tech",
  Samsung: "samsung.com",
  OnePlus: "oneplus.com",
  Realme: "realme.com",
  Jabra: "jabra.com",
  Skullcandy: "skullcandy.com",
  Soundcore: "soundcore.com",
  Marshall: "marshallheadphones.com",
  Audeze: "audeze.com",
  Shure: "shure.com",
  AKG: "akg.com",
  HyperX: "hyperx.com",
  Razer: "razer.com",
  Logitech: "logitech.com",
  Bang: "bang-olufsen.com",
  "Bang & Olufsen": "bang-olufsen.com",
  Boat: "boat-lifestyle.com",
  Xiaomi: "mi.com",
  Huawei: "huawei.com",
  Google: "google.com",
};

const SI_SLUGS: Record<string, string> = {
  Apple: "apple",
  Sony: "sony",
  Bose: "bose",
  Sennheiser: "sennheiser",
  JBL: "jbl",
  Beats: "beats",
  Nothing: "nothing",
  Samsung: "samsung",
  OnePlus: "oneplus",
  Razer: "razer",
  Logitech: "logitech",
  HyperX: "hyperx",
  Xiaomi: "xiaomi",
  Huawei: "huawei",
  Google: "google",
  Marshall: "marshall",
};

function letterAvatar(brand: string, tint = "#111"): string {
  const letter = (brand || "?").charAt(0).toUpperCase();
  const safeTint = tint.replace("#", "%23");
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'>` +
    `<rect width='40' height='40' rx='10' fill='${safeTint}'/>` +
    `<text x='50%25' y='55%25' text-anchor='middle' dominant-baseline='middle' ` +
    `font-family='Inter,sans-serif' font-size='20' font-weight='800' fill='%23fff'>` +
    `${letter}</text></svg>`;
  return `data:image/svg+xml;utf8,${svg}`;
}

/** Primary logo URL (Clearbit when we know the domain, else simple-icons, else avatar). */
export function brandLogo(brand: string, size = 128): string {
  const domain = DOMAINS[brand];
  if (domain) return `https://logo.clearbit.com/${domain}?size=${size}`;
  const slug = SI_SLUGS[brand];
  if (slug) return `https://cdn.simpleicons.org/${slug}`;
  return letterAvatar(brand);
}

/** Ordered fallback chain for use with <img onError>. */
export function brandLogoSources(brand: string, size = 128): string[] {
  const list: string[] = [];
  const domain = DOMAINS[brand];
  if (domain) {
    list.push(`https://logo.clearbit.com/${domain}?size=${size}`);
    list.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`);
  }
  const slug = SI_SLUGS[brand];
  if (slug) list.push(`https://cdn.simpleicons.org/${slug}`);
  list.push(letterAvatar(brand));
  return list;
}

export function brandSlug(brand: string): string | undefined {
  return SI_SLUGS[brand];
}