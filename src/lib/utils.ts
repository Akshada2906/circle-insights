import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const calculateRelationshipScore = (isChampion: boolean, connectionsCount: number = 0): number => {
  let score = 5; // Base score
  if (isChampion) score += 3;
  score += Math.min(connectionsCount, 2); // Up to 2 points for connections
  return Math.min(10, Math.max(1, score));
};
