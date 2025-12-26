import { copyFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { build } from "vite";

async function buildExtension() {
  console.log("Building extension...");

  // Build popup with Vite
  console.log("Building popup...");
  await build();

  console.log("Post-build: Copying additional files...");

  // Copy manifest
  console.log("Copying manifest...");
  copyFileSync("manifest.json", "dist/manifest.json");

  // Copy rules
  console.log("Copying rules...");
  if (!existsSync("dist/rules")) {
    mkdirSync("dist/rules", { recursive: true });
  }
  copyFileSync("rules/adblock.json", "dist/rules/adblock.json");
  copyFileSync("rules/focus.json", "dist/rules/focus.json");

  // Copy StayFocused page
  console.log("Copying StayFocused page...");
  if (!existsSync("dist/src/pages")) {
    mkdirSync("dist/src/pages", { recursive: true });
  }
  copyFileSync("src/pages/StayFocused.html", "dist/src/pages/StayFocused.html");

  // Copy pages directory
  console.log("Copying pages...");
  if (!existsSync("dist/pages")) {
    mkdirSync("dist/pages", { recursive: true });
  }
  try {
    const pageFiles = readdirSync("pages").filter((f) => f.endsWith(".html"));
    pageFiles.forEach((file) => {
      copyFileSync(`pages/${file}`, `dist/pages/${file}`);
    });
    console.log(`Copied ${pageFiles.length} page files`);
  } catch (e) {
    console.log("⚠️  Error copying pages: " + e.message);
  }

  // Copy icons
  console.log("Copying icons...");
  if (!existsSync("dist/icons")) {
    mkdirSync("dist/icons", { recursive: true });
  }

  try {
    const iconFiles = readdirSync("icons").filter((f) => f.endsWith(".png"));
    iconFiles.forEach((file) => {
      copyFileSync(`icons/${file}`, `dist/icons/${file}`);
    });
    console.log(`Copied ${iconFiles.length} icon files`);
  } catch (e) {
    console.log("⚠️  No icons found - generate them using generate-icons.html");
  }

  // Copy content CSS
  console.log("Copying content CSS...");
  copyFileSync("src/content/content.css", "dist/content.css");

  // Copy bundled scripts
  console.log("Copying content script...");
  copyFileSync("src/content/content-bundle.js", "dist/content.js");

  console.log("Copying background script...");
  copyFileSync("src/background/service-worker-bundle.js", "dist/background.js");

  console.log("✅ Build complete! Load the dist/ folder in Chrome.");
  console.log("");
  console.log("Next steps:");
  console.log("1. Generate icons if you haven't: Open generate-icons.html");
  console.log("2. Go to chrome://extensions/");
  console.log("3. Enable Developer mode");
  console.log('4. Click "Load unpacked"');
  console.log("5. Select the dist/ folder");
}

buildExtension().catch(console.error);
