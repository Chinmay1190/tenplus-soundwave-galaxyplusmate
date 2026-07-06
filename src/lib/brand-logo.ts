// Brand logos with layered fallback so a mark ALWAYS renders:
//   1. Explicit override URL     — hand-picked, highest quality (Wikipedia SVG etc.).
//   2. simple-icons CDN          — clean monochrome SVG marks, extremely reliable.
//   3. Clearbit logo API         — colour marks for real company domains.
//   4. Google favicon            — last-resort raster.
//   5. Inline SVG letter avatar  — never 404s.
//
// The consumer (<img onError>) walks the list, so every brand renders
// something recognisable — and callers can also pass a direct `url` prop
// to bypass the chain entirely.

/** Hand-curated override URLs. Add any URL here (or pass one via <BrandImage url="…" />). */
const OVERRIDES: Record<string, string> = {
  Apple: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
  Sony: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg",
  Bose: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Bose_logo.svg",
  Sennheiser: "https://upload.wikimedia.org/wikipedia/commons/7/78/Sennheiser_logo.svg",
  JBL: "https://upload.wikimedia.org/wikipedia/commons/5/5a/JBL_logo.svg",
  Beats: "https://upload.wikimedia.org/wikipedia/commons/4/44/Beats_Electronics_logo.svg",
  Nothing: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Nothing_Logo.svg",
  Samsung: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
  OnePlus: "https://upload.wikimedia.org/wikipedia/commons/9/91/OnePlus_logo.svg",
  Marshall: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Marshall_logo.svg",
  Razer: "https://upload.wikimedia.org/wikipedia/commons/5/54/Razer_logo.svg",
  Logitech: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Logitech_logo.svg",
  Xiaomi: "https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg",
  Google: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
  Huawei: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Huawei_Standard_logo.svg",
  Skullcandy: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Skullcandy_logo.svg",
  Jabra: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Jabra_logo.svg",
};

const DOMAINS: Record<string, string> = {
  Apple: "apple.com", Sony: "sony.com", Bose: "bose.com", Sennheiser: "sennheiser.com",
  JBL: "jbl.com", Beats: "beatsbydre.com", Nothing: "nothing.tech", Samsung: "samsung.com",
  OnePlus: "oneplus.com", Realme: "realme.com", Jabra: "jabra.com", Skullcandy: "skullcandy.com",
  Soundcore: "soundcore.com", Marshall: "marshallheadphones.com", Audeze: "audeze.com",
  Shure: "shure.com", AKG: "akg.com", HyperX: "hyperx.com", Razer: "razer.com",
  Logitech: "logitech.com", Bang: "bang-olufsen.com", "Bang & Olufsen": "bang-olufsen.com",
  Boat: "boat-lifestyle.com", Xiaomi: "mi.com", Huawei: "huawei.com", Google: "google.com",
};

const SI_SLUGS: Record<string, string> = {
  Apple: "apple", Sony: "sony", Bose: "bose", Sennheiser: "sennheiser",
  JBL: "jbl", Beats: "beats", Nothing: "nothing", Samsung: "samsung",
  OnePlus: "oneplus", Razer: "razer", Logitech: "logitech", HyperX: "hyperx",
  Xiaomi: "xiaomi", Huawei: "huawei", Google: "google", Marshall: "marshall",
  Shure: "shure", Jabra: "jabra", Skullcandy: "skullcandy",
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

/** Primary logo URL for a brand (override → simple-icons → clearbit → avatar). */
export function brandLogo(brand: string, size = 128): string {
  if (OVERRIDES[brand]) return OVERRIDES[brand];
  const slug = SI_SLUGS[brand];
  if (slug) return `https://cdn.simpleicons.org/${slug}`;
  const domain = DOMAINS[brand];
  if (domain) return `https://logo.clearbit.com/${domain}?size=${size}`;
  return letterAvatar(brand);
}

/** Ordered fallback chain for use with <img onError>. */
export function brandLogoSources(brand: string, size = 128): string[] {
  const list: string[] = [];
  if (OVERRIDES[brand]) list.push(OVERRIDES[brand]);
  const slug = SI_SLUGS[brand];
  if (slug) list.push(`https://cdn.simpleicons.org/${slug}`);
  const domain = DOMAINS[brand];
  if (domain) {
    list.push(`https://logo.clearbit.com/${domain}?size=${size}`);
    list.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`);
  }
  list.push(letterAvatar(brand));
  return list;
}

export function brandSlug(brand: string): string | undefined {
  return SI_SLUGS[brand];
}
