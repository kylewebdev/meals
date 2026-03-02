import { Badge } from '@/components/ui/badge';

interface Household {
  id: string;
  name: string;
}

interface ContributionStatusProps {
  households: Household[];
  contributedHouseholdIds: string[];
}

export function ContributionStatus({ households, contributedHouseholdIds }: ContributionStatusProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {households.map((h) => {
        const hasContributed = contributedHouseholdIds.includes(h.id);
        return (
          <Badge key={h.id} variant={hasContributed ? 'success' : 'outline'}>
            {h.name} {hasContributed ? '(done)' : '(pending)'}
          </Badge>
        );
      })}
    </div>
  );
}
