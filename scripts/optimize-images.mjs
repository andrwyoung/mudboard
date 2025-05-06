// DEPRECATED: for local optimization

import fs from "fs/promises";
import sharp from "sharp";
import path from "path";

const BASE_DIR = "./public/images";
const METADATA_FILE = "./galleryData.json";
const SUPPORTED_INPUTS = [".png", ".jpg", ".jpeg", ".tiff", ".tif", ".heic", ".heif", ".webp"];

async function getAllImagePaths(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllImagePaths(fullPath)));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (SUPPORTED_INPUTS.includes(ext)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

async function optimizeImages() {
  let updated = false;
  const inputPaths = await getAllImagePaths(BASE_DIR);
  let metadata = [];

  try {
    const existing = await fs.readFile(METADATA_FILE, "utf8");
    metadata = JSON.parse(existing);
  } catch {
    console.log("No existing metadata. Creating new one.");
  }

  const metadataSet = new Set(metadata.map((item) => item.src));

  let converted = 0;
  for (const inputPath of inputPaths) {
    const ext = path.extname(inputPath);
    const baseName = path.basename(inputPath, ext);
    const dirName = path.dirname(inputPath);
    const outputFile = `${baseName}.webp`;
    const outputPath = path.join(dirName, outputFile);
    const relativeSrc = path.join("/images", path.relative(BASE_DIR, outputPath)).replace(/\\/g, "/");

    const id = generateId();
    const isWebp = ext === ".webp";

    // If it's a .webp that doesn't have metadata, just extract info & add
    if (isWebp) {
      if (!metadataSet.has(relativeSrc)) {
        try {
          const { width, height } = await sharp(inputPath).metadata();
          const orientation = width > height ? "landscape" : "portrait";
  
          metadata.push({
            id,
            src: relativeSrc,
            alt: baseName.replace(/[-_]/g, " "),
            width,
            height,
            weight: 1,
            orientation,
          });
  
          console.log(`📝 Added metadata for existing .webp: ${relativeSrc}`);
          updated = true;
        } catch (e) {
          console.warn(`❌ Failed to read .webp metadata: ${inputPath}`, e.message);
        }
      }
      continue;
    }

    // If it's already in metadata, log replacement
    if (metadataSet.has(relativeSrc)) {
      console.log(`♻️  Replacing existing: ${relativeSrc}`);
      metadata = metadata.filter((item) => item.src !== relativeSrc);
    }


    try {
      const { width, height } = await sharp(inputPath)
        .resize({ width: 1600 })
        .webp({ quality: 85, effort: 4 })
        .toFile(outputPath);

      await fs.unlink(inputPath); // DELETE original
      const orientation = width > height ? "landscape" : "portrait";

      metadata.push({
        id,
        src: relativeSrc,
        alt: baseName.replace(/[-_]/g, " "),
        width,
        height,
        weight: 1,
        orientation,
      });
      converted++;

      console.log(`✅ Converted + removed: ${relativeSrc}`);
      updated = true;
    } catch (e) {
      console.warn(`❌ Failed: ${inputPath}`, e.message);
    }
  }

  if (updated) {
    metadata.sort((a, b) => a.src.localeCompare(b.src));
    await fs.copyFile(METADATA_FILE, `${METADATA_FILE}.backup`); // backup file
    await fs.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2));
    console.log("✨ Metadata updated.");
  } else {
    console.log("👍 No new or updated files to process.");
  }
  console.log(`🧾 Summary: ${converted} files processed.`);
}

optimizeImages();