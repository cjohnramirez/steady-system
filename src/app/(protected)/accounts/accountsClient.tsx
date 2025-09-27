// app/accounts/AccountsClient.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  UserPlus,
  Trash2,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Admin, Counselor, Student } from "@/lib/types/users";

type Props = {
  students: Student[];
  counselors: Counselor[];
  admins: Admin[];
};

type UserType = Student | Counselor | Admin;

export default function AccountsClient({
  students: studentData,
  counselors: counselorData,
  admins: adminData,
}: Props) {
  // Local State (uses SSR data as initial values)
  const [students, setStudents] = useState<Student[]>(studentData);
  const [counselors, setCounselors] = useState<Counselor[]>(counselorData);
  const [admins, setAdmins] = useState<Admin[]>(adminData);

  const [activeSub, setActiveSub] = useState<
    "students" | "counselors" | "admins"
  >("students");
  const [studentsPage, setStudentsPage] = useState(1);
  const [counselorsPage, setCounselorsPage] = useState(1);
  const [adminsPage, setAdminsPage] = useState(1);
  const [selectedOnPage, setSelectedOnPage] = useState<number[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Helpers to get current data & setters dynamically
  function getCurrentData<T extends UserType>() {
    if (activeSub === "students") {
      return {
        data: students as T[],
        setData: setStudents as React.Dispatch<React.SetStateAction<T[]>>,
      };
    }
    if (activeSub === "counselors") {
      return {
        data: counselors as T[],
        setData: setCounselors as React.Dispatch<React.SetStateAction<T[]>>,
      };
    }
    return {
      data: admins as T[],
      setData: setAdmins as React.Dispatch<React.SetStateAction<T[]>>,
    };
  }

  const handleDelete = useCallback(
    (id: number) => {
      const { data, setData } = getCurrentData();
      if (
        !window.confirm(
          `Are you sure you want to delete the record with ID: ${id} from ${activeSub}?`
        )
      )
        return;
      setData(data.filter((r) => r.id !== id));
      setSelectedOnPage((prev) =>
        prev.filter((selectedId) => selectedId !== id)
      );
    },
    [getCurrentData, activeSub]
  );

  const handleEdit = useCallback((row: UserType) => {
    alert(
      `Editing ${row.firstName} ${row.lastName} (ID: ${row.id}). (Placeholder)`
    );
  }, []);

  const { data } = getCurrentData();

  // Reset pagination on tab switch
  useEffect(() => {
    if (activeSub === "students") setStudentsPage(1);
    if (activeSub === "counselors") setCounselorsPage(1);
    if (activeSub === "admins") setAdminsPage(1);
    setSelectedOnPage([]);
    setRowsPerPage(10);
  }, [activeSub, students.length, counselors.length, admins.length]);

  // Filtering logic (useMemo for performance)
  const filtered = useMemo(() => {
    return data.filter((r: UserType) => {
      const candidates = [
        r.lastName ?? "",
        r.firstName ?? "",
        r.email ?? "",
        "college" in r ? r.college ?? "" : "",
      ];
      if (
        activeSub === "students" &&
        "program" in r &&
        "yearLevel" in r &&
        "emotionalStatus" in r
      )
        candidates.push(
          r.program ?? "",
          r.yearLevel ?? "",
          r.emotionalStatus ?? ""
        );
      if (activeSub === "counselors" && "availability" in r)
        candidates.push(r.availability ?? "");
      return candidates.join(" ").toLowerCase();
    });
  }, [data, activeSub]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const currentPage =
    activeSub === "students"
      ? Math.min(studentsPage, totalPages)
      : activeSub === "counselors"
      ? Math.min(counselorsPage, totalPages)
      : Math.min(adminsPage, totalPages);

  const pageStartIndex = (currentPage - 1) * rowsPerPage;
  const paginated = filtered.slice(
    pageStartIndex,
    pageStartIndex + rowsPerPage
  );

  const totalSelected = selectedOnPage.length;
  const allSelected =
    paginated.length > 0 && selectedOnPage.length === paginated.length;

  function toggleSelectAll() {
    if (allSelected) setSelectedOnPage([]);
    else setSelectedOnPage(paginated.map((r: UserType) => r.id));
  }

  function toggleRow(id: number) {
    setSelectedOnPage((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function goToPage(p: number) {
    if (p < 1 || p > totalPages) return;
    if (activeSub === "students") setStudentsPage(p);
    if (activeSub === "counselors") setCounselorsPage(p);
    if (activeSub === "admins") setAdminsPage(p);
    setSelectedOnPage([]);
  }

  function prevPage() {
    goToPage(Math.max(1, currentPage - 1));
  }
  function nextPage() {
    goToPage(Math.min(totalPages, currentPage + 1));
  }

  // Styling helpers
  const getEmotionalStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (["happy", "excited", "motivated", "confident", "inspired"].includes(s))
      return "bg-green-100 text-green-700";
    if (["stressed", "tired", "busy", "anxious"].includes(s))
      return "bg-yellow-100 text-yellow-700";
    if (["sad", "nasasaktan"].includes(s)) return "bg-red-100 text-red-700";
    if (["calm", "focused", "hopeful", "curious", "determined"].includes(s))
      return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
  };

  const getSubTabStyle = (key: string) =>
    activeSub === key
      ? "bg-black text-white"
      : "bg-gray-50 text-gray-700 hover:bg-gray-100";

  const subTabs = [
    { key: "students", label: "Student" },
    { key: "counselors", label: "Counselor" },
    { key: "admins", label: "Admin" },
  ];
  const rowsPerPageOptions = [10, 15, 20, 50];

  // Render
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <main className="p-6">
        <div className="space-y-6">
          <div className="bg-gray-100 rounded-lg inline-flex p-0.5 border border-gray-200">
            {subTabs.map((t) => (
              <button
                key={t.key}
                onClick={() =>
                  setActiveSub(t.key as "students" | "counselors" | "admins")
                }
                className={`px-4 py-1.5 rounded-md text-sm transition-all ${getSubTabStyle(
                  t.key
                )}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="bg-white border rounded-lg shadow-sm">
            <div className="p-4">
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader className="bg-white">
                    <TableRow className="border-b border-gray-200 hover:bg-white">
                      <TableHead className="w-[40px] text-center p-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <Menu size={14} className="text-gray-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-48">
                            <DropdownMenuItem>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Add New {activeSub.slice(0, -1)}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                selectedOnPage.forEach(handleDelete)
                              }
                              disabled={totalSelected === 0}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Selected ({totalSelected})
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableHead>
                      <TableHead className="w-[56px] text-center p-2">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={toggleSelectAll}
                          className="rounded-full"
                        />
                      </TableHead>
                      {[
                        { label: "Last Name" },
                        { label: "First Name" },
                        { label: "Email" },
                        ...(activeSub === "students"
                          ? [
                              { label: "College" },
                              { label: "Program" },
                              { label: "Year Level" },
                              { label: "Emotional Status" },
                            ]
                          : activeSub === "counselors"
                          ? [{ label: "College" }, { label: "Availability" }]
                          : [
                              { label: "Role ID" },
                              { label: "Date Added" },
                              { label: "Status" },
                            ]),
                      ].map((col) => (
                        <TableHead
                          key={col.label}
                          className="text-xs text-gray-500 font-medium whitespace-nowrap px-4 py-2"
                        >
                          {col.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.map((row: Student | Counselor | Admin) => (
                      <TableRow
                        key={row.id}
                        className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                      >
                        <TableCell className="text-center p-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                              >
                                <Menu size={14} className="text-gray-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-32">
                              <DropdownMenuItem>View Profile</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(row)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(row.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell className="text-center p-2">
                          <Checkbox
                            checked={selectedOnPage.includes(row.id)}
                            onCheckedChange={() => toggleRow(row.id)}
                            className="rounded-full"
                          />
                        </TableCell>
                        <TableCell className="text-sm font-medium text-gray-800 whitespace-nowrap px-4 py-2">
                          {row.lastName}
                        </TableCell>
                        <TableCell className="text-sm text-gray-800 whitespace-nowrap px-4 py-2">
                          {row.firstName}
                        </TableCell>
                        <TableCell className="text-sm text-blue-600 whitespace-nowrap px-4 py-2">
                          {row.email}
                        </TableCell>

                        {activeSub === "students" && (
                          <>
                            <TableCell className="text-sm text-gray-800 whitespace-nowrap px-4 py-2">
                              {(row as Student).college}
                            </TableCell>
                            <TableCell className="text-sm text-gray-800 whitespace-nowrap px-4 py-2">
                              {(row as Student).program}
                            </TableCell>
                            <TableCell className="text-sm text-gray-800 whitespace-nowrap px-4 py-2">
                              {(row as Student).yearLevel}
                            </TableCell>
                            <TableCell className="px-4 py-2">
                              <Badge
                                className={`text-xs font-medium rounded-full ${getEmotionalStatusStyle(
                                  (row as Student).emotionalStatus
                                )}`}
                              >
                                {(row as Student).emotionalStatus}
                              </Badge>
                            </TableCell>
                          </>
                        )}
                        {activeSub === "counselors" && (
                          <>
                            <TableCell className="text-sm text-gray-800 whitespace-nowrap px-4 py-2">
                              {(row as Counselor).college}
                            </TableCell>
                            <TableCell className="px-4 py-2">
                              <Badge
                                className={`text-xs font-medium rounded-full ${
                                  (row as Counselor).availability ===
                                  "Available"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {(row as Counselor).availability}
                              </Badge>
                            </TableCell>
                          </>
                        )}
                        {activeSub === "admins" && (
                          <>
                            <TableCell className="text-sm text-gray-800 whitespace-nowrap px-4 py-2">
                              ADM-{row.id.toString().padStart(3, "0")}
                            </TableCell>
                            <TableCell className="text-sm text-gray-800 whitespace-nowrap px-4 py-2">
                              2024-01-15
                            </TableCell>
                            <TableCell className="px-4 py-2">
                              <Badge className="bg-green-100 text-green-700">
                                Active
                              </Badge>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div className="flex items-center justify-between border-t p-4 text-sm">
              <div className="text-gray-600">
                {totalSelected} of {filtered.length} row(s) selected
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Rows per page:</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-sm px-3 flex items-center gap-1"
                      >
                        {rowsPerPage} <ChevronDown size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-20">
                      {rowsPerPageOptions.map((r) => (
                        <DropdownMenuItem
                          key={r}
                          onClick={() => setRowsPerPage(r)}
                        >
                          {r}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="text-gray-600 font-medium">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <Button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 disabled:opacity-50"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
