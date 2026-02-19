import { useState, useRef, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";

const CATEGORIES = {
  "ETFs & Institutional": { color: "#00d4ff", glow: "rgba(0,212,255,0.4)" },
  "Mining": { color: "#f59e0b", glow: "rgba(245,158,11,0.4)" },
  "DeFi & Governance": { color: "#a855f7", glow: "rgba(168,85,247,0.4)" },
  "Stablecoins": { color: "#10b981", glow: "rgba(16,185,129,0.4)" },
  "L2 & Infrastructure": { color: "#ec4899", glow: "rgba(236,72,153,0.4)" },
  "Market & Trading": { color: "#f97316", glow: "rgba(249,115,22,0.4)" },
  "Legal & Corporate": { color: "#ef4444", glow: "rgba(239,68,68,0.4)" },
};

const ARTICLES = [
  { id: 1, title: "MEV Sandwich Bot Jared 2.0 Cooks Up 'New Recipes'", date: "2024-08-21", cat: "Market & Trading", brief: "Pseudonymous MEV bot operator returns with advanced sandwich attack strategies" },
  { id: 2, title: "BlackRock's Spot Crypto ETFs Overtake Grayscale's Assets", date: "2024-08-19", cat: "ETFs & Institutional", brief: "IBIT and ETHA now hold more than Grayscale's four crypto ETFs combined" },
  { id: 3, title: "Bitcoin Hashrate Hits Record High as Miner Reserves Drop", date: "2024-08-13", cat: "Mining", brief: "Miner reserves fall to 1.8M BTC — a three-year low — while hashrate hits 627 EH/s" },
  { id: 4, title: "Tether Reports Record $5.2B in First Half of 2024", date: "2024-08-01", cat: "Stablecoins", brief: "USDT issuer now holds $97.6B in US Treasuries, more than Germany and UAE" },
  { id: 5, title: "Compound 'Governance Attackers' Agree to Cancel Proposal", date: "2024-07-30", cat: "DeFi & Governance", brief: "Golden Boys DAO rescinds $24M treasury grab after community backlash" },
  { id: 6, title: "Bitcoin Hits Six-Week High After Trump's Pro-Crypto Address", date: "2024-07-29", cat: "Market & Trading", brief: "Trump pledges to end 'anti-crypto crusade' and fire SEC Chair Gensler" },
  { id: 7, title: "Spot Bitcoin ETF Balances Hit All-Time High", date: "2024-07-19", cat: "ETFs & Institutional", brief: "ETF holdings reach 900,636 BTC — over $63B across 11 funds" },
  { id: 8, title: "BlackRock's BUIDL Crosses $500M in Tokenized Treasuries", date: "2024-07-09", cat: "ETFs & Institutional", brief: "First tokenized fund to hit half a billion, surpassing Franklin Templeton" },
  { id: 9, title: "Bitcoin Miner Genesis Digital Assets Considers US IPO", date: "2024-07-03", cat: "Mining", brief: "Mining firm valued at $5.5B plans pre-IPO round, previously backed by Alameda" },
  { id: 10, title: "Ethena Updates Tokenomics, Requires 50% Token Lock", date: "2024-06-18", cat: "DeFi & Governance", brief: "Synthetic dollar protocol sparks outrage with forced ENA airdrop lockups" },
  { id: 11, title: "Bitcoin Miners Under Pressure and Selling Coins", date: "2024-06-14", cat: "Mining", brief: "Post-halving revenues drop 55%, miners transferring BTC to exchanges" },
  { id: 12, title: "Mt Gox Cold Wallet Transfers $9.6B in Bitcoin", date: "2024-05-28", cat: "Legal & Corporate", brief: "141,664 BTC moved for first time in five years ahead of creditor repayments" },
  { id: 13, title: "Why ETH Isn't Moving After SEC Approves Spot ETF Filings", date: "2024-05-24", cat: "ETFs & Institutional", brief: "Eight spot ether ETFs cleared but price drops 4% as whales pull orders" },
  { id: 14, title: "Cypher Protocol Insider Steals From Redemption Contract", date: "2024-05-14", cat: "Legal & Corporate", brief: "Core contributor drains $300K from fund meant to repay hack victims" },
  { id: 15, title: "Crypto's New Hype Sector? RWA Protocols Near $8B TVL", date: "2024-05-01", cat: "DeFi & Governance", brief: "Real World Asset tokenization surges 60% as BlackRock's BUIDL leads" },
  { id: 16, title: "Worldcoin Announces Layer 2 Network 'World Chain'", date: "2024-04-18", cat: "L2 & Infrastructure", brief: "Sam Altman's project launches permissionless L2 prioritizing verified humans" },
  { id: 17, title: "Galaxy Digital Plans $100M Crypto Venture Fund", date: "2024-04-03", cat: "ETFs & Institutional", brief: "Fund targets 30 early-stage crypto startups over three years" },
  { id: 18, title: "BlackRock's New Fund Wallet Receives Memecoins and NFTs", date: "2024-03-21", cat: "Market & Trading", brief: "Degens flood BUIDL-associated wallet with 48 memecoins and 28 NFTs" },
  { id: 19, title: "StarkWare Revises Token Unlock Schedule Amid Controversy", date: "2024-02-22", cat: "L2 & Infrastructure", brief: "Community backlash forces more gradual STRK release over three years" },
  { id: 20, title: "How ETF Inflows Could Shape Bitcoin's Price Trajectory", date: "2024-02-15", cat: "ETFs & Institutional", brief: "$2.2B in ETF inflows in four days — 12x daily Bitcoin production" },
];

// connections between related articles [id1, id2]
const CONNECTIONS = [
  [2, 7], [2, 8], [7, 8], [7, 20], [2, 20], [8, 15], [13, 20],
  [3, 9], [3, 11], [9, 11],
  [5, 10], [10, 15], [5, 15],
  [1, 6], [1, 18], [6, 18],
  [12, 14],
  [16, 19],
  [4, 8], [13, 17], [17, 20],
  [6, 7], [3, 6],
];

// approximate BTC price data Feb-Aug 2024
const BTC_PRICE = [
  { date: "Feb 1", price: 43000, ts: "2024-02-01" },
  { date: "Feb 15", price: 52500, ts: "2024-02-15" },
  { date: "Mar 1", price: 62000, ts: "2024-03-01" },
  { date: "Mar 14", price: 73750, ts: "2024-03-14" },
  { date: "Mar 21", price: 67000, ts: "2024-03-21" },
  { date: "Apr 1", price: 69500, ts: "2024-04-01" },
  { date: "Apr 18", price: 64200, ts: "2024-04-18" },
  { date: "May 1", price: 60500, ts: "2024-05-01" },
  { date: "May 14", price: 62700, ts: "2024-05-14" },
  { date: "May 24", price: 68000, ts: "2024-05-24" },
  { date: "May 28", price: 67800, ts: "2024-05-28" },
  { date: "Jun 7", price: 71000, ts: "2024-06-07" },
  { date: "Jun 14", price: 66000, ts: "2024-06-14" },
  { date: "Jun 18", price: 65200, ts: "2024-06-18" },
  { date: "Jul 3", price: 60200, ts: "2024-07-03" },
  { date: "Jul 9", price: 57700, ts: "2024-07-09" },
  { date: "Jul 19", price: 66700, ts: "2024-07-19" },
  { date: "Jul 29", price: 69800, ts: "2024-07-29" },
  { date: "Jul 30", price: 66600, ts: "2024-07-30" },
  { date: "Aug 1", price: 64600, ts: "2024-08-01" },
  { date: "Aug 5", price: 54300, ts: "2024-08-05" },
  { date: "Aug 13", price: 59400, ts: "2024-08-13" },
  { date: "Aug 19", price: 58900, ts: "2024-08-19" },
  { date: "Aug 21", price: 60700, ts: "2024-08-21" },
];

const articlePriceMap = {};
ARTICLES.forEach(a => {
  const closest = BTC_PRICE.reduce((prev, curr) =>
    Math.abs(new Date(curr.ts) - new Date(a.date)) < Math.abs(new Date(prev.ts) - new Date(a.date)) ? curr : prev
  );
  articlePriceMap[a.id] = closest;
});

// constellation positions — clustered by category with some organic spread
function getConstellationPositions(w, h) {
  const cx = w / 2, cy = h / 2;
  const clusterCenters = {
    "ETFs & Institutional": { x: cx + 10, y: cy - 80 },
    "Mining": { x: cx - 200, y: cy - 40 },
    "DeFi & Governance": { x: cx + 200, y: cy + 20 },
    "Stablecoins": { x: cx + 160, y: cy - 160 },
    "L2 & Infrastructure": { x: cx - 160, y: cy + 140 },
    "Market & Trading": { x: cx - 40, y: cy + 130 },
    "Legal & Corporate": { x: cx + 60, y: cy + 160 },
  };
  const catCounters = {};
  const positions = {};
  const seeded = (id) => {
    let s = id * 9301 + 49297;
    return ((s % 233280) / 233280);
  };
  ARTICLES.forEach(a => {
    const center = clusterCenters[a.cat];
    if (!catCounters[a.cat]) catCounters[a.cat] = 0;
    const idx = catCounters[a.cat]++;
    const angle = (idx * 2.39996) + seeded(a.id) * 1.2;
    const radius = 30 + idx * 22 + seeded(a.id + 50) * 20;
    positions[a.id] = {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    };
  });
  return positions;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const arts = ARTICLES.filter(a => {
    const c = articlePriceMap[a.id];
    return c && c.date === d.date;
  });
  return (
    <div style={{
      background: "rgba(10,14,26,0.95)", border: "1px solid rgba(0,212,255,0.3)",
      borderRadius: 8, padding: "10px 14px", maxWidth: 280, backdropFilter: "blur(8px)"
    }}>
      <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 4 }}>{d.date}, 2024</div>
      <div style={{ color: "#00d4ff", fontSize: 16, fontWeight: 700 }}>
        ${d.price.toLocaleString()}
      </div>
      {arts.map(a => (
        <div key={a.id} style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: 11, color: CATEGORIES[a.cat].color, fontWeight: 600 }}>{a.cat}</div>
          <div style={{ fontSize: 12, color: "#e2e8f0", marginTop: 2 }}>{a.title}</div>
        </div>
      ))}
    </div>
  );
};

