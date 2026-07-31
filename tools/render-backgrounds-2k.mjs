import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("../frontend/node_modules/sharp");

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(toolsDir, "../frontend/public");

const desktopJobs = [
  ["hero/hero-vietnam-city-blue.png", "hero/hero-vietnam-city-blue-2k.png", 2560, 1440],
  ["hero/hero-vietnam-tropical-minimal.png", "hero/hero-vietnam-tropical-minimal-2k.png", 2560, 1440],
  ["hero/hero-vietnam-menswear-slate.png", "hero/hero-vietnam-menswear-slate-2k.png", 2560, 1440],
  ["page-headers/vietnam-brand-studio-header.png", "page-headers/vietnam-brand-studio-header-2k.png", 2560, 1440],
  ["page-headers/vietnam-careers-team-header.png", "page-headers/vietnam-careers-team-header-2k.png", 2560, 1440],
  ["page-headers/vietnam-collections-header.png", "page-headers/vietnam-collections-header-2k.png", 2560, 1440],
  ["page-headers/vietnam-customer-care-header.png", "page-headers/vietnam-customer-care-header-2k.png", 2560, 1440],
  ["page-headers/vietnam-faq-styling-header.png", "page-headers/vietnam-faq-styling-header-2k.png", 2560, 1440],
  ["page-headers/vietnam-fit-policy-header.png", "page-headers/vietnam-fit-policy-header-2k.png", 2560, 1440],
  ["page-headers/vietnam-order-fulfillment-header.png", "page-headers/vietnam-order-fulfillment-header-2k.png", 2560, 1440],
  ["cart/vietnam-cart-boutique.png", "cart/vietnam-cart-boutique-2k.png", 2560, 1440],
];

const editorialJobs = [
  ["editorial/vietnam-fashion-new-arrivals.png", "editorial/vietnam-fashion-new-arrivals-2k.png", 2560],
  ["editorial/vietnam-fashion-categories.png", "editorial/vietnam-fashion-categories-2k.png", 2560],
  ["editorial/vietnam-fashion-bestsellers.png", "editorial/vietnam-fashion-bestsellers-2k.png", 2560],
];

const outputOptions = {
  compressionLevel: 9,
  adaptiveFiltering: true,
};

async function renderDesktop([inputName, outputName, width, height]) {
  await sharp(path.join(publicDir, inputName))
    .resize({ width, height, fit: "cover", position: "centre", kernel: "lanczos3" })
    .png(outputOptions)
    .toFile(path.join(publicDir, outputName));
}

async function renderEditorial([inputName, outputName, width]) {
  await sharp(path.join(publicDir, inputName))
    .resize({ width, kernel: "lanczos3" })
    .png(outputOptions)
    .toFile(path.join(publicDir, outputName));
}

await Promise.all([
  ...desktopJobs.map(renderDesktop),
  ...editorialJobs.map(renderEditorial),
]);

console.log(
  `Rendered ${desktopJobs.length + editorialJobs.length} high-resolution background masters. Portrait mobile masters are art-directed separately and are never overwritten by this script.`
);
