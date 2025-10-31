import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { Department } from "@/types/main";
import { useState } from "react";

export default function DepartmentDropdown({
  isLoading,
  departments,
}: {
  isLoading: boolean;
  departments: Department[];
}) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner /> Loading
            </>
          ) : (
            selected || "Select Department"
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {departments?.map((department) => (
          <DropdownMenuItem
            key={department.id}
            onClick={() =>
              setSelected((department.title && department.title) || "")
            }
          >
            {department.title || "Unnamed"}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem>Nursing</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
