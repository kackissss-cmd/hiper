import React, { useState, useMemo } from 'react';
import { REAL_BRIDGE_PRESETS } from '../data/bridgeData';
import { MathView } from './MathView';
import { Calculator, Check, ArrowRight, ShieldCheck } from 'lucide-react';

export const RealBridgeCalculator: React.FC = () => {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [customSpan, setCustomSpan] = useState<number>(500);
  const [customSag, setCustomSag] = useState<number>(50);
  const [customDeckWeight, setCustomDeckWeight] = useState<number>(80);
  const [customCableWeight, setCustomCableWeight] = useState<number>(8);

  // Apply preset
  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIndex(idx);
    const p = REAL_BRIDGE_PRESETS[idx];
    setCustomSpan(p.span);
    setCustomSag(p.sag);
    setCustomDeckWeight(p.deckWeight);
    setCustomCableWeight(p.cableWeight);
  };

  // Numerical calculations
  const totalWeight = customDeckWeight + customCableWeight; // kN/m
  const halfSpan = customSpan / 2;
  const sagRatio = customSag / customSpan;

  // Parabola horizontal tension: T0_par = (w * L^2) / (8 * f)
  const T0_par = (totalWeight * customSpan * customSpan) / (8 * customSag);
  // Max tension at tower: Tmax_par = T0_par * sqrt(1 + 16 * (f/L)^2)
  const Tmax_par = T0_par * Math.sqrt(1 + 16 * Math.pow(sagRatio, 2));

  // Solve exact catenary parameter a
  const catenaryParamA = useMemo(() => {
    const target = (2 * customSag) / customSpan;
    let low = 0.0001;
    let high = 20.0;
    for (let i = 0; i < 35; i++) {
      const mid = (low + high) / 2;
      const val = (Math.cosh(mid) - 1) / mid;
      if (val < target) low = mid;
      else high = mid;
    }
    const u = (low + high) / 2;
    return halfSpan / u;
  }, [customSpan, customSag, halfSpan]);

  // Exact maximum deviation between catenary and parabola
  const { maxDiff, maxDiffPct, atX } = useMemo(() => {
    let bestDiff = 0;
    let bestX = 0;
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * halfSpan;
      const yCat = catenaryParamA * (Math.cosh(x / catenaryParamA) - 1);
      const yPar = (customSag / (halfSpan * halfSpan)) * (x * x);
      const diff = Math.abs(yCat - yPar);
      if (diff > bestDiff) {
        bestDiff = diff;
        bestX = x;
      }
    }
    return {
      maxDiff: bestDiff,
      maxDiffPct: (bestDiff / customSag) * 100,
      atX: bestX,
    };
  }, [catenaryParamA, customSag, halfSpan]);

  // Required steel area (assume high tensile strength wire: allowable stress = 600 MPa = 600,000 kN/m2)
  const reqSteelAreaM2 = Tmax_par / 600000;
  // Cable diameter in cm: sqrt(4 * Area / pi)
  const cableDiameterCm = Math.sqrt((4 * reqSteelAreaM2) / Math.PI) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Calculator className="w-5 h-5 text-sky-600" />
          실제 랜드마크 교량 데이터 분석 및 공학 계산기
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          광안대교, 골든게이트교, 게이트웨이 아치 등 실제 세계적 교량의 공학 제원을 바탕으로 장력, 단면적, 함수 간 오차를 정밀 산출합니다.
        </p>

        {/* Preset Cards */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {REAL_BRIDGE_PRESETS.map((preset, idx) => {
            const isSelected = idx === selectedPresetIndex;
            return (
              <button
                key={idx}
                onClick={() => handleSelectPreset(idx)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 ring-1 ring-sky-500'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {preset.name.split(' ')[0]}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  지간: {preset.span}m · 처짐: {preset.sag}m
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            설계 변수 직접 입력
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400 font-medium">주경간 지간장 (Span, L)</span>
                <span className="font-mono font-bold text-sky-600 dark:text-sky-400 tabular-nums">{customSpan} m</span>
              </div>
              <input
                type="range"
                min="50"
                max="2500"
                step="25"
                value={customSpan}
                onChange={(e) => setCustomSpan(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400 font-medium">케이블 처짐 / 아치 높이 (Sag, f)</span>
                <span className="font-mono font-bold text-sky-600 dark:text-sky-400 tabular-nums">{customSag} m</span>
              </div>
              <input
                type="range"
                min="5"
                max="300"
                step="5"
                value={customSag}
                onChange={(e) => setCustomSag(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400 font-medium">상판 단위 하중 (Deck Load)</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 tabular-nums">{customDeckWeight} kN/m</span>
              </div>
              <input
                type="range"
                min="0"
                max="300"
                step="5"
                value={customDeckWeight}
                onChange={(e) => setCustomDeckWeight(Number(e.target.value))}
                className="w-full accent-slate-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400 font-medium">케이블 자중 단위 하중 (Cable Weight)</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 tabular-nums">{customCableWeight} kN/m</span>
              </div>
              <input
                type="range"
                min="2"
                max="80"
                step="2"
                value={customCableWeight}
                onChange={(e) => setCustomCableWeight(Number(e.target.value))}
                className="w-full accent-slate-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
            <strong>선택 교량 해설:</strong> {REAL_BRIDGE_PRESETS[selectedPresetIndex]?.description}
          </div>
        </div>

        {/* Right Output Calculations (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>역학적 산출 결과 (Engineering Outputs)</span>
              <span className="text-xs font-mono font-normal text-slate-500">
                처짐비 f/L = {sagRatio.toFixed(3)}
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">중앙 수평 장력 (T₀)</span>
                <div className="text-xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  {(T0_par / 1000).toFixed(2)} <span className="text-xs font-normal text-slate-500">MN</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  약 {Math.round(T0_par / 9.81)} 톤중 (tf)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/60 space-y-1">
                <span className="text-xs text-sky-800 dark:text-sky-300 font-medium">주탑 정점 최대 장력 (T_max)</span>
                <div className="text-xl font-mono font-bold text-sky-700 dark:text-sky-300 tabular-nums">
                  {(Tmax_par / 1000).toFixed(2)} <span className="text-xs font-normal text-sky-600">MN</span>
                </div>
                <div className="text-[11px] text-sky-600/80 dark:text-sky-400 font-mono">
                  T₀ 대비 +{(((Tmax_par - T0_par) / T0_par) * 100).toFixed(1)}% 증가
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">필요한 강철 와이어 굵기</span>
                <div className="text-xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  지름 {cableDiameterCm.toFixed(1)} <span className="text-xs font-normal text-slate-500">cm</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  고강도 강선 와이어 묶음 기준
                </div>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-1">
                <span className="text-xs text-rose-800 dark:text-rose-300 font-medium">현수선-포물선 최대 오차</span>
                <div className="text-xl font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                  {maxDiff < 1 ? `${(maxDiff * 100).toFixed(1)} cm` : `${maxDiff.toFixed(2)} m`}
                </div>
                <div className="text-[11px] text-rose-700 dark:text-rose-400">
                  상대 오차율: {maxDiffPct.toFixed(2)}% (중앙에서 약 {atX.toFixed(0)}m 떨어진 지점)
                </div>
              </div>
            </div>

            {/* Engineering Evaluation Banner */}
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                <strong>고등학생 탐구 검증 결론:</strong>{' '}
                {maxDiffPct < 1.0 ? (
                  <>
                    선택한 다리 조건에서는 포물선과 현수선의 차이가 <strong>{maxDiffPct.toFixed(2)}%</strong>로 1%도 되지 않습니다. 고등학교에서 배운 2차함수 공식(<MathView math="y = ax^2" />)으로 설계해도 안전에 아무런 지장이 없음을 수치로 직접 증명할 수 있습니다!
                  </>
                ) : (
                  <>
                    다리의 처짐이 커지면서 두 곡선의 차이가 <strong>{maxDiffPct.toFixed(2)}%</strong>로 늘어났습니다. 이렇게 줄이 가파르게 축 처질 때는 단순 2차함수뿐만 아니라 정밀한 지수함수 계산이 함께 고려되어야 합니다.
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
