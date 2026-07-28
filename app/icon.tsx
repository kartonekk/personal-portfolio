import sharp from "sharp";
import { site } from "../content/site";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default async function Icon() {
  const res = await fetch(site.avatarUrl, {
    next: { revalidate: 3600 },
  });
  const source = await res.arrayBuffer();
  const png = await sharp(Buffer.from(source))
    .resize(size.width, size.height)
    .png()
    .toBuffer();
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": contentType,
    },
  });
}
