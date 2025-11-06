"use client";

import AdminProfile from "./_components/profile-information";
import ChangePassword from "./_components/change-password";
import ProfilePicture from "./_components/profile-picture";

export default function ProfileSettingsPage() {
  return (
    <main className="flex-1 space-y-8">
      <AdminProfile />
      <ChangePassword />
      <ProfilePicture />
    </main>
  );
}
