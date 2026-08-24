'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';
import { logout } from '@/app/auth/actions';

export function SuperadminHeader({ email }: { email: string }) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-white dark:bg-black px-6 lg:h-[60px]">
      <div className="flex-1" />
      <DropdownMenu>
        <DropdownMenuTrigger className={buttonVariants({ variant: "secondary", size: "icon", className: "rounded-full" })}>
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback>{email.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="sr-only">Toggle user menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              {email}
            </div>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
