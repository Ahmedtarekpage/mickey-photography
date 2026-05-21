export type Orientation = "portrait" | "landscape";

/** Top-level discipline. Photography holds photos; videography holds videos. */
export type Medium = "photography" | "videography";

/** Which area of a brand a media item belongs to. */
export type PhotoSection = "gallery" | "bts";

export interface Category {
  id: string;
  medium: Medium;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  accent: string; // tailwind-ish hex used for the category accent
  createdAt: string;
}

export interface Brand {
  id: string;
  categoryId: string;
  name: string;
  logo: string; // shown in a circular frame
  description: string;
  website?: string;
  featured: boolean;
  createdAt: string;
}

/**
 * A media item belonging to a brand — either in the main Gallery or in BTS.
 * In photography categories these are images; in videography categories they
 * are videos (then `videoUrl` is set and `url` acts as the poster/thumbnail).
 */
export interface Photo {
  id: string;
  brandId: string;
  /** "gallery" = finished portfolio work, "bts" = behind-the-scenes. */
  section: PhotoSection;
  title: string;
  orientation: Orientation;
  /** Image URL, or the poster/thumbnail when this item is a video. */
  url: string;
  /** Set for videography items — the playable video source. */
  videoUrl?: string;
  durationSec?: number;
  /** Photography BTS only: a before/after pair renders a comparison slider. */
  beforeUrl?: string;
  afterUrl?: string;
  createdAt: string;
}

/** A BTS (behind-the-scenes) reel belonging to a brand. */
export interface Reel {
  id: string;
  brandId: string;
  title: string;
  videoUrl: string;
  thumbnail: string;
  durationSec?: number;
  createdAt: string;
}

/** Editable content for the public landing page. */
export interface SiteSettings {
  siteName: string;
  tagline: string;
  /** Circular logo shown in the hero (section 1). */
  logo: string;
  /** Section 2 reel — a video reference (url or idb:) + poster. */
  reelVideoUrl: string;
  reelPoster: string;
  /** Section 2 brief / about copy. */
  briefHeading: string;
  brief: string;
  /** Section 3 brands marquee scroll speed (1 = slow … 10 = fast). */
  brandsSpeed: number;
  /** Footer — contact + social. Empty values are hidden on the site. */
  email: string;
  instagram: string;
  linkedin: string;
  facebook: string;
  /** Booking section — WhatsApp number (any format; digits are extracted for
   *  the wa.me link) plus an optional pre-filled chat message. */
  whatsapp: string;
  whatsappMessage: string;
  /** Booking section — Google Calendar appointment / scheduling link. */
  calendarUrl: string;
}

/** A headline metric shown in the "by the numbers" band (e.g. countries, clients). */
export interface Stat {
  id: string;
  label: string;
  value: number;
  /** Appended after the number, e.g. "+", "k", "M". */
  suffix: string;
  /** Icon key from the shared stat-icon registry. */
  icon: string;
  createdAt: string;
}

/** A country we've worked in — shown as a flag in the "around the world" section. */
export interface Country {
  id: string;
  /** ISO 3166-1 alpha-2 code, lowercase (e.g. "fr"). Drives the flag image. */
  code: string;
  name: string;
  createdAt: string;
}

export interface DataShape {
  settings: SiteSettings;
  stats: Stat[];
  countries: Country[];
  categories: Category[];
  brands: Brand[];
  photos: Photo[];
  reels: Reel[];
}
