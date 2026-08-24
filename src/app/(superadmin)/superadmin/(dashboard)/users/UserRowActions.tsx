"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { setUserRole, deleteUser } from "./actions";

export function UserRowActions({ userId, role, isSelf }: { userId: string; role: string; isSelf: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const run = (fn: () => Promise<{ success: boolean; error?: string }>, okMsg: string) => {
    startTransition(async () => {
      const res = await fn();
      if (res.success) { toast.success(okMsg); router.refresh(); }
      else toast.error(res.error || "Action failed");
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending} />}>
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          {role !== "superadmin" && (
            <DropdownMenuItem onClick={() => run(() => setUserRole(userId, "superadmin"), "Promoted to superadmin")}>
              Promote to Superadmin
            </DropdownMenuItem>
          )}
          {role === "superadmin" && (
            <DropdownMenuItem onClick={() => run(() => setUserRole(userId, "user"), "Demoted to user")}>
              Demote to User
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:bg-red-50 focus:text-red-600"
            disabled={isSelf}
            onClick={() => {
              if (isSelf) return;
              if (confirm("Delete this user? This removes their account data and cannot be undone.")) {
                run(() => deleteUser(userId), "User deleted");
              }
            }}
          >
            {isSelf ? "Delete User (not you)" : "Delete User"}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
