interface AdminFeedbackBannerProps {
  feedback: string;
  feedbackAt: Date | null;
}

export function AdminFeedbackBanner({ feedback, feedbackAt }: AdminFeedbackBannerProps) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
      <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
        Admin Feedback
      </h4>
      <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">{feedback}</p>
      {feedbackAt && (
        <p className="mt-2 text-xs text-amber-500">
          {feedbackAt.toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
