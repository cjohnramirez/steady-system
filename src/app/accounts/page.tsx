"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Bell,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  LogOut,
  Settings,
  UserPlus,
  Trash2,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

type Student = {
  id: number;
  lastName: string;
  firstName: string;
  email: string;
  college: string;
  program: string;
  yearLevel: string;
  emotionalStatus: string;
};

type Counselor = {
  id: number;
  lastName: string;
  firstName: string;
  email: string;
  college: string;
  availability: string;
};

type Admin = {
  id: number;
  lastName: string;
  firstName: string;
  email: string;
};

type UserType = Student | Counselor | Admin;

const createUserData = <T extends { lastName: string; firstName: string }>(
  baseId: number,
  users: Omit<T, "id" | "email">[]
): T[] => {
  return users.map(
    (u, index) =>
      ({
        ...u,
        id: baseId + index,
        email:
          `${u.firstName.toLowerCase()}.${u.lastName.toLowerCase()}@ustp.edu.ph`.replace(
            /\s/g,
            ""
          ),
      } as unknown as T)
  );
};

const createStudentData = (
  baseId: number,
  students: Omit<Student, "id" | "email">[]
) => createUserData<Student>(baseId, students);
const createCounselorData = (
  baseId: number,
  counselors: Omit<Counselor, "id" | "email">[]
) => createUserData<Counselor>(baseId, counselors);
const createAdminData = (
  baseId: number,
  admins: Omit<Admin, "id" | "email">[]
) => createUserData<Admin>(baseId, admins);

// USTP-CDO Colleges and Programs Data
const STUDENT_DATA_INPUT: Omit<Student, "id" | "email">[] = [
  {
    lastName: "Dela Cruz",
    firstName: "Maria",
    college: "CITC",
    program: "BS Computer Science",
    yearLevel: "3rd Year",
    emotionalStatus: "Happy",
  },
  {
    lastName: "Ramirez",
    firstName: "John Carl",
    college: "CSM",
    program: "BS Applied Mathematics",
    yearLevel: "2nd Year",
    emotionalStatus: "Depende",
  },
  {
    lastName: "Santos",
    firstName: "Angela",
    college: "COE",
    program: "BS Civil Engineering",
    yearLevel: "1st Year",
    emotionalStatus: "Stressed",
  },
  {
    lastName: "Lim",
    firstName: "Kevin",
    college: "CITC",
    program: "BS Info Technology",
    yearLevel: "2nd Year",
    emotionalStatus: "Happy",
  },
  {
    lastName: "Tan",
    firstName: "Michelle",
    college: "COE",
    program: "BS Mechanical Eng'g",
    yearLevel: "3rd Year",
    emotionalStatus: "Confident",
  },
  {
    lastName: "Villanueva",
    firstName: "Carlo",
    college: "CITC",
    program: "BS Data Science",
    yearLevel: "3rd Year",
    emotionalStatus: "Happy",
  },
  {
    lastName: "Bautista",
    firstName: "Lianne",
    college: "COT",
    program: "BS Autotronics",
    yearLevel: "3rd Year",
    emotionalStatus: "Sad",
  },
  {
    lastName: "Gomez",
    firstName: "Rafael",
    college: "CSTE",
    program: "B Secondary Educ - Math",
    yearLevel: "3rd Year",
    emotionalStatus: "Happy",
  },
  {
    lastName: "Cruz",
    firstName: "Andrea",
    college: "COE",
    program: "BS Electrical Eng'g",
    yearLevel: "1st Year",
    emotionalStatus: "Stressed",
  },
  {
    lastName: "Lopez",
    firstName: "Carlo",
    college: "COT",
    program: "BS Electronics Technology",
    yearLevel: "4th Year",
    emotionalStatus: "Excited",
  },
  {
    lastName: "Torres",
    firstName: "Fatima",
    college: "CSM",
    program: "BS Applied Physics",
    yearLevel: "2nd Year",
    emotionalStatus: "Motivated",
  },
  {
    lastName: "Ramos",
    firstName: "Julius",
    college: "CITC",
    program: "BS Comp Engineering",
    yearLevel: "1st Year",
    emotionalStatus: "Happy",
  },
  {
    lastName: "Mendoza",
    firstName: "Sofia",
    college: "COT",
    program: "BS Electro-Mech Tech",
    yearLevel: "2nd Year",
    emotionalStatus: "Curious",
  },
];
const COUNSELOR_DATA_INPUT: Omit<Counselor, "id" | "email">[] = [
  {
    lastName: "Manalo",
    firstName: "Grace",
    college: "CITC",
    availability: "Available",
  },
  {
    lastName: "Domingo",
    firstName: "Paolo",
    college: "CSTE",
    availability: "Unavailable",
  },
  {
    lastName: "Fernandez",
    firstName: "Lara",
    college: "CEA",
    availability: "Available",
  },
  {
    lastName: "Castro",
    firstName: "Miguel",
    college: "CSM",
    availability: "Available",
  },
  {
    lastName: "Alvarez",
    firstName: "Nina",
    college: "COT",
    availability: "Unavailable",
  },
];
const ADMIN_DATA_INPUT: Omit<Admin, "id" | "email">[] = [
  { lastName: "Santiago", firstName: "Rico" },
  { lastName: "Bautista", firstName: "Arlene" },
  { lastName: "Villamor", firstName: "James" },
];

