import type { ReactNode } from "react";

/**
 * Cartoon burger ingredients for the scroll assembly.
 * Style follows reference 1 (warm cartoon palette, dark outline, cel shading);
 * order and proportions follow reference 3 (bottom→top: bun, lettuce, patty, cheese,
 * red onion, tomato, lettuce, bun). Every layer is centred on the x=200 axis of a
 * 400-wide drawing and is drawn at its assembled position, so a transform of 0 is "assembled".
 */
const OL = "#3B1F12"; // outline
const BUN = "#E8913A", BUN_LIGHT = "#F7BE70", BUN_SHADE = "#C4691F", BUN_CUT = "#F7D193", SESAME = "#FFF3D8";
const LET = "#7BC043", LET_LIGHT = "#AEDF68";
const TOM = "#E2352A", TOM_LIGHT = "#FF7A5E", TOM_SEED = "#FFD7C4";
const ONI = "#9B3F8F", ONI_IN = "#F6E1F2";
const CH = "#FFC52E", CH_LIGHT = "#FFE48A";
const PAT = "#6B3820", PAT_LIGHT = "#90552F", PAT_DARK = "#45200E";

export type BurgerLayer = {
  key: string;
  label: string;
  /** Right-edge point the label's leader line attaches to (drawing units). */
  anchor: [number, number];
  art: ReactNode;
};

const scallops = (y: number, from: number, to: number, step: number, depth: number) => {
  let d = "";
  for (let x = to; x > from; x -= step) d += ` C${x - step * 0.15} ${y + depth} ${x - step * 0.85} ${y + depth} ${x - step} ${y}`;
  return d;
};

const Lettuce = ({ y }: { y: number }) => (
  <>
    <path
      d={`M34 ${y + 6} C60 ${y - 4} 130 ${y - 6} 200 ${y - 6} C270 ${y - 6} 340 ${y - 4} 366 ${y + 6} C372 ${y + 12} 368 ${y + 20} 360 ${y + 20}${scallops(y + 20, 40, 360, 30, 12)} C48 ${y + 22} 28 ${y + 14} 34 ${y + 6} Z`}
      fill={LET}
      stroke={OL}
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    <path d={`M74 ${y + 10} q20 6 40 0 M150 ${y + 8} q24 7 48 0 M232 ${y + 10} q22 6 44 0 M300 ${y + 8} q18 6 36 0`} fill="none" stroke={LET_LIGHT} strokeWidth="3" strokeLinecap="round" />
  </>
);

const TomatoSlice = ({ x }: { x: number }) => (
  <>
    <path
      d={`M${x} 240 C${x} 232 ${x + 36} 228 ${x + 71} 228 C${x + 106} 228 ${x + 142} 232 ${x + 142} 240 L${x + 142} 252 C${x + 142} 260 ${x + 106} 264 ${x + 71} 264 C${x + 36} 264 ${x} 260 ${x} 252 Z`}
      fill={TOM}
      stroke={OL}
      strokeWidth="3.5"
    />
    <path
      d={`M${x + 8} 240 C${x + 8} 235 ${x + 40} 232 ${x + 71} 232 C${x + 102} 232 ${x + 134} 235 ${x + 134} 240 C${x + 134} 245 ${x + 102} 248 ${x + 71} 248 C${x + 40} 248 ${x + 8} 245 ${x + 8} 240 Z`}
      fill={TOM_LIGHT}
    />
    {[x + 44, x + 71, x + 98].map((cx, i) => (
      <ellipse key={cx} cx={cx} cy={i === 1 ? 238 : 241} rx="6" ry="2.4" fill={TOM_SEED} />
    ))}
  </>
);

const SEEDS: [number, number, number][] = [
  [130, 110, -30], [162, 92, -15], [198, 86, 0], [234, 92, 15], [268, 108, 28], [110, 142, -35], [150, 128, -20],
  [188, 120, -5], [224, 124, 10], [260, 134, 25], [292, 148, 35], [138, 164, -20], [200, 154, 0], [252, 164, 18],
  [170, 186, -8], [232, 188, 10],
];

