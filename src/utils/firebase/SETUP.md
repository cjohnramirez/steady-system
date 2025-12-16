# Firebase Cloud Messaging Setup Guide

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing
3. Enable Cloud Messaging

## 2. Get Firebase Config (Client-side)

1. In Firebase Console → Project Settings → General
2. Scroll to "Your apps" → Add Web App
3. Copy the config values

## 3. Generate VAPID Key

1. Firebase Console → Project Settings → Cloud Messaging
2. Under "Web Push certificates", click "Generate key pair"
3. Copy the public key

## 4. Get Service Account Key (Server-side)

1. Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file

## 5. Environment Variables

Add these to your `.env.local`:

```bash
# Firebase Client Config
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key

# Firebase Admin (Server-side)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key\n-----END PRIVATE KEY-----\n"
```

## 6. Run Database Migration

Execute the SQL in `src/utils/firebase/fcm-tokens-table.sql` in your Supabase SQL editor.

## 7. Usage Examples

### In Client Components:

```tsx
import { useFCM } from "@/hooks/use-fcm";

function MyComponent() {
  const { requestPermission, notificationPermission } = useFCM();

  return (
    <button onClick={requestPermission}>
      Enable Notifications ({notificationPermission})
    </button>
  );
}
```

### In Server Actions:

```tsx
import { 
  sendNotificationToUser,
  sendNotificationToRole,
  sendAppointmentReminder 
} from "@/app/actions/notifications";

// Send to specific user
await sendNotificationToUser(userId, {
  title: "New Message",
  message: "You have a new message",
  link: "/messages"
});

// Send to all students
await sendNotificationToRole("student", {
  title: "Announcement",
  message: "New counseling hours available"
});

// Send appointment reminder
await sendAppointmentReminder(studentId, counselorId, {
  scheduledAt: "2025-12-20T10:00:00Z",
  counselorName: "Dr. Smith",
  studentName: "John Doe"
});
```

### From Client (using fetch):

```tsx
import { sendNotification, notifyAllStudents } from "@/lib/notifications";

// Send to role
await notifyAllStudents("Title", "Message");

// Send custom
await sendNotification({
  userId: "user-id",
  title: "Hello",
  message: "World",
  type: "reminder",
  link: "/dashboard"
});
```

## File Structure

```
src/
├── utils/firebase/
│   ├── config.ts          # Client-side Firebase config
│   ├── admin.ts           # Server-side Firebase Admin
│   └── fcm-tokens-table.sql # Database schema
├── hooks/
│   └── use-fcm.ts         # FCM React hook
├── components/
│   └── fcm-provider.tsx   # FCM initialization provider
├── app/
│   ├── api/notifications/
│   │   └── send/route.ts  # API route for sending
│   └── actions/
│       └── notifications.ts # Server actions
├── lib/
│   └── notifications.ts   # Client-side helpers
public/
└── firebase-messaging-sw.js # Service worker for background notifications
```
