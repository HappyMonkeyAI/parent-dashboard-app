"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ChildOption {
  id: string;
  displayName: string;
}

interface ChildSelectorProps {
  options: ChildOption[];
  selectedId: string;
}

export function ChildSelector({ options, selectedId }: ChildSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(childId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("child", childId);
    router.push(`${pathname}?${params.toString()}`);
  }

  if (options.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface p-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-ink-muted">Child:</span>
        <div className="flex flex-wrap gap-1">
          {options.map((child) => (
            <button
              key={child.id}
              onClick={() => handleChange(child.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-bold transition-colors duration-150",
                child.id === selectedId
                  ? "bg-accent text-ink-inverse"
                  : "bg-surface-raised text-ink-muted hover:bg-accent-muted hover:text-ink"
              )}
            >
              {child.displayName}
            </button>
          ))}
        </div>
      </div>

      <Link
        href="/admin/children"
        className="text-xs font-bold text-accent hover:text-accent-hover"
      >
        + Manage children
      </Link>
    </div>
  );
}
