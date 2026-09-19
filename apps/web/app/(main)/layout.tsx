import { BottomNav } from "@/components/bottom-nav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-1 flex-col bg-surface-page">
      <div className="flex-1">{children}</div>
      <BottomNav />
    </div>
  );
}
