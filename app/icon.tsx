import { site } from "../content/site";

export const size = {
  width: 32,
  height: 32,
};

export default async function Icon() {
  const res = await fetch(site.avatarUrl, {
    next: { revalidate: 3600 },
  });
  return new Response(res.body, {
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "image/jpeg",
    },
  });
}
