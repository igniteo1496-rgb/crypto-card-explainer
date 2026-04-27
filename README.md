# Crypto Card Explainer

A static briefing site for card issuer teams to understand crypto card business models, issuer roles, settlement flow, and launch priorities.

## Local preview

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173`.

## Refresh card data

```bash
curl -s https://crypto-card-aggregator.vercel.app/assets/index-CS-GyK4t.js -o .tmp-cryptoagg-source.js
node scripts/sync-cryptoagg-data.js .tmp-cryptoagg-source.js https://crypto-card-aggregator.vercel.app/assets/index-CS-GyK4t.js
rm .tmp-cryptoagg-source.js
```
