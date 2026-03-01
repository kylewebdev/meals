export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b px-6 py-4">
        <h1 className="text-lg font-semibold">Meals</h1>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
