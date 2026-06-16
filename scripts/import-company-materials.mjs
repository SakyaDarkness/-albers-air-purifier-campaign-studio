import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync, readdirSync } from "node:fs";
import { basename, extname, join, relative, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const root = resolve(".");
const xlsxInput = process.argv[2] || process.env.COMPANY_XLSX_PATH || "";
const rarInput = process.argv[3] || process.env.COMPANY_RAR_PATH || "";
const xlsxPath = xlsxInput ? resolve(xlsxInput) : "";
const rarPath = rarInput ? resolve(rarInput) : "";
const tempDir = join(root, ".tmp_company_import");
const dataDir = join(root, "data");
const assetDir = join(root, "company-assets");
const xlsxAssetDir = join(assetDir, "xlsx-media");
const rarAssetDir = join(assetDir, "rar-images");

function decodeXml(text) {
  return String(text || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function stripRichText(xml) {
  return decodeXml(xml.replace(/<[^>]+>/g, ""));
}

function columnNumber(column) {
  return [...column].reduce((sum, char) => sum * 26 + char.charCodeAt(0) - 64, 0);
}

function slug(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function matchKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function listFilesRecursive(dir) {
  if (!existsSync(dir)) return [];
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listFilesRecursive(fullPath));
    if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

function relativeAssetPath(file) {
  return relative(root, file).replace(/\\/g, "/");
}

function parseNumber(value) {
  const match = String(value || "").replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function parsePrice(value) {
  const text = String(value || "").replace(/,/g, "");
  const yuan = [...text.matchAll(/(\d+(?:\.\d+)?)\s*元/g)].map((match) => Number(match[1]));
  if (yuan.length) return yuan[0];
  return parseNumber(text);
}

function parseWorkbookSheets(workbookXml) {
  return [...workbookXml.matchAll(/<sheet\b([^>]+)>/g)].map((match, index) => {
    const attrs = match[1];
    return {
      index: index + 1,
      name: decodeXml((attrs.match(/name="([^"]+)"/) || [])[1] || `Sheet${index + 1}`),
      relId: (attrs.match(/r:id="([^"]+)"/) || [])[1],
    };
  });
}

function parseSharedStrings(sharedXml) {
  return [...sharedXml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((match) => stripRichText(match[1]));
}

function parseSheet(sheetXml, sharedStrings) {
  const cells = new Map();
  for (const row of sheetXml.matchAll(/<row[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)) {
    for (const cell of row[2].matchAll(/<c[^>]*r="([A-Z]+)(\d+)"([^>]*)>([\s\S]*?)<\/c>/g)) {
      const column = cell[1];
      const rowNumber = Number(cell[2]);
      const attrs = cell[3];
      const body = cell[4];
      let value = (body.match(/<v>([\s\S]*?)<\/v>/) || [])[1] || "";
      if (attrs.includes('t="s"')) value = sharedStrings[Number(value)] || "";
      if (attrs.includes('t="str"')) value = stripRichText(body);
      if (!value && body.includes("<f>")) value = stripRichText(body);
      cells.set(`${column}${rowNumber}`, decodeXml(value));
    }
  }
  return cells;
}

function parseDrawingImages(sheetIndex) {
  const relPath = join(tempDir, "xl", "worksheets", "_rels", `sheet${sheetIndex}.xml.rels`);
  if (!existsSync(relPath)) return new Map();
  const relXml = readdirSync(join(tempDir, "xl", "worksheets", "_rels")).includes(`sheet${sheetIndex}.xml.rels`)
    ? execFileSync("type", [relPath], { shell: true, encoding: "utf8" })
    : "";
  const drawingTarget = (relXml.match(/Type="[^"]+\/drawing" Target="([^"]+)"/) || [])[1];
  if (!drawingTarget) return new Map();
  const drawingFile = basename(drawingTarget);
  const drawingPath = join(tempDir, "xl", "drawings", drawingFile);
  const drawingRelsPath = join(tempDir, "xl", "drawings", "_rels", `${drawingFile}.rels`);
  if (!existsSync(drawingPath) || !existsSync(drawingRelsPath)) return new Map();
  const drawingXml = execFileSync("type", [drawingPath], { shell: true, encoding: "utf8" });
  const drawingRelsXml = execFileSync("type", [drawingRelsPath], { shell: true, encoding: "utf8" });
  const rels = new Map(
    [...drawingRelsXml.matchAll(/<Relationship[^>]+Id="([^"]+)"[^>]+Target="([^"]+)"/g)].map((match) => [
      match[1],
      match[2].replace("../media/", ""),
    ]),
  );
  const images = new Map();
  for (const anchor of drawingXml.matchAll(/<xdr:(?:twoCellAnchor|oneCellAnchor)[\s\S]*?<\/xdr:(?:twoCellAnchor|oneCellAnchor)>/g)) {
    const xml = anchor[0];
    const col = Number((xml.match(/<xdr:col>(\d+)<\/xdr:col>/) || [])[1]);
    const row = Number((xml.match(/<xdr:row>(\d+)<\/xdr:row>/) || [])[1]);
    const relId = (xml.match(/r:embed="([^"]+)"/) || [])[1];
    const media = rels.get(relId);
    if (Number.isFinite(col) && Number.isFinite(row) && media) {
      images.set(`${col + 1}:${row + 1}`, media);
    }
  }
  return images;
}

function productType(sheetName, model) {
  const text = `${sheetName} ${model}`;
  if (/宠物|S9/i.test(text)) return "pet";
  if (/AI370/i.test(text)) return "formaldehyde-mid";
  if (/AI600/i.test(text)) return "all-purpose";
  if (/AI700/i.test(text)) return "formaldehyde-large";
  return "air-purifier";
}

function isAlbers(model) {
  return /^(S9|AI\d+)/i.test(String(model || ""));
}

function findRarImage(model, group, rarImages) {
  const modelKey = matchKey(model);
  const groupKey = matchKey(String(group || "").split("&")[0]);
  if (!modelKey) return "";

  const scored = rarImages
    .map((image) => {
      const fileKey = matchKey(basename(image.fullPath, extname(image.fullPath)));
      const pathKey = matchKey(image.relativePath);
      let score = 0;
      if (fileKey.includes(modelKey)) score += 10;
      if (modelKey.includes(fileKey)) score += 6;
      if (groupKey && pathKey.includes(groupKey)) score += 4;
      return { image, score };
    })
    .filter((item) => item.score >= 10)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.image.relativePath || "";
}

async function prepareFiles() {
  if (!xlsxPath || !existsSync(xlsxPath)) {
    throw new Error(
      "Missing Excel source. Usage: node scripts/import-company-materials.mjs <xlsx-path> [rar-path]",
    );
  }

  await rm(tempDir, { recursive: true, force: true });
  await mkdir(tempDir, { recursive: true });
  await mkdir(dataDir, { recursive: true });
  await rm(assetDir, { recursive: true, force: true });
  await mkdir(xlsxAssetDir, { recursive: true });
  await mkdir(rarAssetDir, { recursive: true });
  execFileSync("tar", ["-xf", xlsxPath, "-C", tempDir], { stdio: "inherit" });

  const mediaDir = join(tempDir, "xl", "media");
  for (const file of readdirSync(mediaDir)) {
    await copyFile(join(mediaDir, file), join(xlsxAssetDir, file));
  }

  if (existsSync(rarPath)) {
    try {
      execFileSync("tar", ["-xf", rarPath, "-C", rarAssetDir], { stdio: "ignore" });
    } catch {
      // RAR image extraction is best effort; Excel embedded media remains the primary image source.
    }
  }
}

async function buildDatabase() {
  const workbookXml = await readFile(join(tempDir, "xl", "workbook.xml"), "utf8");
  const sharedStrings = parseSharedStrings(await readFile(join(tempDir, "xl", "sharedStrings.xml"), "utf8"));
  const sheets = parseWorkbookSheets(workbookXml);
  const rarImages = listFilesRecursive(rarAssetDir)
    .filter((file) => [".jpg", ".jpeg", ".png", ".webp"].includes(extname(file).toLowerCase()))
    .map((fullPath) => ({ fullPath, relativePath: relativeAssetPath(fullPath) }));
  const database = {
    version: 1,
    importedAt: new Date().toISOString(),
    sources: {
      xlsx: basename(xlsxPath),
      rar: rarPath ? basename(rarPath) : "",
    },
    notes: [
      "Excel rows are converted from horizontal competitor sheets.",
      "Product images are referenced from Excel embedded media when an anchor can be mapped.",
      "RAR images are extracted into company-assets/rar-images for manual matching if needed.",
    ],
    sheets: [],
    products: [],
    imageStats: {
      xlsxMedia: readdirSync(xlsxAssetDir).length,
      rarFiles: rarImages.length,
    },
  };

  for (const sheet of sheets) {
    const sheetPath = join(tempDir, "xl", "worksheets", `sheet${sheet.index}.xml`);
    const cells = parseSheet(await readFile(sheetPath, "utf8"), sharedStrings);
    const imageMap = parseDrawingImages(sheet.index);
    const title = cells.get("A1") || sheet.name;
    const rowLabels = [];
    for (let row = 1; row <= 80; row += 1) {
      const label = cells.get(`A${row}`);
      if (label) rowLabels.push({ row, label });
    }
    const columns = [];
    for (let col = 2; col <= 20; col += 1) {
      const colName = String.fromCharCode(64 + col);
      const model = cells.get(`${colName}2`);
      if (!model) continue;
      const attributes = {};
      for (const { row, label } of rowLabels) {
        if (row <= 2 || label === "产品图片") continue;
        const value = cells.get(`${colName}${row}`);
        if (value) attributes[label] = value;
      }
      const imageMedia = imageMap.get(`${col}:4`) || imageMap.get(`${col}:3`) || imageMap.get(`${col}:5`);
      const rarImage = findRarImage(model, sheet.name, rarImages);
      const price = attributes["价格（RMB）（参考京东）"] || "";
      const filterPrice = attributes["过滤芯价格"] || "";
      const product = {
        id: `${slug(sheet.name)}-${slug(model)}`,
        group: sheet.name,
        title,
        role: isAlbers(model) ? "own" : "competitor",
        brand: isAlbers(model) ? "艾泊斯" : "",
        model,
        productType: productType(sheet.name, model),
        link: cells.get(`${colName}3`) || "",
        image: imageMedia ? `company-assets/xlsx-media/${imageMedia}` : rarImage,
        imageSource: imageMedia ? "xlsx" : rarImage ? "rar" : "",
        metrics: {
          formaldehydeCadr: attributes["甲醛CADR（m³/h）"] || "",
          particleCadr: attributes["颗粒物CADR（m³/h）"] || "",
          benzeneCadr: attributes["苯CADR（m³/h）"] || "",
          tvocCadr: attributes["TVOC CADR（m³/h）"] || "",
          area: attributes["适用面积"] || "",
          noise: attributes["噪音"] || "",
          price,
          priceNumber: parsePrice(price),
          filterPrice,
          filterPriceNumber: parsePrice(filterPrice),
        },
        attributes,
      };
      columns.push(product.id);
      database.products.push(product);
    }
    database.sheets.push({ name: sheet.name, title, productIds: columns, labels: rowLabels.map((item) => item.label) });
  }

  await writeFile(join(dataDir, "company-database.json"), JSON.stringify(database, null, 2), "utf8");
  await writeFile(
    join(dataDir, "company-database.summary.json"),
    JSON.stringify(
      {
        importedAt: database.importedAt,
        sheetCount: database.sheets.length,
        productCount: database.products.length,
        ownProductCount: database.products.filter((item) => item.role === "own").length,
        competitorCount: database.products.filter((item) => item.role === "competitor").length,
        imageStats: database.imageStats,
      },
      null,
      2,
    ),
    "utf8",
  );
  console.log(
    JSON.stringify(
      {
        sheetCount: database.sheets.length,
        productCount: database.products.length,
        ownProductCount: database.products.filter((item) => item.role === "own").length,
        competitorCount: database.products.filter((item) => item.role === "competitor").length,
        imageStats: database.imageStats,
      },
      null,
      2,
    ),
  );
}

try {
  await prepareFiles();
  await buildDatabase();
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