export const BURGER_LAYERS: BurgerLayer[] = [
  {
    key: "bottom-bun",
    label: "Toasted bottom bun",
    anchor: [348, 362],
    art: (
      <>
        <path d="M50 336 C50 330 55 328 62 328 L338 328 C345 328 350 330 350 336 L350 344 C350 368 326 384 296 384 L104 384 C74 384 50 368 50 344 Z" fill={BUN} stroke={OL} strokeWidth="4" />
        <path d="M54 332 L346 332 L346 340 C300 345 100 345 54 340 Z" fill={BUN_CUT} />
        <path d="M60 358 C80 374 110 378 140 378 L260 378 C290 378 320 374 340 358 C332 372 312 381 292 381 L108 381 C88 381 68 372 60 358 Z" fill={BUN_SHADE} />
        <path d="M78 352 C90 362 110 366 130 366" fill="none" stroke={BUN_LIGHT} strokeWidth="5" strokeLinecap="round" />
      </>
    ),
  },
  { key: "lettuce-bottom", label: "Crisp lettuce", anchor: [364, 330], art: <Lettuce y={316} /> },
  {
    key: "patty",
    label: "Grilled beef patty",
    anchor: [356, 306],
    art: (
      <>
        <path d="M44 292 C44 280 56 276 70 276 L330 276 C344 276 356 280 356 292 L356 310 C356 322 344 326 330 326 L70 326 C56 326 44 322 44 310 Z" fill={PAT} stroke={OL} strokeWidth="4" />
        <path d="M62 286 C140 282 260 282 338 286" fill="none" stroke={PAT_LIGHT} strokeWidth="4" strokeLinecap="round" />
        {[[90, 304, 7], [140, 312, 6], [190, 300, 8], [240, 314, 6], [288, 302, 7], [326, 314, 5], [116, 296, 5], [214, 318, 5], [268, 296, 5]].map(([cx, cy, r]) => (
          <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={r} ry={r * 0.55} fill={PAT_LIGHT} />
        ))}
        {[[106, 316], [164, 300], [226, 306], [276, 318], [312, 300], [78, 312]].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.2" fill={PAT_DARK} />
        ))}
      </>
    ),
  },
  {
    key: "cheese",
    label: "Melted cheddar",
    anchor: [360, 274],
    art: (
      <>
        <path
          d="M38 266 L362 266 L356 280 C350 284 344 284 340 280 L326 280 C322 302 306 306 302 282 L262 282 C258 314 236 316 232 284 L180 284 C176 306 158 308 154 284 L112 284 C108 300 92 302 88 282 L60 280 C54 284 46 284 42 278 Z"
          fill={CH}
          stroke={OL}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path d="M58 271 L342 271" stroke={CH_LIGHT} strokeWidth="3" strokeLinecap="round" />
        <path d="M240 288 L240 300 M162 288 L162 296" stroke={CH_LIGHT} strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
  {
    key: "onion",
    label: "Red onion",
    anchor: [340, 262],
    art: (
      <>
        {[[120, 46], [210, 50], [296, 42]].map(([cx, rx]) => (
          <g key={cx}>
            <ellipse cx={cx} cy="262" rx={rx} ry="9" fill={ONI} stroke={OL} strokeWidth="2.5" />
            <ellipse cx={cx} cy="262" rx={rx - 7} ry="5" fill={ONI_IN} />
          </g>
        ))}
      </>
    ),
  },
  {
    key: "tomato",
    label: "Fresh tomato",
    anchor: [336, 248],
    art: (
      <>
        <TomatoSlice x={194} />
        <TomatoSlice x={64} />
      </>
    ),
  },
  { key: "lettuce-top", label: "More lettuce", anchor: [366, 222], art: <Lettuce y={210} /> },
  {
    key: "top-bun",
    label: "Sesame top bun",
    anchor: [340, 168],
    art: (
      <>
        <path d="M54 196 C54 112 122 60 200 60 C278 60 346 112 346 196 C346 208 336 214 322 214 L78 214 C64 214 54 208 54 196 Z" fill={BUN} stroke={OL} strokeWidth="4" />
        <path d="M58 188 C120 204 280 204 342 188 L342 198 C340 208 332 212 322 212 L78 212 C68 212 60 208 58 198 Z" fill={BUN_SHADE} />
        <path d="M92 136 C104 100 138 80 176 74" fill="none" stroke={BUN_LIGHT} strokeWidth="9" strokeLinecap="round" />
        <ellipse cx="196" cy="72" rx="7" ry="3.5" fill={BUN_LIGHT} />
        {SEEDS.map(([cx, cy, r]) => (
          <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx="6" ry="3" fill={SESAME} stroke={OL} strokeWidth="1.5" transform={`rotate(${r} ${cx} ${cy})`} />
        ))}
      </>
    ),
  },
];

/** Drawing window: x 0–400, y 50–394 (assembled burger plus ground shadow). */
export const BURGER_VIEW = { top: 50, height: 344, width: 400 } as const;
