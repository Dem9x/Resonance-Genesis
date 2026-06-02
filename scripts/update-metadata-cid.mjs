#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const args = {
    metadataDir: "output_scientific_collection_v3/chladni-nodes/metadata",
    imageCid: "",
    imageBase: "",
    imageExt: "png",
    animationCid: "",
    animationBase: "",
    animationExt: "mp4",
    removeAnimation: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--metadata-dir") { args.metadataDir = next; i += 1; }
    else if (arg === "--image-cid") { args.imageCid = next; i += 1; }
    else if (arg === "--image-base") { args.imageBase = next; i += 1; }
    else if (arg === "--image-ext") { args.imageExt = String(next).replace(/^\./, ""); i += 1; }
    else if (arg === "--animation-cid") { args.animationCid = next; i += 1; }
    else if (arg === "--animation-base") { args.animationBase = next; i += 1; }
    else if (arg === "--animation-ext") { args.animationExt = String(next).replace(/^\./, ""); i += 1; }
    else if (arg === "--remove-animation") { args.removeAnimation = true; }
    else if (arg === "--help" || arg === "-h") { printHelp(); process.exit(0); }
    else { console.error(`Unknown argument: ${arg}`); printHelp(); process.exit(1); }
  }

  if (!args.imageCid && !args.imageBase) {
    throw new Error("Provide --image-cid YOUR_CID or --image-base ipfs://YOUR_CID");
  }

  return args;
}

function printHelp() {
  console.log(`Update metadata image CID.\n\nUsage:\n  node scripts/update-metadata-cid.mjs --metadata-dir metadata --image-cid CID --image-ext png`);
}

function normalizeBase(value) {
  if (!value) return "";
  const trimmed = String(value).trim().replace(/\/$/, "");
  if (/^(ipfs|https?):\/\//.test(trimmed)) return trimmed;
  return `ipfs://${trimmed}`;
}

function sortFiles(files) {
  return files.sort((a, b) => {
    const an = Number.parseInt(path.basename(a, ".json"), 10);
    const bn = Number.parseInt(path.basename(b, ".json"), 10);
    if (Number.isFinite(an) && Number.isFinite(bn)) return an - bn;
    return a.localeCompare(b);
  });
}

function tokenIdFromMetadata(file, metadata) {
  const tokenId = Number(metadata.tokenId ?? metadata.token_id ?? 0);
  if (Number.isFinite(tokenId) && tokenId > 0) return tokenId;
  const fromFile = Number.parseInt(path.basename(file, ".json"), 10);
  if (Number.isFinite(fromFile) && fromFile > 0) return fromFile;
  throw new Error(`Cannot infer tokenId for ${file}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const metadataDir = path.resolve(process.cwd(), args.metadataDir);

  if (!fs.existsSync(metadataDir)) {
    console.error(`Metadata folder not found: ${metadataDir}`);
    process.exit(1);
  }

  const imageBase = normalizeBase(args.imageBase || args.imageCid);
  const animationBase = normalizeBase(args.animationBase || args.animationCid);
  const files = sortFiles(fs.readdirSync(metadataDir).filter((file) => file.toLowerCase().endsWith(".json")));

  if (files.length === 0) {
    console.error(`No metadata JSON files found in: ${metadataDir}`);
    process.exit(1);
  }

  for (const file of files) {
    const filePath = path.join(metadataDir, file);
    const metadata = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const tokenId = tokenIdFromMetadata(file, metadata);

    metadata.image = `${imageBase}/${tokenId}.${args.imageExt}`;

    if (args.removeAnimation) {
      delete metadata.animation_url;
    } else if (animationBase) {
      metadata.animation_url = `${animationBase}/${tokenId}.${args.animationExt}`;
    }

    fs.writeFileSync(filePath, `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
  }

  console.log(`Updated ${files.length} metadata files.`);
  console.log(`Image base: ${imageBase}`);
  console.log(`Image ext : ${args.imageExt}`);
  if (animationBase) console.log(`Animation base: ${animationBase}`);
}

main();
