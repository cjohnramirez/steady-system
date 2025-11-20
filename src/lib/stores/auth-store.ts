import { roles } from "@/types/main";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  userRole: roles | "";
  userName: string;
  setUserRole: (newUserRole: roles | "") => void;
  setUserName: (newUserName: string) => void;
}
export const useUserStore = create<User>()(
  persist(
    (set) => ({
      userRole: "",
      userName: "",
      setUserRole: (newUserRole: roles | "") => set({ userRole: newUserRole }),
      setUserName: (newUserName: string) => set({ userName: newUserName }),
    }),
    { name: "user-store" },
  ),
);
