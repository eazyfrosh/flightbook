"use client";

import { motion } from "framer-motion";

/**
 * Stylized, abstract world map (soft continent silhouettes, not precise
 * geography) with a handful of flight-path arcs between hub cities.
 * Original illustration, matching the flight-path motif in the hero.
 */
const continents = [
  // North America: broad Canada/Alaska top, narrowing through the US to a Mexico point
  "M70,55 C45,50 25,75 30,105 C20,120 15,150 30,168 C25,190 40,205 60,200 C65,225 85,235 100,255 C110,275 122,278 128,260 C140,240 132,215 148,198 C168,178 172,148 158,122 C170,100 160,72 135,62 C115,48 90,60 70,55 Z",
  // South America: tapering teardrop
  "M172,290 C158,300 150,325 158,355 C150,385 155,420 172,442 C182,456 196,452 200,432 C214,414 218,385 208,360 C216,335 210,305 192,292 C185,286 178,286 172,290 Z",
  // Europe: compact, north of Africa with a clear Mediterranean gap
  "M472,80 C458,86 452,102 460,116 C452,128 458,142 474,144 C490,150 512,146 524,134 C538,130 540,112 528,100 C532,86 518,74 500,76 C490,70 480,74 472,80 Z",
  // Africa: sits clearly below Europe, wider at the top, tapering to a point
  "M470,160 C450,172 444,200 452,228 C444,252 448,280 460,306 C468,328 480,344 494,338 C504,352 518,348 520,330 C534,312 538,282 528,258 C536,232 534,202 518,180 C512,162 496,150 480,154 C476,155 473,158 470,160 Z",
  // Asia: the largest landmass, spanning well east of Europe/Africa with an Indian subcontinent taper
  "M560,70 C540,60 538,85 548,100 C534,112 536,135 552,148 C544,168 552,192 572,200 C582,222 600,230 610,212 C628,220 650,212 648,192 C672,196 700,190 715,172 C740,168 768,158 778,138 C796,128 802,104 782,90 C790,68 772,50 748,54 C728,40 698,44 682,58 C660,48 630,52 616,66 C596,56 572,58 560,70 Z",
  // Australia
  "M780,318 C762,326 754,346 764,364 C756,382 766,402 786,406 C804,414 828,408 842,394 C862,390 874,372 866,354 C874,336 862,318 842,316 C824,306 796,308 780,318 Z",
];

const routes = [
  { from: [128, 150], to: [495, 108], via: [320, 30] },
  { from: [495, 108], to: [615, 165], via: [560, 80] },
  { from: [615, 165], to: [690, 205], via: [655, 150] },
  { from: [690, 205], to: [812, 360], via: [770, 260] },
  { from: [128, 150], to: [190, 360], via: [120, 260] },
];

const hubs = [
  { x: 128, y: 150, label: "New York" },
  { x: 495, y: 108, label: "London" },
  { x: 615, y: 165, label: "Dubai" },
  { x: 690, y: 205, label: "Singapore" },
  { x: 812, y: 360, label: "Sydney" },
  { x: 190, y: 360, label: "São Paulo" },
];

export function WorldRoutesMap() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-900 via-brand-800 to-brand-900 py-20 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(1.5px_1.5px_at_8%_15%,white,transparent),radial-gradient(1px_1px_at_92%_25%,white,transparent),radial-gradient(1.5px_1.5px_at_30%_80%,white,transparent),radial-gradient(1px_1px_at_70%_85%,white,transparent),radial-gradient(1px_1px_at_50%_10%,white,transparent)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Where we fly</h2>
          <p className="mt-2 text-white/60">A network spanning every continent — mock routes, real ambition</p>
        </div>

        <motion.svg
          viewBox="0 0 900 480"
          className="mx-auto w-full max-w-4xl"
          fill="none"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {continents.map((d, i) => (
            <path key={i} d={d} fill="white" fillOpacity="0.12" />
          ))}

          {routes.map((r, i) => (
            <motion.path
              key={i}
              d={`M${r.from[0]},${r.from[1]} Q${r.via[0]},${r.via[1]} ${r.to[0]},${r.to[1]}`}
              stroke="#f2c265"
              strokeWidth="1.5"
              strokeDasharray="1 7"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.7 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.3 + i * 0.15 }}
            />
          ))}

          {hubs.map((h, i) => (
            <g key={h.label}>
              <motion.circle
                cx={h.x}
                cy={h.y}
                r="4"
                fill="#f2c265"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
              />
              <circle cx={h.x} cy={h.y} r="9" fill="none" stroke="#f2c265" strokeOpacity="0.4" strokeWidth="1" />
              <text
                x={h.x}
                y={h.y - 14}
                textAnchor="middle"
                fill="white"
                fillOpacity="0.75"
                fontSize="12"
                fontWeight="600"
              >
                {h.label}
              </text>
            </g>
          ))}
        </motion.svg>
      </div>
    </section>
  );
}
