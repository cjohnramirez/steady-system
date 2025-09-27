import { Notification } from "../types/notifications";

export const NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    text: "Maria Dela Cruz requested an appointment.",
    time: new Date("2024-06-10T09:58:00Z"),
    read: false,
  },
  {
    id: 2,
    text: "New account registered: Lianne Bautista.",
    time: new Date("2024-06-10T09:00:00Z"),
    read: false,
  },
  {
    id: 3,
    text: "System maintenance scheduled for tonight.",
    time: new Date("2024-06-09T10:00:00Z"),
    read: true,
  },
  {
    id: 4,
    text: "Counselor Manalo updated her schedule.",
    time: new Date("2024-06-08T10:00:00Z"),
    read: true,
  },
];
