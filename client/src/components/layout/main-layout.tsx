import { ReactNode } from "react";
import Sidebar from "./sidebar";
import { AuthUser } from "@/lib/types";

interface MainLayoutProps {
  children: ReactNode;
  user: AuthUser;
  onLogout: () => void;
}

export default function MainLayout({ children, user, onLogout }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} onLogout={onLogout} />
      <main className="flex-1 main-content p-6">
        {children}
      </main>
    </div>
  );
}
