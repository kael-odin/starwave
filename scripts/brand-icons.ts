// 从 site/brand/logo.svg 生成站点图标：icon.png(512)、icon-192.png、apple-icon.png(180)、favicon.ico。
// 用法：node scripts/brand-icons.ts
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const brand = path.join(root, "site", "brand");
const svg = await readFile(path.join(brand, "logo.svg"));

async function png(size: number, name: string): Promise<void> {
  await sharp(svg, { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toFile(path.join(brand, name));
  console.log(`wrote site/brand/${name} (${size}x${size})`);
}

await png(512, "icon.png");
await png(192, "icon-192.png");
await png(180, "apple-icon.png");

// ICO 可以内嵌 PNG（Vista+）：6 字节头 + 16 字节目录 + PNG 数据。
const png256 = await sharp(svg, { density: 384 }).resize(256, 256).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // count
header[6] = 0; // width 256
header[7] = 0; // height 256
header[8] = 0; // palette
header[9] = 0; // reserved
header.writeUInt16LE(1, 10); // planes
header.writeUInt16LE(32, 12); // bpp
header.writeUInt32LE(png256.length, 14);
header.writeUInt32LE(22, 18);
await writeFile(path.join(brand, "favicon.ico"), Buffer.concat([header, png256]));
console.log("wrote site/brand/favicon.ico (256x256 PNG-in-ICO)");
