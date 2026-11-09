import React, { useState } from 'react';
import { BRIDGE_SPECS } from '../data/bridgeData';
import { MathView } from './MathView';
import { Layers, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ComparisonMatrix: React.FC = () => {
  const [selectedBridgeId, setSelectedBridgeId] = useState<string>('suspension');

  const activeBridge = BRIDGE_SPECS.find((b) => b.id === selectedBridgeId) || BRIDGE_SPECS[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-sky-600" />
          5대 교량 유형별 수학적·공학적 구조 비교 매트릭스
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          현수교, 아치교, 사장교, 트러스교, 거더교의 지배 수학 함수, 주요 작용력, 지간장 한계 및 역학적 하중 전달 경로를 다각도로 비교 분석합니다.
        </p>

        {/* Bridge Selector Buttons */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {BRIDGE_SPECS.map((bridge) => {
            const isSelected = bridge.id === selectedBridgeId;
            return (
              <button
                key={bridge.id}
                onClick={() => setSelectedBridgeId(bridge.id)}
                className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-500 dark:border-sky-500/80 shadow-xs ring-1 ring-sky-500'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  {bridge.koreanName.split(' ')[0]}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {bridge.primaryForce.split(' ')[0]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Bridge Spotlight Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 lg:p-8">
          {/* Left Column: Technical Specs & Math */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-1">
              <span className="text-xs font-mono font-semibold text-sky-600 dark:text-sky-400">
                {activeBridge.name}
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {activeBridge.koreanName}
              </h3>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">주 작용력 (Force)</span>
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  {activeBridge.primaryForce}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">경제적 지간장 (Span)</span>
                <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 font-mono">
                  {activeBridge.spanRange}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">지배 수학 함수</span>
                <span className="text-xs font-semibold text-slate-900 dark:text-white truncate block">
                  {activeBridge.governingFunction.split('/')[0]}
                </span>
              </div>
            </div>

            {/* Math Formula Card */}
            <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-mono text-slate-400 block">수학적 모델링 지배 공식 (Governing Equation)</span>
              <div className="py-2 overflow-x-auto text-sky-300">
                <MathView math={activeBridge.mathFormulaLatex} displayMode={true} />
              </div>
            </div>

            {/* Engineering Insight */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                공학적 원리와 구조적 특징
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeBridge.engineeringInsight}
              </p>
            </div>

            {/* Real World Examples */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                세계적 및 국내 대표 사례:
              </span>
              <div className="flex flex-wrap gap-2">
                {activeBridge.realExamples.map((ex, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Visual Image Asset & Structural Diagram */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 aspect-16/11 relative group">
              <img
                src={activeBridge.imagePath}
                alt={activeBridge.koreanName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs font-semibold text-white">
                  {activeBridge.koreanName}의 실제 공학적 외관
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>핵심 구조 역학 정리</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeBridge.keyFeature}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive 5-Bridge Comparison Matrix Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            5대 다리 형식 핵심 비교표 (고등학생 눈높이 정리)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            우리가 배운 고교 수학(이차함수, 지수함수, 삼각비, 삼각형)과 물리학(인장력, 압축력, 힘의 평형)으로 정리한 일람표
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-semibold">
                <th className="py-3 px-4">다리 종류</th>
                <th className="py-3 px-4">관련된 고교 수학</th>
                <th className="py-3 px-4">버티는 힘의 종류</th>
                <th className="py-3 px-4">추천 다리 길이</th>
                <th className="py-3 px-4">부러지지 않는 비결</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">현수교</td>
                <td className="py-3.5 px-4 font-mono text-sky-600 dark:text-sky-400">이차함수 포물선(y=ax²)</td>
                <td className="py-3.5 px-4">강철 쇠줄의 순수 당김 힘 (인장력)</td>
                <td className="py-3.5 px-4 font-mono">1,000m ~ 2,000m 이상</td>
                <td className="py-3.5 px-4">꺾이는 힘을 팽팽한 줄의 인장력으로 100% 흡수</td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">아치교</td>
                <td className="py-3.5 px-4 font-mono text-emerald-600 dark:text-emerald-400">위로 볼록한 2차곡선 / 역현수선</td>
                <td className="py-3.5 px-4">돌과 강철이 서로 미는 힘 (압축력)</td>
                <td className="py-3.5 px-4 font-mono">200m ~ 500m</td>
                <td className="py-3.5 px-4">거꾸로 뒤집힌 곡선 모양으로 하중을 양쪽 땅으로 밀어냄</td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">사장교</td>
                <td className="py-3.5 px-4 font-mono text-purple-600 dark:text-purple-400">1차 직선 및 삼각비 (sin, cos)</td>
                <td className="py-3.5 px-4">케이블 당김 + 상판 누름 복합</td>
                <td className="py-3.5 px-4 font-mono">400m ~ 1,000m</td>
                <td className="py-3.5 px-4">텐트처럼 높은 기둥에서 대각선 줄로 상판을 직접 묶어둠</td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">트러스교</td>
                <td className="py-3.5 px-4 font-mono text-amber-600 dark:text-amber-400">삼각형의 기하학적 불변성</td>
                <td className="py-3.5 px-4">막대기별 순수 당김과 누름</td>
                <td className="py-3.5 px-4 font-mono">100m ~ 300m</td>
                <td className="py-3.5 px-4">찌그러지지 않는 삼각형 뼈대를 입체로 짜서 휨 방지</td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">거더교</td>
                <td className="py-3.5 px-4 font-mono text-slate-500">수평 직선 및 가운데 처짐 현상</td>
                <td className="py-3.5 px-4">단면이 꺾이려는 휨 힘</td>
                <td className="py-3.5 px-4 font-mono">20m ~ 80m</td>
                <td className="py-3.5 px-4">철근과 콘크리트 자체의 두께로 버팀 (길면 부러짐)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
