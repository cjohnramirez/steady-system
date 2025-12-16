import { NextRequest, NextResponse } from "next/server";
import { firebaseAdmin } from "@/utils/firebase/admin";
import { createClient } from "@/utils/supabase/server";
import { roles } from "@/types/main";

interface SendNotificationRequest {
  // Target options (at least one required)
  userId?: string;
  userIds?: string[];
  role?: roles;
  roles?: roles[];
  
  // Notification content
  title: string;
  message: string;
  type?: string;
  link?: string;
  
  // Options
  saveToDatabase?: boolean;
  expiresAt?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: SendNotificationRequest = await request.json();

    const {
      userId,
      userIds,
      role,
      roles: targetRoles,
      title,
      message,
      type = "system",
      link,
      saveToDatabase = true,
      expiresAt,
    } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required" },
        { status: 400 }
      );
    }

    // Build query to get FCM tokens
    let query = supabase.from("fcm_token").select("token, user_id, role");

    // Filter by specific users
    if (userId) {
      query = query.eq("user_id", userId);
    } else if (userIds && userIds.length > 0) {
      query = query.in("user_id", userIds);
    }
    // Filter by roles
    else if (role) {
      query = query.eq("role", role);
    } else if (targetRoles && targetRoles.length > 0) {
      query = query.in("role", targetRoles);
    }

    const { data: tokens, error: tokensError } = await query;

    if (tokensError) {
      console.error("Error fetching FCM tokens:", tokensError);
      return NextResponse.json(
        { error: "Failed to fetch FCM tokens" },
        { status: 500 }
      );
    }

    if (!tokens || tokens.length === 0) {
      return NextResponse.json(
        { message: "No tokens found for the specified targets", sent: 0 },
        { status: 200 }
      );
    }

    // Prepare FCM message
    const fcmTokens = tokens.map((t) => t.token);
    const uniqueUserIds = [...new Set(tokens.map((t) => t.user_id))];

    // Send FCM notifications
    const messaging = firebaseAdmin.messaging();
    
    const fcmMessage = {
      notification: {
        title,
        body: message,
      },
      data: {
        type,
        link: link || "",
        timestamp: new Date().toISOString(),
      },
      tokens: fcmTokens,
    };

    const response = await messaging.sendEachForMulticast(fcmMessage);

    // Handle failed tokens (remove invalid ones)
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(fcmTokens[idx]);
          console.error(`FCM send failed for token:`, resp.error);
        }
      });

      // Remove invalid tokens from database
      if (failedTokens.length > 0) {
        await supabase.from("fcm_token").delete().in("token", failedTokens);
      }
    }

    // Save notifications to database
    if (saveToDatabase) {
      const notifications = uniqueUserIds.map((uid) => ({
        user_id: uid,
        title,
        message,
        type,
        link,
        is_dismissed: false,
        expires_at: expiresAt || null,
      }));

      const { error: insertError } = await supabase
        .from("notification")
        .insert(notifications);

      if (insertError) {
        console.error("Error saving notifications:", insertError);
      }
    }

    return NextResponse.json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
      totalTargets: uniqueUserIds.length,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
