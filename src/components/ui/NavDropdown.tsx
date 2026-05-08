import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";

interface NavDropdownProps {
  label: string;
  items: string[];
}

export function NavDropdown({ label, items }: NavDropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="group flex items-center gap-1 text-sm font-medium text-secondary hover:text-primary outline-none transition-colors">
          {label}
          <ChevronDown className="h-3 w-3 text-muted group-data-[state=open]:rotate-180 transition-transform duration-200" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[180px] overflow-hidden rounded-xl border border-border bg-white p-1 shadow-sm animate-fade-in"
          sideOffset={8}
          align="start"
        >
          {items.map((item) => (
            <DropdownMenu.Item
              key={item}
              className="flex w-full items-center px-3 py-2 text-sm font-medium text-secondary hover:bg-surface hover:text-primary rounded-lg outline-none cursor-pointer"
            >
              {item}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
