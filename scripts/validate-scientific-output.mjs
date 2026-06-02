#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const args = { dir: "", imageExt: "svg", requireColorway: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--dir") {
      args.dir = path.resolve(process.cwd(), next);
      i += 1;
    } else if (arg === "--image-ext") {
      args.imageExt = String(next).replace(/^\./, "");
      i += 1;
    } else if (arg === "--require-colorway") {
      args.requireColorway = true;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (!args.dir) throw new Error("Missing --dir");
  return args;
}

function printHelp() {
  console.log(`Validate Resonance Genesis scientific generator output.

node scripts/validate-scientific-output.mjs --dir output_scientific_collection_v3/chladni-nodes --require-colorway
`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function listFiles(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.toLowerCase().endsWith(`.${ext.toLowerCase()}`))
    .sort((a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10));
}

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

function hasAttribute(metadata, traitType) {
  return Array.isArray(metadata.attributes) && metadata.attributes.some((item) => item?.trait_type === traitType);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const errors = [];
  const imageDir = path.join(options.dir, "images");
  const metadataDir = path.join(options.dir, "metadata");
  const traitsDir = path.join(options.dir, "traits");
  const onchainPath = path.join(options.dir, "onchain-traits.json");
  const csvPath = path.join(options.dir, "traits.csv");
  const summaryPath = path.join(options.dir, "summary.json");

  assert(fs.existsSync(imageDir), `Missing images directory: ${imageDir}`, errors);
  assert(fs.existsSync(metadataDir), `Missing metadata directory: ${metadataDir}`, errors);
  assert(fs.existsSync(traitsDir), `Missing traits directory: ${traitsDir}`, errors);
  assert(fs.existsSync(onchainPath), `Missing onchain traits: ${onchainPath}`, errors);
  assert(fs.existsSync(csvPath), `Missing traits CSV: ${csvPath}`, errors);
  assert(fs.existsSync(summaryPath), `Missing summary: ${summaryPath}`, errors);

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  const images = listFiles(imageDir, "svg");
  const metadataFiles = listFiles(metadataDir, "json");
  const onchain = readJson(onchainPath);

  assert(images.length === metadataFiles.length, `Image count ${images.length} does not equal metadata count ${metadataFiles.length}`, errors);
  assert(Array.isArray(onchain.tokenIds), "onchain-traits.json tokenIds must be an array", errors);
  assert(Array.isArray(onchain.traits), "onchain-traits.json traits must be an array", errors);
  assert(onchain.tokenIds?.length === metadataFiles.length, `tokenIds length ${onchain.tokenIds?.length} does not equal metadata count ${metadataFiles.length}`, errors);
  assert(onchain.traits?.length === metadataFiles.length, `traits length ${onchain.traits?.length} does not equal metadata count ${metadataFiles.length}`, errors);

  const expectedKeys = [
    "name",
    "description",
    "image",
    "tokenId",
    "frequency",
    "waveNumberK",
    "modeN",
    "modeM",
    "patternName",
    "family",
    "nodeDensity",
    "nodeDensityBps",
    "lineThickness",
    "lineThicknessBps",
    "rarityTier",
    "rarityName",
    "frequencyBand",
    "symmetryType",
    "nodeArchitecture",
    "waveDistortion",
    "harmonicLayerCount",
    "hashratePreview",
    "renderer",
    "attributes",
  ];

  metadataFiles.forEach((fileName, index) => {
    const metadata = readJson(path.join(metadataDir, fileName));
    const label = `metadata/${fileName}`;
    for (const key of expectedKeys) {
      assert(Object.hasOwn(metadata, key), `${label} missing ${key}`, errors);
    }
    assert(String(metadata.image || "").endsWith(`.${options.imageExt}`), `${label} image does not use .${options.imageExt}: ${metadata.image}`, errors);
    assert(Number(metadata.frequency) > 0, `${label} frequency must be > 0`, errors);
    assert(Number(metadata.modeN) > 0, `${label} modeN must be > 0`, errors);
    assert(Number(metadata.modeM) > 0, `${label} modeM must be > 0`, errors);
    assert(Number(metadata.nodeDensityBps) > 0, `${label} nodeDensityBps must be > 0`, errors);
    assert(Number(metadata.lineThicknessBps) > 0, `${label} lineThicknessBps must be > 0`, errors);
    if (options.requireColorway) {
      assert(Object.hasOwn(metadata, "colorway"), `${label} missing colorway`, errors);
      assert(Object.hasOwn(metadata, "colorwayId"), `${label} missing colorwayId`, errors);
      assert(hasAttribute(metadata, "Colorway"), `${label} missing Colorway attribute`, errors);
    }

    const trait = onchain.traits?.[index];
    assert(Number(trait?.frequency) > 0, `onchain trait ${index + 1} frequency must be > 0`, errors);
    assert(Number(trait?.modeN) > 0, `onchain trait ${index + 1} modeN must be > 0`, errors);
    assert(Number(trait?.modeM) > 0, `onchain trait ${index + 1} modeM must be > 0`, errors);
    assert(Number(trait?.nodeDensityBps) > 0, `onchain trait ${index + 1} nodeDensityBps must be > 0`, errors);
    assert(Number(trait?.lineThicknessBps) > 0, `onchain trait ${index + 1} lineThicknessBps must be > 0`, errors);
    assert(trait?.initialized === true, `onchain trait ${index + 1} initialized must be true`, errors);
  });

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  console.log(`Validated ${metadataFiles.length} scientific Chladni Nodes in ${options.dir}`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
