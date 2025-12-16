import { roles } from "@/types/main";

interface SendNotificationOptions {
  // Target options
  userId?: string;
  userIds?: string[];
  role?: roles;
  roles?: roles[];
  
  // Content
  title: string;
  message: string;
  type?: "appointment" | "system" | "reminder" | "alert";
  link?: string;
  
  // Options
  saveToDatabase?: boolean;
  expiresAt?: Date;
}

/**
 * Send push notification to users
 * Can target by userId, multiple userIds, role, or multiple roles
 */
export async function sendNotification(options: SendNotificationOptions) {
  const response = await fetch("/api/notifications/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...options,
      expiresAt: options.expiresAt?.toISOString(),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to send notification");
  }

  return response.json();
}

/**
 * Send notification to all students
 */
export async function notifyAllStudents(
  title: string,
  message: string,
  options?: Partial<SendNotificationOptions>
) {
  return sendNotification({
    role: "student",
    title,
    message,
    type: "system",
    ...options,
  });
}

/**
 * Send notification to all counselors
 */
export async function notifyAllCounselors(
  title: string,
  message: string,
  options?: Partial<SendNotificationOptions>
) {
  return sendNotification({
    role: "counselor",
    title,
    message,
    type: "system",
    ...options,
  });
}

/**
 * Send notification to all admins
 */
export async function notifyAllAdmins(
  title: string,
  message: string,
  options?: Partial<SendNotificationOptions>
) {
  return sendNotification({
    role: "admin",
    title,
    message,
    type: "system",
    ...options,
  });
}

/**
 * Send appointment notification
 */
export async function sendAppointmentNotification(
  userId: string,
  title: string,
  message: string,
  appointmentLink?: string
) {
  return sendNotification({
    userId,
    title,
    message,
    type: "appointment",
    link: appointmentLink,
  });
}

/**
 * Send reminder notification
 */
export async function sendReminderNotification(
  userId: string,
  title: string,
  message: string,
  link?: string
) {
  return sendNotification({
    userId,
    title,
    message,
    type: "reminder",
    link,
  });
}
