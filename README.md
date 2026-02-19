# ✦ Samyuktha Sriram — A Visual Chronicle

An interactive data visualization celebrating the work of [Samyuktha Sriram](https://unchainedcrypto.com/author/samyuktha-sriram/), crypto journalist at **Unchained**, through her 20 most recent articles (February – August 2024).

Built as a personal gift to show a friend how their reporting maps onto the biggest moments in crypto.

---

## What This Visualizes

Samyuktha covered some of the most consequential events in crypto during 2024 — from the historic approval of spot Bitcoin ETFs, to the Mt. Gox repayment saga, Trump's Bitcoin 2024 keynote, post-halving miner capitulation, and DeFi governance battles. This project takes her 20 most recent articles and presents them through two complementary lenses:

### ✧ Constellation View

A network graph where each article is a star, clustered by topic:

- **ETFs & Institutional** — BlackRock's ETF dominance, spot Bitcoin ETF inflows, Galaxy Digital's venture fund
- **Mining** — Post-halving miner pressure, hashrate records, Genesis Digital's IPO plans
- **DeFi & Governance** — Compound's governance attack, Ethena's tokenomics controversy, RWA protocols
- **Stablecoins** — Tether's record profits and Treasury holdings
- **L2 & Infrastructure** — Worldcoin's World Chain, StarkWare's token unlock drama
- **Market & Trading** — Trump's Bitcoin speech, MEV sandwich bots, BlackRock's memecoin-bombed wallet
- **Legal & Corporate** — Mt. Gox's $9.6B transfer, Cypher Protocol insider theft

Lines connect thematically related articles, revealing how stories interweave across beats. Hovering on any star reveals the article details and highlights its connections.

### ◈ Timeline View

The same 20 articles plotted as colored dots on the actual Bitcoin price chart from February to August 2024. This view shows:

- **Where BTC was** when each story was published
- **How her coverage tracked** pivotal market moments — the run to $73K ATH, the German government sell-off, the post-halving correction, and the August volatility spike
- **The rhythm of her reporting** — consistently present at the inflection points

A scrollable article list below the chart lets you browse all 20 pieces chronologically.

---

## Tech Stack

- **React 18** with hooks
- **Recharts** for the price timeline
- **Custom SVG** for the constellation graph
- **Vite** for bundling
- Deployed on **Vercel**

---

## Data Sources

- **Articles**: Manually catalogued from [unchainedcrypto.com/author/samyuktha-sriram](https://unchainedcrypto.com/author/samyuktha-sriram/)
- **Bitcoin price data**: Approximate daily prices from February–August 2024
- **Thematic connections**: Hand-curated based on overlapping subjects, entities, and narratives

---

## Running Locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

---

## Project Structure

```
├── index.html          # Entry point
├── package.json
├── vite.config.js
└── src/
    ├── App.jsx         # All visualization logic — constellation + timeline
    ├── main.jsx        # React mount
    └── index.css       # Global styles
```

---

*Made with care for a friend who writes stories worth visualizing.*
