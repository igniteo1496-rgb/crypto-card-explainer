const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const TMP_BUNDLE = path.join(ROOT, ".tmp-cryptoagg-bundle.js");
const OUTPUT_FILE = path.join(ROOT, "data.js");
const SOURCE_URL = "https://crypto-card-aggregator.vercel.app/";
const cliArg = process.argv[2];
const sourceHint = process.argv[3];

function fetchBundleUrl() {
  const html = execFileSync("curl", ["-s", SOURCE_URL], { encoding: "utf8" });
  const match = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
  if (!match) throw new Error("Could not find CryptoAgg asset bundle URL");
  return new URL(match[1], SOURCE_URL).toString();
}

function downloadBundle(bundleUrl) {
  execFileSync("curl", ["-s", bundleUrl, "-o", TMP_BUNDLE], { stdio: "inherit" });
}

function extractArrayExpression(bundleSource) {
  const start = bundleSource.indexOf("ps=[");
  if (start < 0) throw new Error("Could not find card data array in bundle");

  let i = start + 3;
  let depth = 0;
  let quote = null;
  let escape = false;
  let end = -1;

  for (; i < bundleSource.length; i += 1) {
    const ch = bundleSource[i];

    if (quote) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === quote) quote = null;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "[") depth += 1;
    if (ch === "]") {
      depth -= 1;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }

  if (end < 0) throw new Error("Could not parse card data array bounds");
  return bundleSource.slice(start + 3, end);
}

function normalizeCards(cards) {
  return cards.map((card, index) => ({
    id: card.id,
    rank: card.rank || index + 1,
    name: card.name,
    issuer: card.issuer,
    type: card.type,
    network: card.network,
    cashbackMax: card.cashbackMax,
    annualFee: card.annualFee,
    fxFee: card.fxFee,
    signupBonus: card.signupBonus,
    custody: card.custody,
    regions: card.regions,
    officialLink: card.officialLink,
    status: card.status,
    statusCheckedAt: card.statusCheckedAt,
    evidenceUrl: card.evidenceUrl,
    availabilityNote: card.availabilityNote,
    cardForm: card.cardForm,
    cryptoRole: card.cryptoRole,
    metal: Boolean(card.metal),
    stakingRequired: card.stakingRequired,
    atmLimit: card.atmLimit,
    mobilePay: Boolean(card.mobilePay),
    supportedAssets: card.supportedAssets,
    kyc: card.kyc,
    supportedCurrencies: card.supportedCurrencies || [],
    perks: card.perks || [],
  }));
}

function writeDataFile(cards, bundleUrl) {
  const today = new Date().toISOString().slice(0, 10);
  const output = [
    `// Snapshot adapted from CryptoAgg public product data on ${today}.`,
    `// Source bundle: ${bundleUrl}`,
    "// Verify live issuer terms, regions, fees, and rewards before commercial use.",
    `window.CARD_DATA = ${JSON.stringify(cards, null, 2)};`,
    "",
  ].join("\n");

  fs.writeFileSync(OUTPUT_FILE, output);
}

function main() {
  const bundleUrl = cliArg && fs.existsSync(cliArg) ? null : fetchBundleUrl();
  const bundlePath = cliArg && fs.existsSync(cliArg) ? path.resolve(cliArg) : TMP_BUNDLE;
  if (bundleUrl) downloadBundle(bundleUrl);
  const bundleSource = fs.readFileSync(bundlePath, "utf8");
  const arrayExpression = extractArrayExpression(bundleSource);
  const K = (name) => name;
  const rawCards = eval(arrayExpression);
  const cards = normalizeCards(rawCards);
  writeDataFile(cards, sourceHint || bundleUrl || `file://${bundlePath}`);
  if (bundlePath === TMP_BUNDLE) fs.rmSync(TMP_BUNDLE, { force: true });
  console.log(JSON.stringify({ bundleUrl: bundleUrl || bundlePath, cardCount: cards.length }, null, 2));
}

main();