export default function App() {
  const [view, setView] = useState("constellation");
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const svgRef = useRef(null);
  const [dims, setDims] = useState({ w: 800, h: 520 });
  const [timelineHover, setTimelineHover] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const positions = getConstellationPositions(dims.w, dims.h);
  const activeArticle = selected ? ARTICLES.find(a => a.id === selected) : hovered ? ARTICLES.find(a => a.id === hovered) : null;

  const connectedIds = new Set();
  if (hovered || selected) {
    const target = selected || hovered;
    CONNECTIONS.forEach(([a, b]) => {
      if (a === target) connectedIds.add(b);
      if (b === target) connectedIds.add(a);
    });
    connectedIds.add(target);
  }

  const articleDots = ARTICLES.map(a => {
    const pricePoint = articlePriceMap[a.id];
    return { ...a, priceDate: pricePoint?.date, price: pricePoint?.price };
  }).filter(a => a.priceDate);

  const catCounts = {};
  ARTICLES.forEach(a => { catCounts[a.cat] = (catCounts[a.cat] || 0) + 1; });

  return (
    <div style={{
      minHeight: "100vh", background: "#060911",
      fontFamily: "'Crimson Pro', 'Georgia', serif",
      color: "#e2e8f0", overflow: "hidden", position: "relative",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@300;400;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Ambient background */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 30% 20%, rgba(0,212,255,0.03) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(168,85,247,0.03) 0%, transparent 60%)",
      }} />
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.15,
        backgroundImage: "radial-gradient(rgba(0,212,255,0.15) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* Header */}
      <div style={{
        textAlign: "center", padding: "40px 20px 0",
        opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(-20px)",
        transition: "all 1s ease",
      }}>
        <div style={{
          fontSize: 11, letterSpacing: 6, textTransform: "uppercase",
          color: "#00d4ff", fontFamily: "'JetBrains Mono', monospace", marginBottom: 12,
          fontWeight: 500,
        }}>
          ✦ A Visual Chronicle ✦
        </div>
        <h1 style={{
          fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 300, margin: "0 0 6px",
          background: "linear-gradient(135deg, #e2e8f0 0%, #00d4ff 50%, #a855f7 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          lineHeight: 1.15,
        }}>
          Samyuktha Sriram
        </h1>
        <p style={{
          fontSize: 15, color: "#64748b", margin: "0 0 4px", fontWeight: 400,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          20 Stories · 7 Months · Unchained Crypto
        </p>
        <p style={{
          fontSize: 13, color: "#475569", margin: "0 0 24px", fontStyle: "italic", maxWidth: 500, marginInline: "auto",
        }}>
          February – August 2024: Covering the moments that moved markets
        </p>

        {/* View toggle */}
        <div style={{
          display: "inline-flex", gap: 0, borderRadius: 8,
          border: "1px solid rgba(0,212,255,0.2)", overflow: "hidden",
        }}>
          {[
            { key: "constellation", label: "✧ Constellation" },
            { key: "timeline", label: "◈ Timeline" },
          ].map(v => (
            <button key={v.key} onClick={() => { setView(v.key); setSelected(null); setHovered(null); }}
              style={{
                padding: "10px 24px", fontSize: 13, cursor: "pointer", border: "none",
                fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, letterSpacing: 0.5,
                background: view === v.key ? "rgba(0,212,255,0.12)" : "transparent",
                color: view === v.key ? "#00d4ff" : "#64748b",
                transition: "all 0.3s ease",
              }}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Constellation View */}
      {view === "constellation" && (
        <div style={{
          padding: "20px", maxWidth: 900, margin: "0 auto",
          opacity: loaded ? 1 : 0, transition: "opacity 0.8s ease 0.3s",
        }}>
          <svg ref={svgRef} viewBox={`0 0 ${dims.w} ${dims.h}`}
            style={{ width: "100%", height: "auto", cursor: "default" }}>
            <defs>
              {Object.entries(CATEGORIES).map(([name, { color }]) => (
                <radialGradient key={name} id={`glow-${name.replace(/\W/g, '')}`}>
                  <stop offset="0%" stopColor={color} stopOpacity="0.6" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </radialGradient>
              ))}
              <filter id="softglow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* connections */}
            {CONNECTIONS.map(([a, b], i) => {
              const pa = positions[a], pb = positions[b];
              const isActive = connectedIds.has(a) && connectedIds.has(b);
              const isDimmed = (hovered || selected) && !isActive;
              return (
                <line key={i} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                  stroke={isActive ? "rgba(0,212,255,0.4)" : "rgba(255,255,255,0.06)"}
                  strokeWidth={isActive ? 1.5 : 0.5}
                  opacity={isDimmed ? 0.15 : 1}
                  style={{ transition: "all 0.4s ease" }}
                />
              );
            })}

            {/* Category labels */}
            {Object.entries(CATEGORIES).map(([name, { color }]) => {
              const arts = ARTICLES.filter(a => a.cat === name);
              const avgX = arts.reduce((s, a) => s + positions[a.id].x, 0) / arts.length;
              const avgY = arts.reduce((s, a) => s + positions[a.id].y, 0) / arts.length;
              return (
                <text key={name} x={avgX} y={avgY - 45}
                  textAnchor="middle" fill={color} fontSize="9"
                  fontFamily="'JetBrains Mono', monospace" fontWeight="500"
                  opacity={(hovered || selected) ? 0.2 : 0.6}
                  letterSpacing="1.5"
                  style={{ textTransform: "uppercase", transition: "opacity 0.3s" }}
                >
                  {name}
                </text>
              );
            })}

            {/* nodes */}
            {ARTICLES.map(a => {
              const pos = positions[a.id];
              const cat = CATEGORIES[a.cat];
              const isActive = !hovered && !selected || connectedIds.has(a.id);
              const isTarget = a.id === (selected || hovered);
              return (
                <g key={a.id}
                  onMouseEnter={() => !selected && setHovered(a.id)}
                  onMouseLeave={() => !selected && setHovered(null)}
                  onClick={() => setSelected(selected === a.id ? null : a.id)}
                  style={{ cursor: "pointer", transition: "opacity 0.3s" }}
                  opacity={isActive ? 1 : 0.15}
                >
                  {/* outer glow */}
                  <circle cx={pos.x} cy={pos.y} r={isTarget ? 28 : 18}
                    fill={`url(#glow-${a.cat.replace(/\W/g, '')})`}
                    opacity={isTarget ? 0.8 : 0.3}
                    style={{ transition: "all 0.3s ease" }}
                  />
                  {/* node */}
                  <circle cx={pos.x} cy={pos.y} r={isTarget ? 7 : 5}
                    fill={cat.color} filter="url(#softglow)"
                    stroke={isTarget ? "#fff" : "transparent"} strokeWidth={1}
                    style={{ transition: "all 0.3s ease" }}
                  />
                  {/* label on hover */}
                  {isTarget && (
                    <foreignObject x={pos.x - 110} y={pos.y + 12} width={220} height={60}>
                      <div style={{
                        textAlign: "center", fontSize: 10, color: "#e2e8f0",
                        fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.3,
                        textShadow: "0 0 20px rgba(0,0,0,0.9)",
                      }}>
                        {a.title.length > 55 ? a.title.slice(0, 55) + "…" : a.title}
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Article detail card */}
          {activeArticle && (
            <div style={{
              margin: "0 auto", maxWidth: 500, padding: "16px 20px",
              background: "rgba(15,20,35,0.9)", border: `1px solid ${CATEGORIES[activeArticle.cat].color}33`,
              borderRadius: 12, backdropFilter: "blur(12px)",
              animation: "fadeIn 0.3s ease",
            }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: CATEGORIES[activeArticle.cat].color,
                  boxShadow: `0 0 8px ${CATEGORIES[activeArticle.cat].glow}`,
                }} />
                <span style={{
                  fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
                  color: CATEGORIES[activeArticle.cat].color, letterSpacing: 1,
                  textTransform: "uppercase", fontWeight: 600,
                }}>
                  {activeArticle.cat}
                </span>
                <span style={{ fontSize: 10, color: "#475569", fontFamily: "'JetBrains Mono', monospace", marginLeft: "auto" }}>
                  {formatDate(activeArticle.date)}
                </span>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 6px", lineHeight: 1.3, color: "#f1f5f9" }}>
                {activeArticle.title}
              </h3>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.5, fontWeight: 300 }}>
                {activeArticle.brief}
              </p>
            </div>
          )}

          {!activeArticle && (
            <p style={{
              textAlign: "center", fontSize: 12, color: "#475569",
              fontFamily: "'JetBrains Mono', monospace", marginTop: 8,
            }}>
              Hover or tap a star to explore · Lines show thematic connections
            </p>
          )}

          {/* Legend */}
          <div style={{
            display: "flex", flexWrap: "wrap", justifyContent: "center",
            gap: "12px 20px", marginTop: 16,
          }}>
            {Object.entries(CATEGORIES).map(([name, { color }]) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%", background: color,
                  boxShadow: `0 0 6px ${color}66`,
                }} />
                <span style={{
                  fontSize: 10, color: "#64748b",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {name} ({catCounts[name]})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline View */}
      {view === "timeline" && (
        <div style={{
          padding: "24px 20px 40px", maxWidth: 900, margin: "0 auto",
          opacity: loaded ? 1 : 0, transition: "opacity 0.8s ease 0.3s",
        }}>
          <div style={{
            fontSize: 11, textAlign: "center", color: "#475569",
            fontFamily: "'JetBrains Mono', monospace", marginBottom: 16, letterSpacing: 1,
          }}>
            BITCOIN PRICE vs. SAMYUKTHA'S ARTICLES · FEB–AUG 2024
          </div>

          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <LineChart data={BTC_PRICE} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00d4ff" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#475569", fontFamily: "'JetBrains Mono'" }}
                  axisLine={{ stroke: "#1e293b" }} tickLine={false} interval={3} />
                <YAxis tick={{ fontSize: 10, fill: "#475569", fontFamily: "'JetBrains Mono'" }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => `$${(v/1000).toFixed(0)}k`}
                  domain={[40000, 76000]} width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="price" stroke="url(#priceGrad)"
                  strokeWidth={2.5} dot={false} />
                {articleDots.map(a => (
                  <ReferenceDot key={a.id} x={a.priceDate} y={a.price}
                    r={timelineHover === a.id ? 7 : 5}
                    fill={CATEGORIES[a.cat].color}
                    stroke={timelineHover === a.id ? "#fff" : "rgba(0,0,0,0.5)"}
                    strokeWidth={timelineHover === a.id ? 2 : 1}
                    onMouseEnter={() => setTimelineHover(a.id)}
                    onMouseLeave={() => setTimelineHover(null)}
                    style={{ cursor: "pointer", filter: `drop-shadow(0 0 4px ${CATEGORIES[a.cat].glow})` }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Article timeline hover card */}
          {timelineHover && (() => {
            const a = ARTICLES.find(x => x.id === timelineHover);
            if (!a) return null;
            return (
              <div style={{
                margin: "0 auto", maxWidth: 500, padding: "14px 18px",
                background: "rgba(15,20,35,0.9)", border: `1px solid ${CATEGORIES[a.cat].color}33`,
                borderRadius: 10, backdropFilter: "blur(12px)",
              }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%", background: CATEGORIES[a.cat].color,
                    boxShadow: `0 0 6px ${CATEGORIES[a.cat].glow}`,
                  }} />
                  <span style={{
                    fontSize: 10, fontFamily: "'JetBrains Mono'", fontWeight: 600,
                    color: CATEGORIES[a.cat].color, textTransform: "uppercase", letterSpacing: 1,
                  }}>{a.cat}</span>
                  <span style={{ fontSize: 10, color: "#475569", fontFamily: "'JetBrains Mono'", marginLeft: "auto" }}>
                    {formatDate(a.date)} · BTC ${articlePriceMap[a.id]?.price?.toLocaleString()}
                  </span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px", color: "#f1f5f9" }}>{a.title}</h3>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, lineHeight: 1.5, fontWeight: 300 }}>{a.brief}</p>
              </div>
            );
          })()}

          {!timelineHover && (
            <p style={{
              textAlign: "center", fontSize: 12, color: "#475569",
              fontFamily: "'JetBrains Mono', monospace", marginTop: 8,
            }}>
              Each dot is an article — hover to see what she wrote when BTC was there
            </p>
          )}

          {/* Scrollable article list */}
          <div style={{ marginTop: 24 }}>
            <div style={{
              fontSize: 10, color: "#475569", fontFamily: "'JetBrains Mono'",
              textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, textAlign: "center",
            }}>
              All 20 Articles — newest first
            </div>
            <div style={{
              display: "grid", gap: 6, maxHeight: 300, overflowY: "auto",
              paddingRight: 8,
            }}>
              {ARTICLES.map((a, i) => (
                <div key={a.id}
                  onMouseEnter={() => setTimelineHover(a.id)}
                  onMouseLeave={() => setTimelineHover(null)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 12px", borderRadius: 8, cursor: "pointer",
                    background: timelineHover === a.id ? "rgba(0,212,255,0.06)" : "rgba(15,20,35,0.5)",
                    border: `1px solid ${timelineHover === a.id ? CATEGORIES[a.cat].color + "33" : "rgba(255,255,255,0.03)"}`,
                    transition: "all 0.2s ease",
                  }}>
                  <span style={{
                    fontSize: 10, color: "#334155", fontFamily: "'JetBrains Mono'",
                    fontWeight: 500, minWidth: 18,
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                    background: CATEGORIES[a.cat].color,
                    boxShadow: `0 0 4px ${CATEGORIES[a.cat].glow}`,
                  }} />
                  <span style={{
                    fontSize: 12, color: "#cbd5e1", flex: 1, lineHeight: 1.3,
                  }}>
                    {a.title}
                  </span>
                  <span style={{
                    fontSize: 10, color: "#475569", fontFamily: "'JetBrains Mono'",
                    flexShrink: 0,
                  }}>
                    {formatDate(a.date)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        textAlign: "center", padding: "30px 20px 40px", color: "#1e293b",
        fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
      }}>
        Made with care by a friend who reads every article ✦
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
      `}</style>
    </div>
  );
}
