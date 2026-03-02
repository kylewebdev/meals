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
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <h3 className="font-semibold">{name}</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
