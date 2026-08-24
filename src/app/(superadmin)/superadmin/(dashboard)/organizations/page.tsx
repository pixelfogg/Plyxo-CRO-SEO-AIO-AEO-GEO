import { db } from '@/db';
import { organizations } from '@/db/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Building } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default async function SuperadminOrganizationsPage() {
  const allOrgs = await db.query.organizations.findMany({
    orderBy: (organizations, { desc }) => [desc(organizations.createdAt)],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Organizations</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Manage platform tenants and their subscriptions.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Registered Organizations</CardTitle>
          <CardDescription>All multi-tenant organizations on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-zinc-100 dark:border-zinc-800">
            <Table>
              <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allOrgs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-zinc-500">
                      No organizations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  allOrgs.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                          <Building className="h-4 w-4" />
                        </div>
                        <div className="font-medium text-sm">{org.name}</div>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-zinc-500">
                        {org.slug}
                      </TableCell>
                      <TableCell className="text-sm text-zinc-500">
                        {org.createdAt?.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Manage Subscription</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600">
                                Delete Organization
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
