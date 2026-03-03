import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';

interface HouseholdCardProps {
  id: string;
  name: string;
  memberCount: number;
}

export function HouseholdCard({ id, name, memberCount }: HouseholdCardProps) {
  return (
    <Link href={`/admin/households/${id}`}>
      <Card variant="interactive" className="transition-colors">
        <CardHeader className="px-4 pt-4 md:px-5">
          <h3 className="text-lg font-semibold">{name}</h3>
        </CardHeader>
        <CardContent className="px-4 pb-4 md:px-5">
          <p className="text-sm text-zinc-500">
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
