import { db } from '@/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShieldAlert, Mail } from 'lucide-react';
import { requireSuperadmin } from '@/lib/auth';
import { UserRowActions } from './UserRowActions';

export default async function SuperadminUsersPage() {
  const actor = await requireSuperadmin();
  const allUsers = await db.query.users.findMany({
    orderBy: (users, { desc }) => [desc(users.createdAt)],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">User Management</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Manage platform users, roles, and access.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
          <CardDescription>All users currently registered on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-zinc-100 dark:border-zinc-800">
            <Table>
              <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-zinc-500">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  allUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.avatarUrl || ''} />
                          <AvatarFallback>{u.email.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{u.name || 'Unnamed User'}</div>
                          <div className="text-xs text-zinc-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {u.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.role === 'superadmin' ? 'default' : 'secondary'} className={u.role === 'superadmin' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}>
                          {u.role === 'superadmin' && <ShieldAlert className="h-3 w-3 mr-1" />}
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-zinc-500">
                        {u.createdAt?.toLocaleDateString('en-US')}
                      </TableCell>
                      <TableCell className="text-right">
                        <UserRowActions userId={u.id} role={u.role} isSelf={u.id === actor.id} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

