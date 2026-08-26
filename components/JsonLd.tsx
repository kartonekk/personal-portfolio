import { getPersonSchema, getWebSiteSchema, serializeJsonLd } from "../lib/schema";

export default function JsonLd() {
  const graph = [getPersonSchema(), getWebSiteSchema()];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(graph) }}
    />
  );
}
