"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAccountCounts } from "../actions";
import { createClient } from "@/utils/supabase/client";
import { generateRange, strToTitleCase } from "@/lib/format";
import { Spinner } from "@/components/ui/spinner";

interface ExportModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  defaultAccountType: string;
}

export default function ExportModal({ open, setOpen }: ExportModalProps) {
  const supabase = createClient();

  const [accountType, setAccountType] = useState("student");
  const [numberOfAccounts, setNumberOfAccounts] = useState("");
  const [sortBy, setSortBy] = useState("first_name");

  const {
    data: accountCount,
    isLoading: isAccountCountLoading,
    error: accountCountError,
  } = useQuery({
    queryKey: ["account-count"],
    queryFn: () => fetchAccountCounts(supabase),
  });

  if (accountCountError) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Error loading account counts</DialogTitle>
          </DialogHeader>
          <div className="text-red-500">
            {String(accountCountError.message || accountCountError)}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (isAccountCountLoading) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Export Accounts</DialogTitle>
          </DialogHeader>
          <div className="mt-5 flex items-center justify-center gap-4">
            <Spinner />
            <p>Loading Export</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const studentCount = accountCount?.students ?? 0;
  const counselorCount = accountCount?.counselors ?? 0;

  const numberOfStudentsArray = generateRange(
    studentCount,
    Math.round(studentCount / 10),
  );
  const numberOfCounselorsArray = generateRange(
    counselorCount,
    Math.round(counselorCount / 10),
  );

  const displayArray =
    accountType === "student" ? numberOfStudentsArray : numberOfCounselorsArray;
  const sortByArray = [
    { value: "first_name", label: "First Name" },
    { value: "last_name", label: "Last Name" },
    { value: "university_id", label: "University ID" },
    { value: "department_id", label: "Department ID" },
  ];

  const handleExport = async () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Export Accounts</DialogTitle>
        </DialogHeader>
        <div className="mt-3 grid grid-cols-2 grid-rows-2 gap-5">
          <div className="flex flex-col gap-2">
            <p className="font-medium">File Type</p>
            <Select defaultValue="csv">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-medium">Accounts</p>
            <Select value={accountType} onValueChange={setAccountType}>
              <SelectTrigger className="w-full">
                {!isAccountCountLoading ? (
                  <SelectValue placeholder="Select value" />
                ) : (
                  <div className="flex items-center gap-4">
                    <Spinner />
                    <p>Loading Accounts</p>
                  </div>
                )}
              </SelectTrigger>
              <SelectContent side="top">
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="counselor">Counselor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-medium">
              Number of {strToTitleCase(accountType)}s
            </p>
            <Select
              value={numberOfAccounts}
              onValueChange={setNumberOfAccounts}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select number" />
              </SelectTrigger>
              <SelectContent side="top">
                {displayArray.map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-medium">Sort By</p>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {sortByArray.map((sortBy) => (
                  <SelectItem key={sortBy.value} value={sortBy.value}>
                    {sortBy.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Exit
            </Button>
          </DialogClose>
          <Button onClick={handleExport}>Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
