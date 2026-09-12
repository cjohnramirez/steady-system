import { roles } from "@/types/main";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * A cache of who is signed in, for rendering the shell before the server answers.
 *
 * This is not an authorization boundary and must never be treated as one. It lives
 * in localStorage, so anyone can edit it. Access control is enforced by middleware,
 * by the layout guards, and ultimately by row-level security.
 */
interface UserState {
  id: string;
  userRole: roles | "";
  userName: string;
  emotionalStatus: string;
  setId: (newId: string) => void;
  setUserRole: (newUserRole: roles | "") => void;
  setUserName: (newUserName: string) => void;
  setEmotionalStatus: (newEmotionalStatus: string) => void;
  /** Clears every field. Sign-out used to clear only the name and the role. */
  reset: () => void;
}

const EMPTY = {
  id: "",
  userRole: "" as const,
  userName: "",
  emotionalStatus: "",
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      ...EMPTY,
      setId: (newId: string) => set({ id: newId }),
      setUserRole: (newUserRole: roles | "") => set({ userRole: newUserRole }),
      setUserName: (newUserName: string) => set({ userName: newUserName }),
      setEmotionalStatus: (newEmotionalStatus: string) =>
        set({ emotionalStatus: newEmotionalStatus }),
      reset: () => set({ ...EMPTY }),
    }),
    { name: "user-store" },
  ),
);
