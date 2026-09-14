"use client";

import { useId } from "react";
import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

/**
 * A labelled search box. The label is visually hidden but read by screen readers;
 * every search input used to rely on its placeholder alone.
 *
 * Debounce the value where it feeds a query, with useDebouncedValue.
 */
export function SearchInput({
  label,
  value,
  onValueChange,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const id = useId();

  return (
    <div className={cn("w-full sm:w-72", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <InputGroup className="bg-card">
        <InputGroupAddon>
          <Search aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          id={id}
          type="search"
          value={value}
          placeholder={placeholder ?? label}
          onChange={(event) => onValueChange(event.target.value)}
        />
      </InputGroup>
    </div>
  );
}
