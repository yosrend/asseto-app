
export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum ImageStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface SectionConfig {
  id: string;
  name: string;
  description?: string;
  imageCount: number;
}

export interface ProjectConfig {
  name: string;
  category: string;
  customCategory?: string; // For the free-text input
  description: string;
  style: string;
  stylePrompt?: string; // Extracted from reference or manually edited
  aspectRatio: string;
  width?: number; // Custom width in px
  height?: number; // Custom height in px
  sections: SectionConfig[];
}

export interface GeneratedImage {
  id: string;
  sectionId: string;
  dataUrl?: string; // Base64, optional if pending
  prompt: string;
  createdAt: number;
  status: ImageStatus;
}

export interface ProjectState {
  config: ProjectConfig;
  images: GeneratedImage[];
  status: GenerationStatus;
  progress: number;
}