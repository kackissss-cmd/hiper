export type NavigationTab = 
  | 'presentation' 
  | 'simulation' 
  | 'comparison' 
  | 'derivation' 
  | 'calculator' 
  | 'quiz';

export interface BridgeSpec {
  id: string;
  name: string;
  koreanName: string;
  type: 'suspension' | 'arch' | 'cable_stayed' | 'truss' | 'girder';
  governingFunction: string;
  mathFormulaLatex: string;
  primaryForce: '인장력 (Tension)' | '압축력 (Compression)' | '인장 + 압축 복합' | '휨모멘트 + 전단력';
  spanRange: string;
  keyFeature: string;
  imagePath: string;
  realExamples: string[];
  engineeringInsight: string;
  momentDeflectionEquation?: string;
}

export interface SlideData {
  id: number;
  title: string;
  subTitle: string;
  badge: string;
  mainTakeaway: string;
  contentBullets: string[];
  mathHighlight?: {
    formula: string;
    description: string;
  };
  comparisonPoints?: {
    leftTitle: string;
    leftContent: string;
    rightTitle: string;
    rightContent: string;
  };
  imagePath?: string;
  speakerNotes: string; // 발표자 대본
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
