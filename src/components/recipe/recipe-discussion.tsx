'use client';

import { addComment, deleteComment } from '@/actions/recipe-comments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { type RecipeComment } from '@/lib/queries/recipe-comments';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface RecipeDiscussionProps {
  recipeId: string;
  comments: RecipeComment[];
  currentUserId: string;
  isAdmin: boolean;
}

export function RecipeDiscussion({
  recipeId,
  comments,
  currentUserId,
  isAdmin,
}: RecipeDiscussionProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setLoading(true);
    const res = await addComment(recipeId, body.trim());
    if (!res.success) {
      toast(res.error, 'error');
      setLoading(false);
      return;
    }
    setBody('');
    setLoading(false);
    router.refresh();
  };

  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId);
    const res = await deleteComment(commentId);
    if (!res.success) {
      toast(res.error, 'error');
      setDeletingId(null);
      return;
    }
    setDeletingId(null);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{comment.author.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">
                    {comment.createdAt.toLocaleDateString()}
                  </span>
                  {(comment.author.id === currentUserId || isAdmin) && (
                    <button
                      className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
                      disabled={deletingId === comment.id}
                      onClick={() => handleDelete(comment.id)}
                    >
                      {deletingId === comment.id ? '...' : 'Delete'}
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                {comment.body}
              </p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment..."
          maxLength={2000}
        />
        <Button size="sm" loading={loading} disabled={!body.trim()}>
          Comment
        </Button>
      </form>
    </div>
  );
}
