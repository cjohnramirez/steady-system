"use client";

import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

interface ReasonSectionProps {
  selectReason: string;
  setSelectReason: (open: string) => void;
}

export const appointmentReasons = [
  "Academic",
  "Career",
  "Personal",
  "Mental Health",
  "Family",
  "Peer",
  "Adjustment",
  "Stress",
  "Grief",
  "Referral",
];

export default function ReasonSection({
  selectReason,
  setSelectReason,
}: ReasonSectionProps) {
  const [others, setOthers] = useState(false);

  const input = useMemo(
    () =>
      others && (
        <InputGroup className="col-span-4 p-2">
          <Search strokeWidth={1.25} />
          <InputGroupInput
            placeholder="State other reasons here (optional)"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSelectReason(e.target.value);
            }}
          />
        </InputGroup>
      ),
    [others, setSelectReason],
  );

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-8 h-fit">
      <p className="font-medium">Select Your Reason</p>
      <div className="grid grid-cols-4 gap-2">
        {appointmentReasons.map((reason) => (
          <Button
            key={reason}
            variant={reason === selectReason ? "default" : "outline"}
            onClick={() => {
              setSelectReason(reason);
              setOthers(false);
            }}
          >
            {reason}
          </Button>
        ))}
        <Button
          variant={"Others" === selectReason || others ? "default" : "outline"}
          onClick={() => {
            setSelectReason("Others");
            setOthers(true);
          }}
        >
          Others
        </Button>
        {input}
      </div>
    </div>
  );
}
