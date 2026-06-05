import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateReadingTime(text: string | undefined): string {
  if (!text) return '1 min read';
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}

export function getOptimizedImageUrl(url: string | undefined, width: number = 800): string {
  const fallback = '/banners/expert-outlook-navigating-artificial-intelligence-in-2026.png';
  if (!url) return fallback;
  
  if (url.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('q', '75');
      urlObj.searchParams.set('auto', 'format');
      if (!urlObj.searchParams.has('fit')) {
        urlObj.searchParams.set('fit', 'crop');
      }
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  }
  return url;
}
