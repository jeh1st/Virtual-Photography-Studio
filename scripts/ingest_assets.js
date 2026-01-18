import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = '/home/jason/Documents/Repositories/GUI Items';
const DEST_DIR = path.resolve(__dirname, '../public/assets/gui');
const MANIFEST_PATH = path.resolve(__dirname, '../src/data/assetManifest.json');

const CATEGORIES = ['Knobs', 'Faders', 'Switches', 'Buttons'];

if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
}

const manifest = {};

CATEGORIES.forEach(category => {
    const srcCatDir = path.join(SOURCE_DIR, category);
    const destCatDir = path.join(DEST_DIR, category);

    if (fs.existsSync(srcCatDir)) {
        if (!fs.existsSync(destCatDir)) {
            fs.mkdirSync(destCatDir, { recursive: true });
        }

        manifest[category.toLowerCase()] = [];

        const files = fs.readdirSync(srcCatDir);
        files.forEach(file => {
            if (file.endsWith('.png')) {
                // Copy file
                fs.copyFileSync(path.join(srcCatDir, file), path.join(destCatDir, file));

                // Parse metadata
                const frameMatch = file.match(/_(\d+)frames/);
                const frames = frameMatch ? parseInt(frameMatch[1]) : 1; // Default to 1 if not found

                manifest[category.toLowerCase()].push({
                    id: file.replace('.png', ''),
                    filename: file,
                    path: `/assets/gui/${category}/${file}`,
                    frames: frames,
                    // Default sizes, can be overridden in editor
                    width: 64,
                    height: 64
                });
            }
        });
        console.log(`Processed ${category}: ${manifest[category.toLowerCase()].length} items`);
    } else {
        console.warn(`Category not found: ${category}`);
    }
});

// Ensure src/data exists
const dataDir = path.dirname(MANIFEST_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
console.log(`Manifest wrote to ${MANIFEST_PATH}`);
