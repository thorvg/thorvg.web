export interface ShowcaseExample {
  id: string;
  title: string;
  description: string;
  code: string;
  category: 'basic' | 'advanced' | 'animation' | 'text' | 'media';
  thumbnail?: string;
}
