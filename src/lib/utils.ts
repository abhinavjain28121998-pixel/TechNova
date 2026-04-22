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
