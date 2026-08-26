import { site } from "../content/site";
import { profiles, siteUrl } from "./links";

export function getPersonSchema() {
  const alternateNames = site.seo.alternateNames.filter((n) => n !== site.name);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}/#person`,
    name: site.name,
    ...(alternateNames.length > 0
      ? {
          alternateName:
            alternateNames.length === 1 ? alternateNames[0] : alternateNames,
        }
      : {}),
    url: siteUrl,
    image: site.avatarUrl,
    jobTitle: site.seo.jobTitle,
    description: site.subhead,
    knowsAbout: [...site.now.knownStack],
    ...(profiles.length > 0 ? { sameAs: profiles } : {}),
  };
}

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: `${site.name} — ${site.seo.jobTitle}`,
    description: site.subhead,
    inLanguage: "en",
    publisher: { "@id": `${siteUrl}/#person` },
  };
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\u003c");
}
