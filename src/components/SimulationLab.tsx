import React, { useState, useMemo } from 'react';
import { MathView } from './MathView';
import { 
  RotateCcw, 
  ArrowDownUp, 
  Eye, 
  Sliders, 
  Zap, 
  Layers
} from 'lucide-react';

export const SimulationLab: React.FC = () => {
  // Interactive State
  const [span, setSpan] = useState<number>(500); // L in meters
  const [sag, setSag] = useState<number>(50); // f in meters
  const [unitWeight, setUnitWeight] = useState<number>(100); // kN/m (deck + cable)
  const [isArchMode, setIsArchMode] = useState<boolean>(false);
  const [showHangers, setShowHangers] = useState<boolean>(true);
  const [showErrorArea, setShowErrorArea] = useState<boolean>(true);
  const [showTaylor, setShowTaylor] = useState<boolean>(false);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [hoverX, setHoverX] = useState<number | null>(null);

  // Numerical solution for Catenary parameter 'a':
  // f = a * (cosh(L / (2a)) - 1)
  // Let u = L / (2a). Then (cosh(u) - 1) / u = (2f) / L
  const catenaryParamA = useMemo(() => {
    const target = (2 * sag) / span;
    let low = 0.0001;
    let high = 20.0;
    for (let i = 0; i < 35; i++) {
      const mid = (low + high) / 2;
      const val = (Math.cosh(mid) - 1) / mid;
      if (val < target) {
        low = mid;
      } else {
        high = mid;
      }
    }
    const u = (low + high) / 2;
    return (span / 2) / u;
  }, [span, sag]);

  // Derived physics values
  const halfSpan = span / 2;
  const sagRatio = sag / span;

  // Horizontal tension T0 = w * a
  const T0 = unitWeight * catenaryParamA;
  // Maximum tension at support: T_max = T0 * cosh(halfSpan / catenaryParamA)
  const Tmax = T0 * Math.cosh(halfSpan / catenaryParamA);
  // Maximum slope angle at support: tan(theta) = sinh(halfSpan / a)
  const maxSlopeDeg = (Math.atan(Math.sinh(halfSpan / catenaryParamA)) * 180) / Math.PI;

  // Maximum divergence between Catenary and Parabola occurs at roughly x = 0.5 ~ 0.6 * halfSpan
  const { maxDeltaY, maxDeltaPercent, maxDeltaX } = useMemo(() => {
    let maxDiff = 0;
    let atX = 0;
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * halfSpan;
      const yCat = catenaryParamA * (Math.cosh(x / catenaryParamA) - 1);
      const yPar = (sag / (halfSpan * halfSpan)) * (x * x);
      const diff = Math.abs(yCat - yPar);
      if (diff > maxDiff) {
        maxDiff = diff;
        atX = x;
      }
    }
    const percent = (maxDiff / sag) * 100;
    return { maxDeltaY: maxDiff, maxDeltaPercent: percent, maxDeltaX: atX };
  }, [catenaryParamA, sag, halfSpan]);

  // SVG coordinate transformation
  const svgWidth = 840;
  const svgHeight = 360;
  const paddingX = 70;
  const paddingTop = 45;
  const paddingBottom = 55;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  // Mapping x in [-halfSpan, halfSpan] to SVG X
  const toSvgX = (x: number) => paddingX + ((x + halfSpan) / span) * plotWidth;
  // Mapping y in [0, sag * 1.1] to SVG Y
  const maxPlotY = sag * 1.15;
  const toSvgY = (yVal: number) => {
    if (isArchMode) {
      // In Arch mode: ground at bottom, apex at top
      // y=0 is at bottom (abutment level), y=sag is apex
      return svgHeight - paddingBottom - (yVal / maxPlotY) * plotHeight;
    } else {
      // In Suspension mode: cable lowest at center (y=0), highest at towers (y=sag)
      // center is at bottom of sag, towers at top
      return paddingTop + ((sag - yVal) / maxPlotY) * plotHeight;
    }
  };

  // Generate paths
  const numSamplePoints = 120;
  const catenaryPoints: [number, number][] = [];
  const parabolaPoints: [number, number][] = [];
  const taylorPoints: [number, number][] = [];

  for (let i = 0; i <= numSamplePoints; i++) {
    const x = -halfSpan + (i / numSamplePoints) * span;
    const yCat = catenaryParamA * (Math.cosh(x / catenaryParamA) - 1);
    const yPar = (sag / (halfSpan * halfSpan)) * (x * x);
    const yTay = (x * x) / (2 * catenaryParamA);

    // In suspension: f(0)=0 (lowest), f(+-L/2)=sag (highest). We plot sag - y for visual sag
    const yDispCat = isArchMode ? (sag - yCat) : (sag - yCat);
    const yDispPar = isArchMode ? (sag - yPar) : (sag - yPar);
    const yDispTay = isArchMode ? (sag - yTay) : (sag - yTay);

    catenaryPoints.push([toSvgX(x), toSvgY(yDispCat)]);
    parabolaPoints.push([toSvgX(x), toSvgY(yDispPar)]);
    taylorPoints.push([toSvgX(x), toSvgY(yDispTay)]);
  }

  const catenaryPathD = catenaryPoints.reduce(
    (acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt[0].toFixed(1)},${pt[1].toFixed(1)}`,
    ''
  );
  const parabolaPathD = parabolaPoints.reduce(
    (acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt[0].toFixed(1)},${pt[1].toFixed(1)}`,
    ''
  );
  const taylorPathD = taylorPoints.reduce(
    (acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt[0].toFixed(1)},${pt[1].toFixed(1)}`,
    ''
  );

  // Error area polygon (between catenary and parabola)
  const errorAreaD = useMemo(() => {
    let d = catenaryPoints.reduce(
      (acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt[0].toFixed(1)},${pt[1].toFixed(1)}`,
      ''
    );
    for (let i = parabolaPoints.length - 1; i >= 0; i--) {
      d += ` L ${parabolaPoints[i][0].toFixed(1)},${parabolaPoints[i][1].toFixed(1)}`;
    }
    d += ' Z';
    return d;
  }, [catenaryPoints, parabolaPoints]);

  // Hanger lines
  const hangerXPositions = useMemo(() => {
    const list = [];
    const numHangers = 19;
    for (let i = 1; i <= numHangers; i++) {
      const frac = i / (numHangers + 1);
      const x = -halfSpan + frac * span;
      list.push(x);
    }
    return list;
  }, [halfSpan, span]);

  // Hover point calculations
  const hoverData = useMemo(() => {
    if (hoverX === null) return null;
    const x = Math.max(-halfSpan, Math.min(halfSpan, hoverX));
    const yCat = catenaryParamA * (Math.cosh(x / catenaryParamA) - 1);
    const yPar = (sag / (halfSpan * halfSpan)) * (x * x);
    const diff = Math.abs(yCat - yPar);
    return {
      x,
      yCat,
      yPar,
      diff,
      diffPercent: (diff / sag) * 100,
    };
  }, [hoverX, halfSpan, catenaryParamA, sag]);

  // Quick preset loader
  const applyPreset = (presetL: number, presetF: number, arch: boolean) => {
    setSpan(presetL);
    setSag(presetF);
    setIsArchMode(arch);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header and Mode Segmented Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CompassIcon className="w-5 h-5 text-sky-600" />
            인터랙티브 곡선 실험실 (고교 수학 & 과학 탐구)
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            줄 혼자 늘어뜨린 <strong>[현수선]</strong>과 도로를 매단 <strong>[2차 포물선]</strong>의 모양 차이를 직접 슬라이더를 움직이며 눈으로 확인해 보세요!
          </p>
        </div>

        {/* Structural Inversion Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setIsArchMode(false)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                !isArchMode
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              현수교 모드 (U자 줄 당기기)
            </button>
            <button
              onClick={() => setIsArchMode(true)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                isArchMode
                  ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              아치교 모드 (거꾸로 뒤집기)
            </button>
          </div>
        </div>
      </div>

      {/* Preset Quick Selectors */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
        <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap font-medium flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          실제 교량 프리셋:
        </span>
        <button
          onClick={() => applyPreset(500, 50, false)}
          className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap cursor-pointer"
        >
          광안대교 (L=500m, f=50m)
        </button>
        <button
          onClick={() => applyPreset(1280, 152, false)}
          className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap cursor-pointer"
        >
          골든게이트교 (L=1280m, f=152m)
        </button>
        <button
          onClick={() => applyPreset(192, 192, true)}
          className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap cursor-pointer"
        >
          게이트웨이 아치 (L=192m, f=192m)
        </button>
        <button
          onClick={() => applyPreset(400, 180, false)}
          className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 rounded-md hover:bg-amber-100 transition-colors whitespace-nowrap cursor-pointer font-medium"
        >
          고처짐 극단 비교 (L=400m, f=180m, 차이 10%+)
        </button>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Interactive Canvas Stage (7 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs relative">
            {/* Canvas Sub-header */}
            <div className="flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 font-medium text-sky-600 dark:text-sky-400">
                  <span className="w-3 h-1 bg-sky-600 rounded-full" />
                  쌍곡코사인 현수선 (cosh)
                </span>
                <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="w-3 h-1 bg-emerald-600 rounded-full border-b border-dashed" />
                  2차 포물선 (Parabola)
                </span>
                {showTaylor && (
                  <span className="flex items-center gap-1.5 font-medium text-purple-600 dark:text-purple-400">
                    <span className="w-3 h-1 bg-purple-600 rounded-full" />
                    테일러 2차 근사
                  </span>
                )}
              </div>
              <div className="text-slate-500 font-mono text-[11px] tabular-nums">
                처짐비(f/L): <strong>{sagRatio.toFixed(3)}</strong> (1:{Math.round(1 / sagRatio)})
              </div>
            </div>

            {/* SVG Interactive Canvas */}
            <div className="relative w-full overflow-hidden bg-slate-950 rounded-xl border border-slate-800">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto cursor-crosshair select-none"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clientX = e.clientX - rect.left;
                  const ratio = clientX / rect.width;
                  const svgCoordX = ratio * svgWidth;
                  const clampedX = Math.max(paddingX, Math.min(svgWidth - paddingX, svgCoordX));
                  const realX = ((clampedX - paddingX) / plotWidth) * span - halfSpan;
                  setHoverX(realX);
                }}
                onMouseLeave={() => setHoverX(null)}
              >
                {/* Background Grid Lines */}
                <defs>
                  <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="url(#grid)" />

                {/* Ground / Water line */}
                <line
                  x1={paddingX - 30}
                  y1={svgHeight - paddingBottom + (isArchMode ? 0 : 20)}
                  x2={svgWidth - paddingX + 30}
                  y2={svgHeight - paddingBottom + (isArchMode ? 0 : 20)}
                  stroke="#334155"
                  strokeWidth="2"
                />

                {/* Towers or Abutments */}
                {!isArchMode ? (
                  // Suspension Pylons
                  <>
                    <rect
                      x={toSvgX(-halfSpan) - 8}
                      y={toSvgY(sag) - 10}
                      width="16"
                      height={svgHeight - paddingBottom - toSvgY(sag) + 20}
                      fill="#475569"
                      rx="2"
                    />
                    <rect
                      x={toSvgX(halfSpan) - 8}
                      y={toSvgY(sag) - 10}
                      width="16"
                      height={svgHeight - paddingBottom - toSvgY(sag) + 20}
                      fill="#475569"
                      rx="2"
                    />
                    {/* Bridge Deck Girder */}
                    <rect
                      x={paddingX}
                      y={toSvgY(0) + 10}
                      width={plotWidth}
                      height="10"
                      fill="#94a3b8"
                      rx="1"
                    />
                  </>
                ) : (
                  // Arch Springing Abutments
                  <>
                    <polygon
                      points={`${toSvgX(-halfSpan)-20},${svgHeight - paddingBottom + 10} ${toSvgX(-halfSpan)+10},${svgHeight - paddingBottom + 10} ${toSvgX(-halfSpan)},${toSvgY(0)}`}
                      fill="#64748b"
                    />
                    <polygon
                      points={`${toSvgX(halfSpan)-10},${svgHeight - paddingBottom + 10} ${toSvgX(halfSpan)+20},${svgHeight - paddingBottom + 10} ${toSvgX(halfSpan)},${toSvgY(0)}`}
                      fill="#64748b"
                    />
                    {/* Deck on top of Arch */}
                    <rect
                      x={paddingX}
                      y={toSvgY(sag) - 15}
                      width={plotWidth}
                      height="8"
                      fill="#94a3b8"
                    />
                  </>
                )}

                {/* Hanger cables / Spandrel columns */}
                {showHangers &&
                  hangerXPositions.map((hx, idx) => {
                    const sx = toSvgX(hx);
                    const yCat = catenaryParamA * (Math.cosh(hx / catenaryParamA) - 1);
                    const sy = toSvgY(isArchMode ? sag - yCat : sag - yCat);
                    const deckY = isArchMode ? toSvgY(sag) - 15 : toSvgY(0) + 10;
                    return (
                      <line
                        key={idx}
                        x1={sx}
                        y1={sy}
                        x2={sx}
                        y2={deckY}
                        stroke="#64748b"
                        strokeWidth="1.2"
                        strokeDasharray={isArchMode ? 'none' : '2,2'}
                      />
                    );
                  })}

                {/* Error area between Catenary and Parabola */}
                {showErrorArea && (
                  <path d={errorAreaD} fill="#f43f5e" fillOpacity="0.22" />
                )}

                {/* Taylor 2nd order curve */}
                {showTaylor && (
                  <path
                    d={taylorPathD}
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="2"
                    strokeDasharray="4,3"
                  />
                )}

                {/* Parabola Path */}
                <path
                  d={parabolaPathD}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeDasharray="6,4"
                />

                {/* Catenary Path */}
                <path
                  d={catenaryPathD}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3.2"
                />

                {/* Tension / Thrust Vectors at Support */}
                {showVectors && (
                  <>
                    {/* Left support vector */}
                    <g transform={`translate(${toSvgX(-halfSpan)}, ${toSvgY(isArchMode ? 0 : sag)})`}>
                      <line
                        x1="0"
                        y1="0"
                        x2={isArchMode ? "40" : "-40"}
                        y2={isArchMode ? "-30" : "-30"}
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                        markerEnd="url(#arrow)"
                      />
                      <text
                        x={isArchMode ? "45" : "-55"}
                        y="-35"
                        fill="#fbbf24"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {isArchMode ? '추력 H' : '장력 T_max'}
                      </text>
                    </g>
                    {/* Central minimum tension vector */}
                    <g transform={`translate(${toSvgX(0)}, ${toSvgY(isArchMode ? sag : 0)})`}>
                      <line
                        x1="-25"
                        y1="0"
                        x2="25"
                        y2="0"
                        stroke="#38bdf8"
                        strokeWidth="2"
                      />
                      <text
                        x="-15"
                        y={isArchMode ? "-10" : "20"}
                        fill="#38bdf8"
                        fontSize="10"
                        fontFamily="monospace"
                      >
                        T₀ = {Math.round(T0 / 1000)} MN
                      </text>
                    </g>
                  </>
                )}

                {/* Hover line & tooltip */}
                {hoverData && (
                  <g>
                    <line
                      x1={toSvgX(hoverData.x)}
                      y1={paddingTop}
                      x2={toSvgX(hoverData.x)}
                      y2={svgHeight - paddingBottom}
                      stroke="#f8fafc"
                      strokeWidth="1"
                      strokeDasharray="3,3"
                    />
                    <circle
                      cx={toSvgX(hoverData.x)}
                      cy={toSvgY(isArchMode ? sag - hoverData.yCat : sag - hoverData.yCat)}
                      r="4.5"
                      fill="#38bdf8"
                    />
                    <circle
                      cx={toSvgX(hoverData.x)}
                      cy={toSvgY(isArchMode ? sag - hoverData.yPar : sag - hoverData.yPar)}
                      r="4.5"
                      fill="#10b981"
                    />
                  </g>
                )}
              </svg>

              {/* Real-time Hover Readout Floating Overlay */}
              {hoverData && (
                <div className="absolute top-3 right-3 bg-slate-900/95 text-white p-3 rounded-xl border border-slate-700 text-xs font-mono space-y-1 shadow-lg backdrop-blur-xs pointer-events-none">
                  <div className="text-slate-400 font-sans font-semibold">
                    위치 x = {hoverData.x.toFixed(1)} m
                  </div>
                  <div className="text-sky-300">
                    현수선 y: {hoverData.yCat.toFixed(3)} m
                  </div>
                  <div className="text-emerald-300">
                    포물선 y: {hoverData.yPar.toFixed(3)} m
                  </div>
                  <div className="text-rose-400 font-bold border-t border-slate-800 pt-1">
                    오차 Δy: {hoverData.diff.toFixed(3)} m ({hoverData.diffPercent.toFixed(2)}%)
                  </div>
                </div>
              )}
            </div>

            {/* Canvas Bottom Legend and Layer Toggles */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-100 dark:border-slate-800/80 pt-3">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={showHangers}
                    onChange={(e) => setShowHangers(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>수직 행어(Hanger)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={showErrorArea}
                    onChange={(e) => setShowErrorArea(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>오차 영역(음영)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={showTaylor}
                    onChange={(e) => setShowTaylor(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>테일러 2차식</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={showVectors}
                    onChange={(e) => setShowVectors(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>반력 벡터</span>
                </label>
              </div>

              <button
                onClick={() => {
                  setSpan(500);
                  setSag(50);
                  setIsArchMode(false);
                }}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                기본값 초기화
              </button>
            </div>
          </div>
        </div>

        {/* Right Engineering Controls & Real-Time Readouts (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Sliders Panel */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              기하학적 및 역학 매개변수 조절
            </h3>

            {/* Span L Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">지간장 (Span, L)</span>
                <span className="font-mono font-bold text-sky-600 dark:text-sky-400 tabular-nums">{span} m</span>
              </div>
              <input
                type="range"
                min="100"
                max="2000"
                step="20"
                value={span}
                onChange={(e) => setSpan(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>100m</span>
                <span>1,000m</span>
                <span>2,000m</span>
              </div>
            </div>

            {/* Sag f Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {isArchMode ? '아치 라이즈 높이 (Rise, f)' : '케이블 처짐 (Sag, f)'}
                </span>
                <span className="font-mono font-bold text-sky-600 dark:text-sky-400 tabular-nums">{sag} m</span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                step="5"
                value={sag}
                onChange={(e) => setSag(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>10m (완만함)</span>
                <span>150m</span>
                <span>300m (극단 처짐)</span>
              </div>
            </div>

            {/* Unit Load w Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">단위 하중 (Total Load, w)</span>
                <span className="font-mono font-bold text-sky-600 dark:text-sky-400 tabular-nums">{unitWeight} kN/m</span>
              </div>
              <input
                type="range"
                min="20"
                max="300"
                step="10"
                value={unitWeight}
                onChange={(e) => setUnitWeight(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Quantitative Real-Time Engineering Metrics */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              물리학 I 힘의 계산 결과 (Forces & Metrics)
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">곡선 완만도 (파라미터 a)</span>
                <span className="text-base font-mono font-bold text-sky-600 dark:text-sky-400 tabular-nums">
                  {catenaryParamA.toFixed(1)} <small className="text-xs font-normal">m</small>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">가운데 수평 당김 힘 (T₀)</span>
                <span className="text-base font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  {(T0 / 1000).toFixed(2)} <small className="text-xs font-normal">MN</small>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">탑 꼭대기 최대 장력 (T_max)</span>
                <span className="text-base font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  {(Tmax / 1000).toFixed(2)} <small className="text-xs font-normal">MN</small>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">탑 지점 줄의 기울기 각도</span>
                <span className="text-base font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  {maxSlopeDeg.toFixed(1)}°
                </span>
              </div>
            </div>

            {/* Error Analysis Bar */}
            <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-rose-900 dark:text-rose-200">
                  현수선과 2차 포물선의 높이 차이
                </span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                  {maxDeltaY < 1 ? `${(maxDeltaY * 100).toFixed(1)} cm` : `${maxDeltaY.toFixed(2)} m`}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-rose-700 dark:text-rose-300">
                <span>전체 처짐 대비 차이 비율:</span>
                <span className="font-mono font-bold tabular-nums">{maxDeltaPercent.toFixed(2)}%</span>
              </div>
              <p className="text-[11px] text-rose-800/80 dark:text-rose-300/80 leading-relaxed pt-1">
                {maxDeltaPercent < 1.0 ? (
                  <>현재 조건에서는 두 곡선의 차이가 <strong>1% 미만</strong>입니다! 우리 눈으로 구별할 수 없었던 것은 당연하며, 2차함수로 다뤄도 충분히 정확합니다.</>
                ) : (
                  <>줄을 빨랫줄처럼 깊게 늘어뜨리자 오차가 <strong>{maxDeltaPercent.toFixed(1)}%</strong>로 커졌습니다! 줄이 가팔라질수록 2차함수와 현수선의 차이가 눈에 띄게 벌어집니다.</>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function CompassIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
