"use client";

import { Edit } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const [profile, setProfile] = useState({
    firstName: "Juan Peter",
    lastName: "dela Cruz",
    suffix: "N/A",
    email: "juanpeter.delacruz@ustp.edu.ph",
    phone: "0985840284",
    nickname: "admin01",
  });

  return (
    <div className="min-h-screen">
      {/* Top Nav Indicator */}
      <div className="text-gray-600 text-sm mb-6">
        Guidance and Counseling Services / <span className="font-semibold">Settings</span>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-64">
          <input
            type="text"
            placeholder="Search accounts"
            className="w-full px-4 py-2 mb-6 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <div className="text-sm text-gray-600">
            <div className="font-semibold mb-3">Account Settings</div>
            <div className="hover:text-black cursor-pointer mb-5">System Configuration</div>
          </div>
        </aside>

        {/* Main Settings Content */}
        <main className="flex-1 space-y-8">
          {/* Profile Information */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-lg mb-1">Profile Information</h2>
            <p className="text-sm text-gray-500 mb-6">
              View and update your personal details such as name, email address, contact number, and assigned role.
              Make sure this information is accurate for system records and communication.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-600">First Name</label>
                <input
                  type="text"
                  value={profile.firstName}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Last Name</label>
                <input
                  type="text"
                  value={profile.lastName}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Suffix</label>
                <select className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300">
                  <option>N/A</option>
                  <option>Jr.</option>
                  <option>Sr.</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <input
                  type="text"
                  value={profile.email}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Phone No.</label>
                <input
                  type="text"
                  value={profile.phone}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Nickname</label>
                <input
                  type="text"
                  value={profile.nickname}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300"
                  readOnly
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button className="bg-[#f7a84e] hover:bg-[#e79632] text-white font-medium px-6 py-2 rounded-lg">
                Save
              </button>
            </div>
          </section>

          {/* Change Password */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-lg mb-1">Change Password</h2>
            <p className="text-sm text-gray-500 mb-6">
              Securely change your account password. Use a strong combination of letters, numbers, and symbols.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-600">Old Password</label>
                <input
                  type="password"
                  defaultValue="***************"
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">New Password</label>
                <input
                  type="password"
                  defaultValue="***************"
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Confirm New Password</label>
                <input
                  type="password"
                  defaultValue="***************"
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button className="bg-[#f7a84e] hover:bg-[#e79632] text-white font-medium px-6 py-2 rounded-lg">
                Save
              </button>
            </div>
          </section>

          {/* Profile Picture */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-lg mb-1">Profile Picture</h2>
              <p className="text-sm text-gray-500">
                Upload or update your profile photo. Click the profile icon to upload a new photo.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-orange-300 to-[#f7a84e] flex items-center justify-center">
                <Edit className="absolute bottom-0 right-0 bg-white p-1 rounded-full text-gray-600 cursor-pointer" />
              </div>
              <div className="flex gap-2">
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100">
                  Remove
                </button>
                <button className="bg-[#f7a84e] hover:bg-[#e79632] text-white px-5 py-2 rounded-lg">
                  Save
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
