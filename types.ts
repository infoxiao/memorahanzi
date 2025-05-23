
export interface Author {
  id: string; // Unique ID for React keys
  name: string;
  isPotentiallyChinese: boolean;
}

export interface ProcessedNameDetails {
  originalName: string;
  pinyin?: string;
  syllables?: string[];
  keywords?: string[];
  imageUrl?: string;
  error?: string;
}

export enum ActiveTab {
  DIRECT_INPUT = 'directInput',
  ARXIV_HELPER = 'arxivHelper',
}

export interface PinyinResponse {
  pinyin: string;
}

export interface KeywordsResponse {
  keywords: string[];
}

export interface IdentifiedNamesResponse {
  identifiedNames: string[];
}

// For Gemini API - Candidates can be undefined
export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  retrievedContext?: {
    uri?: string;
    title?: string;
  };
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  searchQueries?: string[];
}

export interface Candidate {
  groundingMetadata?: GroundingMetadata;
  // other candidate properties
}

export interface GenerateContentResponseWithGM {
  text: string; // Assuming text is always present from prompt, but good to check
  candidates?: Candidate[];
}
