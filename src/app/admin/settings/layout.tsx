export default function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen">
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-64">
          <input
            type="text"
            placeholder="Search accounts"
            className="mb-6 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-orange-300 focus:outline-none"
          />
          <div className="text-sm text-gray-600">
            <div className="mb-3 font-semibold">Account Settings</div>
            <div className="mb-5 cursor-pointer hover:text-black">
              System Configuration
            </div>
          </div>
        </aside>
        {children}
      </div>
    </div>
  );
}
