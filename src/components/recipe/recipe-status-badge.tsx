import { Badge } from '@/components/ui/badge';

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' }> = {
  approved: { label: 'Approved', variant: 'success' },
  submitted: { label: 'Workshop', variant: 'default' },
  pending_review: { label: 'Pending Review', variant: 'warning' },
  // Legacy statuses
  pending: { label: 'Pending Review', variant: 'warning' },
  rejected: { label: 'Needs Changes', variant: 'destructive' },
};

interface RecipeStatusBadgeProps {
  status: string;
}

export function RecipeStatusBadge({ status }: RecipeStatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, variant: 'warning' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
