export type RatingValue = 'love' | 'fine' | 'dislike';

export const ratingTextStyles: Record<RatingValue, string> = {
  love: 'text-green-600 dark:text-green-500',
  fine: 'text-zinc-500 dark:text-zinc-400',
  dislike: 'text-red-600 dark:text-red-500',
};

export const ratingDotStyles: Record<RatingValue, string> = {
  love: 'bg-green-500',
  fine: 'bg-zinc-400 dark:bg-zinc-500',
  dislike: 'bg-red-500',
};

export const ratingLabels: Record<RatingValue, string> = {
  love: 'Loved it',
  fine: 'Fine',
  dislike: 'Disliked',
};
