import React, { useState, useEffect } from 'react';
import { PRESENTATION_SLIDES } from '../data/bridgeData';
import { MathView } from './MathView';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  FileText, 
  Sparkles, 
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface PresentationModeProps {
  onNavigateToSim: () => void;
  onNavigateToDerivation: () => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  onNavigateToSim,
  onNavigateToDerivation,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const slide = PRESENTATION_SLIDES[currentSlideIndex];
  const totalSlides = PRESENTATION_SLIDES.length;

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Presentation Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold tracking-wider text-sky-600 dark:text-sky-400">
            {slide.badge}
          </div>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
            슬라이드 <strong className="text-slate-900 dark:text-white font-semibold">{String(currentSlideIndex + 1).padStart(2, '0')}</strong> / {String(totalSlides).padStart(2, '0')}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              showSpeakerNotes
                ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="발표 발표자가 읽을 수 있는 구체적인 구술 스크립트를 표시합니다."
          >
            <FileText className="w-3.5 h-3.5" />
            {showSpeakerNotes ? '발표 대본 닫기' : '발표 대본(스크립트) 보기'}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="전체화면 프레젠테이션"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
            <button
              onClick={handlePrev}
              disabled={currentSlideIndex === 0}
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentSlideIndex === totalSlides - 1}
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Slide Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all duration-300">
        <div className="p-8 lg:p-10 space-y-6">
          {/* Slide Header */}
          <div className="space-y-2 border-b border-slate-100 dark:border-slate-800/80 pb-5">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {slide.title}
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 font-medium">
              {slide.subTitle}
            </p>
          </div>

          {/* Key Takeaway Callout */}
          <div className="p-4 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 rounded-xl flex items-start gap-3">
            <div className="mt-0.5 p-1 bg-sky-600 text-white rounded-md shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-sky-800 dark:text-sky-300 tracking-wide uppercase">
                핵심 결론 (Key Takeaway)
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {slide.mainTakeaway}
              </p>
            </div>
          </div>

          {/* Slide Content Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Bullet points and comparisons */}
            <div className={`${slide.imagePath ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
              <ul className="space-y-3.5">
                {slide.contentBullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600 dark:bg-sky-400 mt-2 shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              {/* Comparison Points (if any) */}
              {slide.comparisonPoints && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-sky-700 dark:text-sky-400 tracking-wide">
                      {slide.comparisonPoints.leftTitle}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                      {slide.comparisonPoints.leftContent}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-wide">
                      {slide.comparisonPoints.rightTitle}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                      {slide.comparisonPoints.rightContent}
                    </p>
                  </div>
                </div>
              )}

              {/* Math Highlight Card */}
              {slide.mathHighlight && (
                <div className="mt-5 p-4 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-2">
                  <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
                    <span>수학적 지배 공식</span>
                    <button 
                      onClick={onNavigateToDerivation}
                      className="text-xs text-sky-400 hover:text-sky-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                    >
                      <BookOpen className="w-3 h-3" />
                      유도과정 보기
                    </button>
                  </div>
                  <div className="py-2 overflow-x-auto text-center text-sky-200">
                    <MathView math={slide.mathHighlight.formula} displayMode={true} />
                  </div>
                  <p className="text-xs text-slate-300 text-center">
                    {slide.mathHighlight.description}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Visual Image Asset & Action Trigger */}
            {slide.imagePath && (
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 relative group aspect-16/10">
                  <img
                    src={slide.imagePath}
                    alt={slide.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                    <span className="text-xs font-medium text-white/90 drop-shadow-sm">
                      구조역학 실증 모델 및 실제 교량 형태
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                  <span>실시간으로 함수 곡선과 하중을 조작해보세요:</span>
                  <button
                    onClick={onNavigateToSim}
                    className="px-3 py-1.5 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>시뮬레이터 열기</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Speaker Notes Drawer (발표 대본) */}
          {showSpeakerNotes && (
            <div className="mt-8 p-5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                <FileText className="w-4 h-4" />
                <span>발표자 구술 스크립트 (Speaker Notes)</span>
              </div>
              <p className="text-sm leading-relaxed text-amber-950 dark:text-amber-100 font-normal">
                "{slide.speakerNotes}"
              </p>
            </div>
          )}
        </div>

        {/* Bottom Slide Thumbnails Strip */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 p-3 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {PRESENTATION_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all text-left truncate max-w-44 cursor-pointer ${
                  idx === currentSlideIndex
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span className="font-mono text-[11px] opacity-75 mr-1.5">0{s.id}</span>
                {s.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
