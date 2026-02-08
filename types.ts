
export enum Platform {
  INSTAGRAM = 'Instagram',
  LINKEDIN = 'LinkedIn',
  X = 'X (Twitter)',
  TIKTOK = 'TikTok',
  FACEBOOK = 'Facebook',
  WHATSAPP = 'WhatsApp',
  TELEGRAM = 'Telegram',
  SNAPCHAT = 'Snapchat',
  YOUTUBE = 'YouTube',
  THREADS = 'Threads',
  PINTEREST = 'Pinterest'
}

export type GanttViewMode = 'day' | 'month' | 'year';

export interface Post {
  id: string;
  title: string;
  content?: string;
  date?: Date;
  platform?: Platform;
  status?: 'Draft' | 'Scheduled' | 'Published';
  imageUrl?: string;
  programId?: string;
  programName?: string;
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

export interface MediaFolder {
  id: string;
  name: string;
  parentId?: string | null;
  date: Date;
}

export interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: string;
  date: Date;
  folderId?: string | null;
  width?: number;
  height?: number;
  size?: number; // File size in bytes
}
