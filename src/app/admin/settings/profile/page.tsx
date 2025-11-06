"use client";

import { Edit } from "lucide-react";
import { useState } from "react";
import AdminProfile from "./_components/profile-information";

export default function ProfileSettingsPage() {
  return (
    <>
      <main className="flex-1 space-y-8">
        <AdminProfile />
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold">Change Password</h2>
          <p className="mb-6 text-sm text-gray-500">
            Securely change your account password. Use a strong combination of
            letters, numbers, and symbols.
          </p>

          <div className="mb-4 grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-600">Old Password</label>
              <input
                type="password"
                defaultValue="***************"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">New Password</label>
              <input
                type="password"
                defaultValue="***************"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">
                Confirm New Password
              </label>
              <input
                type="password"
                defaultValue="***************"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button className="rounded-lg bg-[#f7a84e] px-6 py-2 font-medium text-white hover:bg-[#e79632]">
              Save
            </button>
          </div>
        </section>

        {/* Profile Picture */}
        <section className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="mb-1 text-lg font-semibold">Profile Picture</h2>
            <p className="text-sm text-gray-500">
              Upload or update your profile photo. Click the profile icon to
              upload a new photo.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-300 to-[#f7a84e]">
              <Edit className="absolute right-0 bottom-0 cursor-pointer rounded-full bg-white p-1 text-gray-600" />
            </div>
            <div className="flex gap-2">
              <button className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100">
                Remove
              </button>
              <button className="rounded-lg bg-[#f7a84e] px-5 py-2 text-white hover:bg-[#e79632]">
                Save
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
