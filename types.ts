
export enum Platform {
  INSTAGRAM = 'Instagram',
  LINKEDIN = 'LinkedIn',
  X = 'X (Twitter)',
  TIKTOK = 'TikTok',
  FACEBOOK = 'Facebook'
}

export type GanttViewMode = 'day' | 'month' | 'year';

export interface Post {
  id: string;
  title: string;
  content: string;
  date: Date;
  platform: Platform;
  status: 'Draft' | 'Scheduled' | 'Published';
  imageUrl?: string;
  programId?: string; // Identifier for bulk-generated programs
  programName?: string; // Readable name for the program
}

export interface Campaign {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  color: string;
  description: string;
}

export interface AIAdvice {
  platform: Platform;
  bestTimes: string[];
  tips: string[];
  contentIdeas: string[];
}

export interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: string;
  date: Date;
}
