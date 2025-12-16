import { roles } from "@/types/main";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  userId: string;
  userRole: roles | "";
  userName: string;
  emotionalStatus: string;
  setId: (newId: string) => void;
  setUserId: (newId: string) => void;
  setUserRole: (newUserRole: roles | "") => void;
  setUserName: (newUserName: string) => void;
  setEmotionalStatus: (newEmotionalStatus: string) => void;
}

export const useUserStore = create<User>()(
  persist(
    (set) => ({
      id: "",
      userId: "",
      userRole: "",
      userName: "",
      emotionalStatus: "tired",
      setId: (newId: string) => set({ id: newId }),
      setUserId: (newId: string) => set({ userId: newId }),
      setUserRole: (newUserRole: roles | "") => set({ userRole: newUserRole }),
      setUserName: (newUserName: string) => set({ userName: newUserName }),
      setEmotionalStatus: (newEmotionalStatus: string) =>
        set({ emotionalStatus: newEmotionalStatus }),
    }),
    { name: "user-store" },
  ),
);
