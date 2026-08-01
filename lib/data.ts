import { links, usernames } from "./links";
import { site } from "../content/site";

const REVALIDATE_SECONDS = 3600;

export type DownloadsResult = {
  total: number | null;
  modrinth: number | null;
  curseforge: number | null;
};

async function getModrinthDownloads(): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.modrinth.com/v2/user/${usernames.modrinth}/projects`,
      { next: { revalidate: REVALIDATE_SECONDS } }
    );
    if (!res.ok) return null;
    const projects: Array<{ downloads?: number }> = await res.json();
    return projects.reduce((sum, p) => sum + (p.downloads ?? 0), 0);
  } catch {
    return null;
  }
}

function parseAbbreviatedCount(raw: string, suffix?: string): number | null {
  const n = parseFloat(raw.replace(/,/g, ""));
  if (Number.isNaN(n)) return null;
  const factor =
    suffix?.toUpperCase() === "M"
      ? 1_000_000
      : suffix?.toUpperCase() === "K"
        ? 1_000
        : 1;
  return Math.round(n * factor);
}

const CURSEFORGE_PROJECT_COUNT_RE =
  /By\[[^\]]*\]\(https:\/\/www\.curseforge\.com\/members\/[^)]*\)\s*\n+\s*\*\s+([\d,]+(?:\.\d+)?)\s*([KM])?\s*\n/gi;

const CURSEFORGE_TOTAL_RE = /([\d,]+(?:\.\d+)?)\s*([KM])?\s*Downloads/i;

async function getCurseForgeDownloads(): Promise<number | null> {
  try {
    const res = await fetch(
      `https://r.jina.ai/https://www.curseforge.com/members/${usernames.curseforge}`,
      { next: { revalidate: REVALIDATE_SECONDS } }
    );
    if (!res.ok) return null;
    const text = await res.text();

    const perProject = [...text.matchAll(CURSEFORGE_PROJECT_COUNT_RE)]
      .map((m) => parseAbbreviatedCount(m[1], m[2]))
      .filter((n): n is number => n !== null);

    if (perProject.length > 0) {
      return perProject.reduce((sum, n) => sum + n, 0);
    }

    const match = text.match(CURSEFORGE_TOTAL_RE);
    if (!match) return null;
    return parseAbbreviatedCount(match[1], match[2]);
  } catch {
    return null;
  }
}

export async function getDownloads(): Promise<DownloadsResult> {
  const [modrinth, curseforge] = await Promise.all([
    getModrinthDownloads(),
    getCurseForgeDownloads(),
  ]);
  if (modrinth === null && curseforge === null) {
    return { total: null, modrinth, curseforge };
  }
  return { total: (modrinth ?? 0) + (curseforge ?? 0), modrinth, curseforge };
}

export type ActivityDay = { date: string; count: number };

export async function getActivity(days = 30): Promise<ActivityDay[] | null> {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${usernames.github}`,
      { next: { revalidate: REVALIDATE_SECONDS } }
    );
    if (!res.ok) {
      console.error(`[getActivity] non-ok response: ${res.status} ${res.statusText}`);
      return null;
    }
    const json: { contributions: Array<{ date: string; count: number }> } =
      await res.json();

    const todayStr = new Date().toISOString().slice(0, 10);
    const sorted = [...json.contributions]
      .filter((d) => d.date <= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date));

    return sorted.slice(-days);
  } catch (err) {
    console.error("[getActivity] fetch failed:", err);
    return null;
  }
}

export async function getStack(): Promise<string[]> {
  const known = [...site.now.knownStack];
  try {
    const res = await fetch(
      `https://api.github.com/users/${usernames.github}/repos?per_page=100`,
      { next: { revalidate: REVALIDATE_SECONDS } }
    );
    if (!res.ok) return known;
    const repos: Array<{ fork: boolean; language: string | null }> =
      await res.json();
    const seen = new Set(known.map((k) => k.toLowerCase()));
    const extra: string[] = [];
    for (const r of repos) {
      if (r.fork || !r.language) continue;
      const key = r.language.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      extra.push(r.language);
    }
    return [...known, ...extra];
  } catch {
    return known;
  }
}

export function qrCodeUrl(size: number, colors: { bg: string; fg: string }) {
  const data = encodeURIComponent(links.shareUrl);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${data}&bgcolor=${colors.bg}&color=${colors.fg}&margin=6`;
}
