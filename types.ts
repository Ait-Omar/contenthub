export type Status = 'idea' | 'in-progress' | 'review' | 'changes-requested' | 'published' | 'archived';

export interface ArticleTask {
  id: string;
  // Fields from import file
  link: string;
  keywords: string[];
  board: string;
  annotatedInterests: string;
  topTitle: string;
  category: string; // From "Category Recipes" column

  titleOptions: string[];
  
  // Assignment fields
  blogId?: string;
  vaId?: string; 
  status: Status;
  adminFeedback?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface WordPressSite {
  id: string;
  name: string;
  url: string;
  username: string;
  appPassword: string;
  createdAt: string;
}

export interface WordPressAuthor {
  id: number;
  name: string;
}

export interface User {
  username: string;
  email?: string;
  passwordHash: string;
  salt: string;
  role: 'admin' | 'owner';
}

export interface AuthorLink {
    siteId: string;
    authorId: number;
    authorName: string;
}

export interface VirtualAssistant {
  id: string; // The user ID for the VA
  username: string;
  passwordHash: string;
  salt: string;
  role: 'va';
  adminUsername: string; // The admin this VA belongs to
  name: string; // Display name
  email?: string;
  siteIds: string[];
  authorLinks: AuthorLink[];
  createdAt: string;
}

// FIX: Centralized LoggedInUser type to resolve conflicts.
export type LoggedInUser = (User & { role: 'admin' | 'owner' }) | (VirtualAssistant & { role: 'va' });


export interface Post {
    link: string;
    title: string;
    author: string;
    publishDate: string;
    category: string;
    imageCount: number;
    hasIngredients: boolean;
    hasInstructions: boolean;
    hasNotes: boolean;
    hasPrepTime: boolean;
    hasCookTime: boolean;
    hasTotalTime: boolean;
    hasNutrition: boolean;
    hasFAQ: boolean;
}

export interface DailyPostsData {
    siteId: string;
    authorFirstName: string;
    posts: Post[];
}

export type DateRange = 'today' | 'yesterday' | 'last7' | 'last30';

export interface VAPerformanceData {
  vaId: string;
  vaName: string;
  rank: number;
  score: number;
  totalPosts: number;
  avgImages: number;
  activeDays: number;
  breakdown: {
      articleScore: number;
      imageScore: number;
      consistencyScore: number;
  }
}

export type ChampionHistory = Record<string, string>; // { 'YYYY-MM': vaId }

export interface ChampionData {
  vaId: string;
  vaName: string;
  score: number;
  month: string; // e.g., "June 2024"
}

export type Page = 'dashboard' | 'workflow' | 'hub' | 'performance' | 'owner';