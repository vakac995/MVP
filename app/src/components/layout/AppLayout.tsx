import { Outlet } from "react-router-dom";
import Header from "./Header";
import BottomNavigation from "./BottomNavigation";
import { useAuthContext } from "@/auth/AuthProvider";
import { Toaster } from "@/components/ui/toaster";

export default function AppLayout() {
  const { authLoading } = useAuthContext();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Main content */}
      <main className="flex-1 pt-16 pb-20 lg:pb-8">
        <div className="container mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
      
      {/* Bottom navigation for mobile */}
      <BottomNavigation />
      
      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}