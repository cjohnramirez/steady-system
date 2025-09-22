export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
      <h1>Key Performance Indicators</h1>
      <p>Some important overview of the organization</p>
      {children}
    </div>
  );
}
