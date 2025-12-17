export interface ShowcaseExample {
  id: string;
  title: string;
  description: string;
  code: string;
  category: 'basic' | 'advanced' | 'text' | 'media';
  thumbnail?: string;
  useDarkCanvas?: boolean; // Default: false
}
