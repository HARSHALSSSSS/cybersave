/**
 * Generates Android launcher icons, adaptive icon layers, iOS AppIcon sizes,
 * and native splash bitmaps from the Cybersave brand assets.
 *
 * Usage: node scripts/generate-app-icons.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.join(__dirname, '..');

const ICON_SOURCE = path.join(mobileRoot, 'assets/images/brand-icon.png');
const SPLASH_SOURCE = path.join(
  mobileRoot,
  'assets/source/cybersave-brand-logo.png',
);

const ICON_BG = { r: 238, g: 242, b: 248, alpha: 255 }; // #EEF2F8 — light so the mark reads on home screen
const SPLASH_BG = { r: 15, g: 31, b: 77, alpha: 255 }; // #0F1F4D

const androidLegacy = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const androidAdaptive = {
  'mipmap-mdpi': 108,
  'mipmap-hdpi': 162,
  'mipmap-xhdpi': 216,
  'mipmap-xxhdpi': 324,
  'mipmap-xxxhdpi': 432,
};

const iosIcons = [
  { file: 'Icon-20@2x.png', size: 40 },
  { file: 'Icon-20@3x.png', size: 60 },
  { file: 'Icon-29@2x.png', size: 58 },
  { file: 'Icon-29@3x.png', size: 87 },
  { file: 'Icon-40@2x.png', size: 80 },
  { file: 'Icon-40@3x.png', size: 120 },
  { file: 'Icon-60@2x.png', size: 120 },
  { file: 'Icon-60@3x.png', size: 180 },
  { file: 'Icon-1024.png', size: 1024 },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function resizeIcon(sourcePath, canvasSize, iconScale) {
  const iconSize = Math.round(canvasSize * iconScale);
  const icon = await sharp(sourcePath)
    .resize(iconSize, iconSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background: ICON_BG,
    },
  })
    .composite([{ input: icon, gravity: 'center' }])
    .png()
    .toBuffer();
}

async function resizeAdaptiveForeground(sourcePath, canvasSize) {
  const iconSize = Math.round(canvasSize * 0.58);
  const icon = await sharp(sourcePath)
    .resize(iconSize, iconSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: icon, gravity: 'center' }])
    .png()
    .toBuffer();
}

async function resizeSplashLogo(sourcePath, maxWidth) {
  const meta = await sharp(sourcePath).metadata();
  const width = Math.min(meta.width ?? maxWidth, maxWidth);
  const height = Math.round(
    (width / (meta.width ?? maxWidth)) * (meta.height ?? maxWidth),
  );

  return sharp(sourcePath)
    .resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true,
      background: SPLASH_BG,
    })
    .png()
    .toBuffer();
}

async function writeAndroidIcons() {
  const resRoot = path.join(mobileRoot, 'android/app/src/main/res');

  for (const [folder, size] of Object.entries(androidLegacy)) {
    const dir = path.join(resRoot, folder);
    ensureDir(dir);
    const png = await resizeIcon(ICON_SOURCE, size, 0.72);
    await sharp(png).toFile(path.join(dir, 'ic_launcher.png'));
    await sharp(png).toFile(path.join(dir, 'ic_launcher_round.png'));
  }

  for (const [folder, size] of Object.entries(androidAdaptive)) {
    const dir = path.join(resRoot, folder);
    ensureDir(dir);
    const png = await resizeAdaptiveForeground(ICON_SOURCE, size);
    await sharp(png).toFile(path.join(dir, 'ic_launcher_foreground.png'));
  }

  const splashDir = path.join(resRoot, 'drawable-nodpi');
  ensureDir(splashDir);
  const splashLogo = await resizeSplashLogo(SPLASH_SOURCE, 480);
  await sharp(splashLogo).toFile(path.join(splashDir, 'splash_logo.png'));

  const splashIcon = await resizeAdaptiveForeground(ICON_SOURCE, 288);
  await sharp(splashIcon).toFile(path.join(splashDir, 'splash_icon.png'));

  console.log('Android icons written.');
}

async function writeIosIcons() {
  const appIconDir = path.join(
    mobileRoot,
    'ios/Cybersave/Images.xcassets/AppIcon.appiconset',
  );
  ensureDir(appIconDir);

  for (const { file, size } of iosIcons) {
    const png = await resizeIcon(ICON_SOURCE, size, 0.72);
    await sharp(png).toFile(path.join(appIconDir, file));
  }

  const splashDir = path.join(
    mobileRoot,
    'ios/Cybersave/Images.xcassets/SplashLogo.imageset',
  );
  ensureDir(splashDir);
  const splash2x = await resizeSplashLogo(SPLASH_SOURCE, 640);
  const splash3x = await resizeSplashLogo(SPLASH_SOURCE, 960);
  await sharp(splash2x).toFile(path.join(splashDir, 'splash-logo@2x.png'));
  await sharp(splash3x).toFile(path.join(splashDir, 'splash-logo@3x.png'));

  fs.writeFileSync(
    path.join(splashDir, 'Contents.json'),
    `${JSON.stringify(
      {
        images: [
          {
            idiom: 'universal',
            filename: 'splash-logo@2x.png',
            scale: '2x',
          },
          {
            idiom: 'universal',
            filename: 'splash-logo@3x.png',
            scale: '3x',
          },
        ],
        info: { author: 'xcode', version: 1 },
      },
      null,
      2,
    )}\n`,
  );

  console.log('iOS icons written.');
}

function writeAndroidXml() {
  const resRoot = path.join(mobileRoot, 'android/app/src/main/res');

  ensureDir(path.join(resRoot, 'mipmap-anydpi-v26'));
  const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`;
  fs.writeFileSync(
    path.join(resRoot, 'mipmap-anydpi-v26/ic_launcher.xml'),
    adaptiveXml,
  );
  fs.writeFileSync(
    path.join(resRoot, 'mipmap-anydpi-v26/ic_launcher_round.xml'),
    adaptiveXml,
  );

  ensureDir(path.join(resRoot, 'drawable'));
  fs.writeFileSync(
    path.join(resRoot, 'drawable/splash_background.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splash_background"/>
    <item>
        <bitmap
            android:gravity="center"
            android:src="@drawable/splash_logo"/>
    </item>
</layer-list>
`,
  );

  console.log('Android XML resources written.');
}

function writeIosAppIconContents() {
  const contents = {
    images: [
      { size: '20x20', idiom: 'iphone', filename: 'Icon-20@2x.png', scale: '2x' },
      { size: '20x20', idiom: 'iphone', filename: 'Icon-20@3x.png', scale: '3x' },
      { size: '29x29', idiom: 'iphone', filename: 'Icon-29@2x.png', scale: '2x' },
      { size: '29x29', idiom: 'iphone', filename: 'Icon-29@3x.png', scale: '3x' },
      { size: '40x40', idiom: 'iphone', filename: 'Icon-40@2x.png', scale: '2x' },
      { size: '40x40', idiom: 'iphone', filename: 'Icon-40@3x.png', scale: '3x' },
      { size: '60x60', idiom: 'iphone', filename: 'Icon-60@2x.png', scale: '2x' },
      { size: '60x60', idiom: 'iphone', filename: 'Icon-60@3x.png', scale: '3x' },
      {
        size: '1024x1024',
        idiom: 'ios-marketing',
        filename: 'Icon-1024.png',
        scale: '1x',
      },
    ],
    info: { author: 'xcode', version: 1 },
  };

  fs.writeFileSync(
    path.join(
      mobileRoot,
      'ios/Cybersave/Images.xcassets/AppIcon.appiconset/Contents.json',
    ),
    `${JSON.stringify(contents, null, 2)}\n`,
  );
}

async function main() {
  for (const source of [ICON_SOURCE, SPLASH_SOURCE]) {
    if (!fs.existsSync(source)) {
      throw new Error(`Missing source asset: ${source}`);
    }
  }

  writeAndroidXml();
  writeIosAppIconContents();
  await writeAndroidIcons();
  await writeIosIcons();
  console.log('Done — Cybersave app icons and splash assets generated.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
