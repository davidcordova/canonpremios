import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatWinnersForExportButtons = (winners: any[]): { [key: string]: string }[] => {
  return winners.map(winner => ({
    id: winner.id,
    name: winner.name,
    avatar: winner.avatar,
    store: winner.store,
    photo: winner.photo,
    rewardName: winner.reward.name,
    rewardPoints: winner.reward.points.toString(),
    rewardDate: winner.reward.date,
    review: winner.review,
  }));
};
