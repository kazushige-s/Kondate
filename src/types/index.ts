export type Season = '春' | '夏' | '秋' | '冬';

export interface Meal {
  id: string;
  name: string;
  date: string;
  season: Season | null;
  isReady: boolean;
}

export type Tab = 'add' | 'thisweek' | 'list' | 'forgotten';
