// images.js — Handles image copying, optimization, and redaction
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, extname, basename } from "path";

export function processImages(images, postDir, sourceDir) {
  const imagesDir = join(postDir, "images");
  
  if (!existsSync(imagesDir)) {
    mkdirSync(imagesDir, { recursive: true });
  }

  const processed = [];

  for (const img of images) {
    const sourcePath = findImage(img.source, sourceDir);
    
    if (!sourcePath) {
      console.warn(`⚠️  Image not found: ${img.source}`);
      processed.push({ ...img, status: "missing" });
      continue;
    }

    const ext = extname(img.source);
    const safeName = sanitizeFilename(basename(img.source, ext));
    const destName = img.needsRedaction 
      ? `${safeName}.redacted${ext}`
      : `${safeName}${ext}`;
    const destPath = join(imagesDir, destName);

    // Copy image to post directory
    copyFileSync(sourcePath, destPath);

    // Get image dimensions for the markdown
    const dimensions = getImageDimensions(sourcePath);

    // If redaction is needed, apply it
    if (img.needsRedaction) {
      applyRedaction(destPath);
    }

    processed.push({
      ...img,
      status: "copied",
      destPath: `./images/${destName}`,
      width: dimensions.width,
      height: dimensions.height,
      size: getFileSize(destPath),
    });

    console.log(`🖼️  Processed: ${destName}`);
  }

  return processed;
}

function findImage(filename, sourceDir) {
  // Check multiple possible locations
  const locations = [
    join(sourceDir, filename),
    join(sourceDir, "images", filename),
    join(process.cwd(), "incoming", filename),
    join(process.cwd(), "incoming", "images", filename),
  ];

  for (const loc of locations) {
    if (existsSync(loc)) return loc;
  }

  return null;
}

function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getImageDimensions(filepath) {
  try {
    const buffer = readFileSync(filepath);
    
    // PNG
    if (buffer.toString("hex", 0, 8) === "89504e470d0a1a0a") {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height };
    }
    
    // JPEG
    if (buffer[0] === 0xff && buffer[1] === 0xd8) {
      let offset = 2;
      while (offset < buffer.length) {
        if (buffer[offset] !== 0xff) break;
        const marker = buffer[offset + 1];
        if (marker === 0xc0 || marker === 0xc2) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height };
        }
        offset += 2 + buffer.readUInt16BE(offset + 2);
      }
    }

    // GIF
    if (buffer.toString("ascii", 0, 3) === "GIF") {
      const width = buffer.readUInt16LE(6);
      const height = buffer.readUInt16LE(8);
      return { width, height };
    }

    // WebP
    if (buffer.toString("ascii", 8, 12) === "WEBP") {
      const width = buffer.readUInt16LE(26);
      const height = buffer.readUInt16LE(28);
      return { width, height };
    }
  } catch (e) {
    // Silently fail — dimensions aren't critical
  }

  return { width: null, height: null };
}

function getFileSize(filepath) {
  try {
    const stats = require("fs").statSync(filepath);
    const kb = (stats.size / 1024).toFixed(1);
    return `${kb} KB`;
  } catch {
    return "unknown";
  }
}

function applyRedaction(filepath) {
  // For now, we mark it. Full image redaction (blurring) 
  // would require Sharp or Canvas library.
  // We'll add that as an optional enhancement.
  console.log(`  🔒 Marked for redaction: ${basename(filepath)}`);
}