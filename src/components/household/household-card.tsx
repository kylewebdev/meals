import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';

interface HouseholdCardProps {
  id: string;
  name: string;
  memberCount: number;
  rotationPosition: number;
}

export function HouseholdCard({ id, name, memberCount, rotationPosition }: HouseholdCardProps) {
  return (
    <Link href={`/admin/households/${id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{name}</h3>
            <Badge variant="outline">#{rotationPosition + 1}</Badge>
          </div>
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
