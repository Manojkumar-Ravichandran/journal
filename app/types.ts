
export enum Emotion {
  CALM = 'Calm',
  CONFIDENT = 'Confident',
  FOMO = 'FOMO',
  ANXIOUS = 'Anxious',
  REVENGE = 'Revenge'
}

export enum TradeDirection {
  LONG = 'Long',
  SHORT = 'Short'
}

export enum InstrumentType {
  EQUITY = 'Equity',
  OPTION = 'Option',
  FUTURE = 'Future'
}

export interface Trade {
  id: string;
  symbol: string;
  instrumentType: InstrumentType;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  entryTime: string;
  exitTime: string;
  entryReason: string;
  emotion: Emotion;
  rulesFollowed: string[];
  rulesViolated: string[];
  disciplineScore: number;
  images?: string[]; // Added for trade-related images
  createdAt: string;
  size?: number;
  notes?: string;
}

export interface BehaviorScore {
  overallScore: number;
  mistakes: string[];
  emotionBreakdown: Record<string, number>;
  improvementNotes: string;
}

export interface AIReplay {
  tradeId: string;
  aiSummary: string;
  missedOpportunity: string;
  betterEntry: string;
  betterExit: string;
  disciplineScore: number;
  suggestions: string[];
}

export interface User {
    id: string;
    name: string;
    email: string;
}
