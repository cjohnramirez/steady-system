import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tables } from "@/types/supabase";

export default function CollegeDropdown({
  isLoading,
  colleges,
}: {
  isLoading: boolean;
  colleges: Tables<"college">[];
}) {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isLoading}
        <Button variant="outline">Select</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {colleges.map((college, idx) => (
          <DropdownMenuLabel key={idx}>
            {college.id ?? "None"}
          </DropdownMenuLabel>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
