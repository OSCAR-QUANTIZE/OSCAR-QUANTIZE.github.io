# OSCAR Project Website

Static project page for **OSCAR: Offline Spectral Covariance-Aware Rotation for 2-bit KV Cache Quantization**.

## Local preview

Open `index.html` in a browser, or serve the folder:

```bash
cd src/code/websites/oscar-site
python3 -m http.server 5500 --bind 127.0.0.1
# visit http://127.0.0.1:5500  (avoid 8080 — often used by Cursor)
```

## GitHub Pages

**Live site:** **https://oscar-quantize.github.io/**. Repo: [OSCAR-QUANTIZE/OSCAR-QUANTIZE.github.io](https://github.com/OSCAR-QUANTIZE/OSCAR-QUANTIZE.github.io).

This follows the same GitHub Pages pattern as [introspective-diffusion.github.io](https://introspective-diffusion.github.io/): organization **`OSCAR-QUANTIZE`** + public repo **`OSCAR-QUANTIZE.github.io`** + site files at the repo root.

`FutureMLS-Lab/OSCAR` is private; GitHub Pages there needs **Upgrade or make public**. Keep code there and host the static landing page from the public org website repo.

Asset paths are **relative** (`assets/...`), so the site works at `https://<user>.github.io/<repo>/`.

### Deploy (one time: `gh auth login`)

```bash
cd src/code/websites/oscar-site
gh auth login
./scripts/deploy-pages.sh
```

Pushes this folder to **`OSCAR-QUANTIZE/OSCAR-QUANTIZE.github.io`**, enables Pages on **main** `/`.

Org monorepo (optional, if repo is public):

```bash
OSCAR_REPO=FutureMLS-Lab/OSCAR OSCAR_PAGES_PATH=docs ./scripts/deploy-pages.sh
```

## Links

| Resource | URL |
|----------|-----|
| Code | https://github.com/FutureMLS-Lab/OSCAR |
| Paper | https://arxiv.org/pdf/2605.17757 |
| RotationZoo | https://huggingface.co/Zhongzhu/OSCAR-RotationZoo |

## Files

- `index.html` — page structure and copy
- `intuition.html` — Appendix A.4 rotation intuition page
- `styles.css` — light neutral/gold theme, cards, responsive layout
- `app.js` — pipeline animation, particles, scroll reveals
- `assets/` — logo, icons, paper PDF, figures
