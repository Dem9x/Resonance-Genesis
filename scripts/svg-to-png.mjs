#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

function parseArgs(argv) {
  const args = {
    inputDir: "output_scientific_collection_v3/chladni-nodes/images",
    outputDir: "output_scientific_collection_v3/chladni-nodes/png",
    width: 1024,
    height: 1024,
    background: "#000000",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--input" || arg === "-i") { args.inputDir = next; i += 1; }
    else if (arg === "--output" || arg === "-o") { args.outputDir = next; i += 1; }
    else if (arg === "--width") { args.width = Number(next); i += 1; }
    else if (arg === "--height") { args.height = Number(next); i += 1; }
    else if (arg === "--background") { args.background = String(next); i += 1; }
    else if (arg === "--help" || arg === "-h") { printHelp(); process.exit(0); }
    else { console.error(`Unknown argument: ${arg}`); printHelp(); process.exit(1); }
  }

  return args;
}

function printHelp() {
  console.log(`Convert SVG collection images to PNG.\n\nUsage:\n  node scripts/svg-to-png.mjs --input images --output png --width 1024 --height 1024`);
}

function sortFiles(files) {
  return files.sort((a, b) => {
    const an = Number.parseInt(path.basename(a, ".svg"), 10);
    const bn = Number.parseInt(path.basename(b, ".svg"), 10);
    if (Number.isFinite(an) && Number.isFinite(bn)) return an - bn;
    return a.localeCompare(b);
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputDir = path.resolve(process.cwd(), args.inputDir);
  const outputDir = path.resolve(process.cwd(), args.outputDir);

  if (!fs.existsSync(inputDir)) {
    console.error(`Input folder not found: ${inputDir}`);
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });
  const files = sortFiles(fs.readdirSync(inputDir).filter((file) => file.toLowerCase().endsWith(".svg")));

  if (files.length === 0) {
    console.error(`No SVG files found in: ${inputDir}`);
    process.exit(1);
  }

  console.log(`Converting ${files.length} SVG files to PNG...`);

  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, `${path.basename(file, ".svg")}.png`);

    await sharp(inputPath)
      .resize(args.width, args.height, { fit: "cover", background: args.background })
      .png({ compressionLevel: 9 })
      .toFile(outputPath);

    if ((i + 1) % 100 === 0 || i + 1 === files.length) {
      console.log(`Converted ${i + 1}/${files.length}`);
    }
  }

  console.log(`Done: ${path.relative(process.cwd(), outputDir)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
