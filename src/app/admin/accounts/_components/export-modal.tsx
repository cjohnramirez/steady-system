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
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AccountType,
  exportAccounts,
  fetchAccountCounts,
  FileType,
} from "../actions";
import { createClient } from "@/utils/supabase/client";
import { generateRange, strToTitleCase } from "@/lib/format";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

interface ExportModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  defaultAccountType: AccountType;
}

export default function ExportModal({
  open,
  setOpen,
  defaultAccountType,
}: ExportModalProps) {
  const supabase = createClient();

  const [loading, isLoading] = useState(false);

  const [accountType, setAccountType] = useState(defaultAccountType);
  const [fileType, setFileType] = useState("csv" as FileType);
  const [numberOfAccounts, setNumberOfAccounts] = useState("");
  const [sortBy, setSortBy] = useState("first_name");

  const updateMutation = useMutation({
    mutationFn: async () => {
      isLoading(true);
      return exportAccounts(
        supabase,
        accountType,
        fileType,
        parseInt(numberOfAccounts),
      );
    },
    onSuccess: async () => {
      toast.success("Announcement added successfully!");
      isLoading(false);
      setOpen(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to add annoucements");
      isLoading(false);
    },
  });

  const {
    data: accountCount,
    isLoading: isAccountCountLoading,
    error: accountCountError,
  } = useQuery({
    queryKey: ["account-count"],
    queryFn: () => fetchAccountCounts(supabase),
  });

  useEffect(() => {
    if (accountCount) {
      const count =
        accountType === "students"
          ? accountCount.students
          : accountCount.counselors;

      setNumberOfAccounts(String(Math.round(count / 10)));
    }
  }, [accountCount]);

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

  const numberOfStudentsArray = studentCount ? generateRange(
    studentCount,
    Math.round(studentCount / 10) ,
  ) : [];
  const numberOfCounselorsArray = counselorCount ? generateRange(
    counselorCount,
    Math.round(counselorCount / 10),
  ) : [];

  const displayArray =
    accountType === "students"
      ? numberOfStudentsArray
      : numberOfCounselorsArray;

  const sortByArray = [
    { value: "first_name", label: "First Name" },
    { value: "last_name", label: "Last Name" },
    { value: "university_id", label: "University ID" },
    { value: "department_id", label: "Department ID" },
  ];

  const handleExport = async () => {
    updateMutation.mutate();
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
            <Select value={fileType} onValueChange={(val) => setFileType(val as FileType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-medium">Accounts</p>
            <Select
              value={accountType}
              onValueChange={(val) => setAccountType(val as AccountType)}
            >
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
                <SelectItem value="students">Students</SelectItem>
                <SelectItem value="counselors">Counselors</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-medium">
              Number of {strToTitleCase(accountType)}
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
          <Button onClick={handleExport}>{loading && <Spinner />}Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
