import { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ShieldAlert, Users, Building, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { SuperadminSidebar } from './SuperadminSidebar';
import { SuperadminHeader } from './SuperadminHeader';
import { isSuperadmin } from '@/lib/auth';

export default async function SuperadminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/superadmin/login');
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id)
  });

  // Community edition is a single-user local install — the local user is the
  // operator. In cloud edition, require an actual superadmin.
  const isCommunity = process.env.NEXT_PUBLIC_IS_CLOUD_EDITION === 'false';
  if (!isCommunity && !isSuperadmin(dbUser?.role, user.email)) {
    redirect('/dashboard');
  }

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden">
      <aside className="w-64 border-r bg-white dark:bg-black shrink-0 hidden md:block">
        <SuperadminSidebar />
      </aside>
      <main className="flex flex-1 flex-col overflow-hidden">
        <SuperadminHeader email={user.email || 'Superadmin'} />
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