const INITIAL_STUDENTS = createStudentData(1, STUDENT_DATA_INPUT);
const INITIAL_COUNSELORS = createCounselorData(1, COUNSELOR_DATA_INPUT);
const INITIAL_ADMINS = createAdminData(1, ADMIN_DATA_INPUT);

type Notification = { id: number; text: string; time: string; read: boolean };
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    text: "Maria Dela Cruz requested an appointment.",
    time: "2 min ago",
    read: false,
  },
  {
    id: 2,
    text: "New account registered: Lianne Bautista.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    text: "System maintenance scheduled for tonight.",
    time: "Yesterday",
    read: true,
  },
  {
    id: 4,
    text: "Counselor Manalo updated her schedule.",
    time: "2 days ago",
    read: true,
  },
];

export default function AccountsPage() {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [counselors, setCounselors] = useState<Counselor[]>(INITIAL_COUNSELORS);
  const [admins, setAdmins] = useState<Admin[]>(INITIAL_ADMINS);

  // UI based siya
  const [activeNav, setActiveNav] = useState<
    "Dashboard" | "Accounts" | "Appointments" | "Landing Page" | "Settings"
  >("Accounts");
  const [activeSub, setActiveSub] = useState<
    "students" | "counselors" | "admins"
  >("students");
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>(
    INITIAL_NOTIFICATIONS
  );
  const unread = notifications.filter((n) => !n.read).length;

  const [studentsPage, setStudentsPage] = useState(1);
  const [counselorsPage, setCounselorsPage] = useState(1);
  const [adminsPage, setAdminsPage] = useState(1);
  const [selectedOnPage, setSelectedOnPage] = useState<number[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getCurrentData = useCallback((): {
    data: UserType[];
    setData: React.Dispatch<React.SetStateAction<any[]>>;
  } => {
    if (activeSub === "students")
      return { data: students, setData: setStudents };
    if (activeSub === "counselors")
      return { data: counselors, setData: setCounselors };
    return { data: admins, setData: setAdmins };
  }, [activeSub, students, counselors, admins]);

  const handleDelete = useCallback(
    (id: number) => {
      const { data, setData } = getCurrentData();
      if (
        !window.confirm(
          `Are you sure you want to delete the record with ID: ${id} from ${activeSub}?`
        )
      ) {
        return;
      }
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

  const handleLogOut = () => {
    alert("Logging out...");
    // eme lang ni siya for demo purposes
    console.log("Logged out successfully.");
  };

  const handleSettings = () => {
    alert("Opening user settings...");
    // eme lang ni siya for demo purposes
    console.log("Settings accessed.");
  };

  const { data } = getCurrentData();

  useEffect(() => {
    if (activeSub === "students") setStudentsPage(1);
    if (activeSub === "counselors") setCounselorsPage(1);
    if (activeSub === "admins") setAdminsPage(1);
    setSelectedOnPage([]);
    setRowsPerPage(10);
  }, [activeSub, search, students.length, counselors.length, admins.length]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((r: any) => {
      const candidates = [
        r.lastName ?? "",
        r.firstName ?? "",
        r.email ?? "",
        r.college ?? "",
      ];
      if (activeSub === "students") {
        candidates.push(
          r.program ?? "",
          r.yearLevel ?? "",
          r.emotionalStatus ?? ""
        );
      }
      if (activeSub === "counselors") {
        candidates.push(r.availability ?? "");
      }
      return candidates.join(" ").toLowerCase().includes(q);
    });
  }, [data, search, activeSub]);

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
    else setSelectedOnPage(paginated.map((r: any) => r.id));
  }
  function toggleRow(id: number) {
    if (selectedOnPage.includes(id))
      setSelectedOnPage(selectedOnPage.filter((x) => x !== id));
    else setSelectedOnPage([...selectedOnPage, id]);
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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

  // UI Helpers (colors, styles)
  const navItems = [
    "Dashboard",
    "Accounts",
    "Appointments",
    "Landing Page",
    "Settings",
  ] as const;
  const subTabs = [
    { key: "students", label: "Student" },
    { key: "counselors", label: "Counselor" },
    { key: "admins", label: "Admin" },
  ];
  const rowsPerPageOptions = [10, 15, 20, 50];

  const getEmotionalStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "happy":
      case "excited":
      case "motivated":
      case "confident":
      case "inspired":
        return "bg-green-100 text-green-700";
      case "stressed":
      case "tired":
      case "busy":
      case "anxious":
        return "bg-yellow-100 text-yellow-700";
      case "sad":
      case "nasasaktan":
        return "bg-red-100 text-red-700";
      case "calm":
      case "focused":
      case "hopeful":
      case "curious":
      case "determined":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getSubTabStyle = (key: string) => {
    return activeSub === key
      ? "bg-black text-white"
      : "bg-gray-50 text-gray-700 hover:bg-gray-100";
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* HEADER */}
      <header className="flex items-center justify-between bg-white px-6 py-3 border-b border-gray-200">
        {/* LEFT SIDE: Logo, Title, and User/Role Dropdown */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-orange-500"></div>
            <div className="font-semibold text-gray-800 whitespace-nowrap">
              Guidance and Counseling Services
            </div>
          </div>

          <div className="h-6 w-px bg-gray-300"></div>

          {/* User/Role Dropdown (Admin01) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1.5 p-1.5 h-auto text-sm"
              >
                <span className="font-medium text-gray-900">admin01</span>
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-700 font-normal hover:bg-gray-200"
                >
                  Admin
                </Badge>
                <ChevronDown size={14} className="text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {/* Functional Settings */}
              <DropdownMenuItem onClick={handleSettings}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* Functional Log Out */}
              <DropdownMenuItem onClick={handleLogOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* RIGHT SIDE: Search, Notifications, and Menu */}
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <Input
              placeholder="Search credentials"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-80 h-9 pl-10 bg-gray-50 border-gray-300 focus-visible:ring-black"
            />
          </div>

          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full hover:bg-gray-100"
              >
                <Bell size={20} className="text-gray-600" />
                {unread > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center h-4 w-4 text-xs font-bold text-white bg-red-600 rounded-full ring-2 ring-white">
                    {unread}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 p-0 shadow-xl border-gray-200 mt-2 mr-2"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-base font-semibold">Notifications</h3>
                <Button
                  onClick={markAllRead}
                  variant="link"
                  className="h-auto p-0 text-sm text-blue-600"
                >
                  Mark all read
                </Button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 && (
                  <div className="p-4 text-sm text-gray-500 text-center">
                    No notifications.
                  </div>
                )}
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      n.read ? "bg-white" : "bg-blue-50/70"
                    }`}
                  >
                    <div className="flex-shrink-0 pt-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          n.read ? "bg-transparent" : "bg-blue-600"
                        }`}
                      ></div>
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-normal text-gray-800">
                        {n.text}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Hamburger Menu (Placeholder) */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-gray-100"
          >
            <Menu size={20} className="text-gray-600" />
          </Button>
        </div>
      </header>

      {/* MAIN NAV */}
      <nav className="flex items-center gap-1 bg-white px-6">
        {navItems.map((item) => (
          <button
            key={item}
            onClick={() => setActiveNav(item)}
            className={`px-3 py-3 text-sm transition-all ${
              activeNav === item
                ? "font-semibold text-black border-b-2 border-black"
                : "text-gray-600 hover:text-black"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      {/* MAIN CONTENT */}
      <main className="p-6">
        {activeNav !== "Accounts" && (
          <div className="bg-white p-6 rounded border">
            <h2 className="text-lg font-semibold">{activeNav} Content Here</h2>
            <p className="text-sm text-gray-500 mt-2">
              This is a placeholder area for the {activeNav} page.
            </p>
          </div>
        )}

        {/* Accounts content */}
        {activeNav === "Accounts" && (
          <div className="space-y-6">
            {/* Sub-tabs (Segmented Control) */}
            <div className="bg-gray-100 rounded-lg inline-flex p-0.5 border border-gray-200">
              {subTabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveSub(t.key as any)}
                  className={`px-4 py-1.5 rounded-md text-sm transition-all ${getSubTabStyle(
                    t.key
                  )}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Table card */}
            <div className="bg-white border rounded-lg shadow-sm">
              <div className="p-4">
                {/* Table */}
                <div className="overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader className="bg-white">
                      <TableRow className="border-b border-gray-200 hover:bg-white">
                        {/* More Menu (Bulk Actions) */}
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
                              {/* Delete Selected (Functional) */}
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

                        {/* Checkbox (Select All) */}
                        <TableHead className="w-[56px] text-center p-2">
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={toggleSelectAll}
                            className="rounded-full"
                          />
                        </TableHead>

                        {/* Column Headers */}
                        <TableHead className="text-xs text-gray-500 font-medium whitespace-nowrap px-4 py-2">
                          Last Name
                        </TableHead>
                        <TableHead className="text-xs text-gray-500 font-medium whitespace-nowrap px-4 py-2">
                          First Name
                        </TableHead>
                        <TableHead className="text-xs text-gray-500 font-medium whitespace-nowrap px-4 py-2">
                          Email
                        </TableHead>

                        {activeSub === "students" && (
                          <>
                            <TableHead className="text-xs text-gray-500 font-medium whitespace-nowrap px-4 py-2">
                              College
                            </TableHead>
                            <TableHead className="text-xs text-gray-500 font-medium whitespace-nowrap px-4 py-2">
                              Program
                            </TableHead>
                            <TableHead className="text-xs text-gray-500 font-medium whitespace-nowrap px-4 py-2">
                              Year Level
                            </TableHead>
                            <TableHead className="text-xs text-gray-500 font-medium whitespace-nowrap px-4 py-2">
                              Emotional Status
                            </TableHead>
                          </>
                        )}
                        {activeSub === "counselors" && (
                          <>
                            <TableHead className="text-xs text-gray-500 font-medium whitespace-nowrap px-4 py-2">
                              College
                            </TableHead>
                            <TableHead className="text-xs text-gray-500 font-medium whitespace-nowrap px-4 py-2">
                              Availability
                            </TableHead>
                          </>
                        )}
                        {activeSub === "admins" && (
                          <>
                            <TableHead className="text-xs text-gray-500 font-medium whitespace-nowrap px-4 py-2">
                              Role ID
                            </TableHead>
                            <TableHead className="text-xs text-gray-500 font-medium whitespace-nowrap px-4 py-2">
                              Date Added
                            </TableHead>
                            <TableHead className="text-xs text-gray-500 font-medium whitespace-nowrap px-4 py-2">
                              Status
                            </TableHead>
                          </>
                        )}
                        {/* Using placeholder headers for Admin columns */}
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {paginated.map((row: any) => (
                        <TableRow
                          key={row.id}
                          className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                        >
                          {/* More icon/Menu - ROW ACTIONS */}
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
                              <DropdownMenuContent
                                align="start"
                                className="w-32"
                              >
                                <DropdownMenuItem>
                                  View Profile
                                </DropdownMenuItem>

                                {/* EDIT Function (Functional) */}
                                <DropdownMenuItem
                                  onClick={() => handleEdit(row)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>

                                {/* DELETE Function (Functional) */}
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

                          {/* Checkbox */}
                          <TableCell className="text-center p-2">
                            <Checkbox
                              checked={selectedOnPage.includes(row.id)}
                              onCheckedChange={() => toggleRow(row.id)}
                              className="rounded-full"
                            />
                          </TableCell>

                          {/* Data Fields */}
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
                                {row.college}
                              </TableCell>
                              <TableCell className="text-sm text-gray-800 whitespace-nowrap px-4 py-2">
                                {row.program}
                              </TableCell>
                              <TableCell className="text-sm text-gray-800 whitespace-nowrap px-4 py-2">
                                {row.yearLevel}
                              </TableCell>
                              <TableCell className="px-4 py-2">
                                <Badge
                                  className={`text-xs font-medium rounded-full ${getEmotionalStatusStyle(
                                    row.emotionalStatus
                                  )}`}
                                >
                                  {row.emotionalStatus}
                                </Badge>
                              </TableCell>
                            </>
                          )}

                          {activeSub === "counselors" && (
                            <>
                              <TableCell className="text-sm text-gray-800 whitespace-nowrap px-4 py-2">
                                {row.college}
                              </TableCell>
                              <TableCell className="px-4 py-2">
                                <Badge
                                  className={`text-xs font-medium rounded-full ${
                                    row.availability === "Available"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {row.availability}
                                </Badge>
                              </TableCell>
                            </>
                          )}

                          {activeSub === "admins" && (
                            <>
                              {/* Placeholder data for Admin columns */}
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

              {/* FOOTER: Pagination and Control */}
              <div className="flex items-center justify-between border-t p-4 text-sm">
                <div className="text-gray-600">
                  {totalSelected} of {filtered.length} row(s) selected
                </div>

                <div className="flex items-center gap-4">
                  {/* Rows per page dropdown */}
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

                  {/* Page Indicator */}
                  <div className="text-gray-600 font-medium">
                    Page {currentPage} of {totalPages}
                  </div>

                  {/* Arrows */}
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
        )}
      </main>
    </div>
  );
}
