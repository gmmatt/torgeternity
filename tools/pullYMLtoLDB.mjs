import { compilePack } from "@foundryvtt/foundryvtt-cli";
import { promises as fs } from "fs";
import path from "path";

const packs = await fs.readdir(path.join("src", "packs"));
for (const pack of packs) {
  if (pack === ".gitattributes") continue;
  console.log("Packing " + pack);
  const src = path.join("src", "packs", pack);
  const dest = path.join("packs", pack);
  await compilePack(src, dest, {
    yaml: true,
    log: true,
  });
}
