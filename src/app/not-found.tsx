import Link from "next/link";
import { TrafficCone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusScreen } from "@/components/app/status-screen";

export default function NotFound() {
  return (
    <StatusScreen
      icon={TrafficCone}
      title="Page not found"
      description="We couldn't find that page. It may have moved, or you may not have access to it."
    >
      <Button asChild>
        <Link href="/home">Back to home</Link>
      </Button>
    </StatusScreen>
  );
}
