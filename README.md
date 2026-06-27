# Atlas

A static crypto card explorer for reviewing active, legacy, and needs-verification card products across issuers, regions, networks, fees, rewards, and custody models.

## Live site

- Vercel: https://crypto-card-explainer.vercel.app/
- GitHub Pages: https://igniteo1496-rgb.github.io/crypto-card-explainer/

## Local preview

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173`.

## Refresh card data

The catalog starts from the public CryptoAgg bundle and includes manual verification fields such as `status`, `statusCheckedAt`, `evidenceUrl`, `availabilityNote`, `cardForm`, and `cryptoRole`.

```bash
curl -s https://crypto-card-aggregator.vercel.app/assets/index-CS-GyK4t.js -o .tmp-cryptoagg-source.js
node scripts/sync-cryptoagg-data.js .tmp-cryptoagg-source.js https://crypto-card-aggregator.vercel.app/assets/index-CS-GyK4t.js
rm .tmp-cryptoagg-source.js
```
