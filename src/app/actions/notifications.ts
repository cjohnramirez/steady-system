"use server";

import { firebaseAdmin } from "@/utils/firebase/admin";
import { createClient } from "@/utils/supabase/server";
import { roles } from "@/types/main";

interface NotificationPayload {
  title: string;
  message: string;
  type?: "appointment" | "system" | "reminder" | "alert";
  link?: string;
  expiresAt?: string;
}

/**
 * Send notification to a specific user
 */
export async function sendNotificationToUser(
  userId: string,
  payload: NotificationPayload
) {
  const supabase = await createClient();

  // Get user's FCM tokens
  const { data: tokens, error } = await supabase
    .from("fcm_token")
    .select("token")
    .eq("user_id", userId);

  if (error || !tokens?.length) {
    console.log("No FCM tokens found for user:", userId);
    // Still save to database for in-app notification
    await saveNotificationToDatabase(supabase, [userId], payload);
    return { sent: 0, saved: true };
  }

  // Send FCM
  const result = await sendFCMNotification(
    tokens.map((t) => t.token),
    payload
  );

  // Save to database
  await saveNotificationToDatabase(supabase, [userId], payload);

  return { sent: result.successCount, saved: true };
}

/**
 * Send notification to users by role
 */
export async function sendNotificationToRole(
  role: roles,
  payload: NotificationPayload
) {
  const supabase = await createClient();

  // Get all FCM tokens for the role
  const { data: tokens, error } = await supabase
    .from("fcm_token")
    .select("token, user_id")
    .eq("role", role);

  if (error) {
    console.error("Error fetching tokens:", error);
    return { sent: 0, error: error.message };
  }

  if (!tokens?.length) {
    return { sent: 0, message: "No users with FCM tokens found for this role" };
  }

  const uniqueUserIds = [...new Set(tokens.map((t) => t.user_id))];
  const fcmTokens = tokens.map((t) => t.token);

  // Send FCM
  const result = await sendFCMNotification(fcmTokens, payload);

  // Save to database for each user
  await saveNotificationToDatabase(supabase, uniqueUserIds, payload);

  return {
    sent: result.successCount,
    failed: result.failureCount,
    totalUsers: uniqueUserIds.length,
  };
}

/**
 * Send notification to multiple roles
 */
export async function sendNotificationToRoles(
  targetRoles: roles[],
  payload: NotificationPayload
) {
  const supabase = await createClient();

  // Get all FCM tokens for the roles
  const { data: tokens, error } = await supabase
    .from("fcm_token")
    .select("token, user_id")
    .in("role", targetRoles);

  if (error) {
    console.error("Error fetching tokens:", error);
    return { sent: 0, error: error.message };
  }

  if (!tokens?.length) {
    return { sent: 0, message: "No users with FCM tokens found" };
  }

  const uniqueUserIds = [...new Set(tokens.map((t) => t.user_id))];
  const fcmTokens = tokens.map((t) => t.token);

  // Send FCM
  const result = await sendFCMNotification(fcmTokens, payload);

  // Save to database
  await saveNotificationToDatabase(supabase, uniqueUserIds, payload);

  return {
    sent: result.successCount,
    failed: result.failureCount,
    totalUsers: uniqueUserIds.length,
  };
}

/**
 * Send appointment reminder notification
 */
export async function sendAppointmentReminder(
  studentUserId: string,
  counselorUserId: string,
  appointmentDetails: {
    scheduledAt: string;
    counselorName?: string;
    studentName?: string;
  }
) {
  const { scheduledAt, counselorName, studentName } = appointmentDetails;
  const formattedDate = new Date(scheduledAt).toLocaleString();

  // Notify student
  await sendNotificationToUser(studentUserId, {
    title: "Appointment Reminder",
    message: `Your appointment with ${counselorName || "your counselor"} is scheduled for ${formattedDate}`,
    type: "appointment",
    link: "/student/appointment",
  });

  // Notify counselor
  await sendNotificationToUser(counselorUserId, {
    title: "Upcoming Appointment",
    message: `You have an appointment with ${studentName || "a student"} at ${formattedDate}`,
    type: "appointment",
    link: "/counselor",
  });
}

// Helper: Send FCM notification
async function sendFCMNotification(
  tokens: string[],
  payload: NotificationPayload
) {
  const messaging = firebaseAdmin.messaging();

  const message = {
    notification: {
      title: payload.title,
      body: payload.message,
    },
    data: {
      type: payload.type || "system",
      link: payload.link || "",
      timestamp: new Date().toISOString(),
    },
    tokens,
  };

  try {
    const response = await messaging.sendEachForMulticast(message);
    return response;
  } catch (error) {
    console.error("FCM send error:", error);
    return { successCount: 0, failureCount: tokens.length, responses: [] };
  }
}

// Helper: Save notification to database
async function saveNotificationToDatabase(
  supabase: any,
  userIds: string[],
  payload: NotificationPayload
) {
  const notifications = userIds.map((userId) => ({
    user_id: userId,
    title: payload.title,
    message: payload.message,
    type: payload.type || "system",
    link: payload.link,
    is_dismissed: false,
    expires_at: payload.expiresAt || null,
  }));

  const { error } = await supabase.from("notification").insert(notifications);

  if (error) {
    console.error("Error saving notifications:", error);
  }
}
