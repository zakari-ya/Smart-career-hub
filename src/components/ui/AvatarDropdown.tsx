import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useUser, useClerk } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { LayoutGrid, LogOut, User } from "lucide-react";

export function AvatarDropdown() {
  const { user } = useUser();
  const { signOut } = useClerk();

  if (!user) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface overflow-hidden outline-none hover:opacity-80 transition-opacity">
          {user.imageUrl ? (
            <img src={user.imageUrl} alt={user.fullName || "User"} className="h-full w-full object-cover" />
          ) : (
            <User className="h-4 w-4 text-muted" />
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[160px] overflow-hidden rounded-xl border border-border bg-white p-1 shadow-sm animate-fade-in"
          align="end"
          sideOffset={8}
        >
          <DropdownMenu.Item asChild>
            <Link
              to="/dashboard"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-secondary hover:bg-surface hover:text-primary outline-none cursor-pointer"
            >
              <LayoutGrid className="h-4 w-4" />
              Dashboard
            </Link>
          </DropdownMenu.Item>
          
          <DropdownMenu.Separator className="my-1 h-px bg-border/30" />
          
          <DropdownMenu.Item
            onClick={() => signOut({ redirectUrl: "/" })}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-error hover:bg-error/5 outline-none cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
