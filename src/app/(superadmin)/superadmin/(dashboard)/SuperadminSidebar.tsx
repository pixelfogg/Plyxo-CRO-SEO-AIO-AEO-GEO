'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, Users, Building, Activity, CreditCard, Tag, Mail, Settings2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export function SuperadminSidebar() {
  const pathname = usePathname();

  const sidebarNavItems = [
    {
      title: 'Overview',
      href: '/superadmin',
      icon: <Activity className="mr-2 h-4 w-4" />,
    },
    {
      title: 'Users',
      href: '/superadmin/users',
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      title: 'Organizations',
      href: '/superadmin/organizations',
      icon: <Building className="mr-2 h-4 w-4" />,
    },
    {
      title: 'Subscriptions',
      href: '/superadmin/subscriptions',
      icon: <CreditCard className="mr-2 h-4 w-4" />,
    },
    {
      title: 'Coupons',
      href: '/superadmin/coupons',
      icon: <Tag className="mr-2 h-4 w-4" />,
    },
    {
      title: 'Gateways',
      href: '/superadmin/gateways',
      icon: <Settings2 className="mr-2 h-4 w-4" />,
    },
    {
      title: 'Email & SMTP',
      href: '/superadmin/smtp',
      icon: <Mail className="mr-2 h-4 w-4" />,
    },
    {
      title: 'Compliance & Audit',
      href: '/superadmin/compliance',
      icon: <ShieldCheck className="mr-2 h-4 w-4" />,
    },
  ];

  return (
    <nav className="flex space-x-2 md:flex-col md:space-x-0 md:space-y-1 p-4 md:p-6 overflow-x-auto h-full">
      <div className="hidden md:flex items-center gap-2 px-3 py-2 mb-8">
        <ShieldAlert className="h-6 w-6 text-rose-500" />
        <h2 className="text-xl font-bold tracking-tight text-white">Superadmin</h2>
      </div>
      <div className="space-y-1 w-full">
        {sidebarNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              pathname === item.href
                ? 'bg-rose-500/10 hover:bg-rose-500/20 font-medium text-rose-500'
                : 'hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200',
              'justify-start whitespace-nowrap w-full'
            )}
          >
            {item.icon}
            {item.title}
          </Link>
        ))}
      </div>
    </nav>
  );
}

