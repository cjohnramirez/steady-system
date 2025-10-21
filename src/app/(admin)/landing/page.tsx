"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function LandingPage() {
  return (
    <>
      <div className="flex justify-between">
        <div>
          <h2 className="text-md font-semibold">Articles to Read</h2>
          <p className="">Added articles here are shown in the landing page</p>
        </div>
        <Button variant={"outline"}>
          <Plus />
          Add Article
        </Button>
      </div>
      <div>
        {
          
        }
      </div>
    </>
  );
}
