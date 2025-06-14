import { MessageSquare, FolderOpen, Info, House } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/", icon: House },
  { name: "Forum", href: "/forum", icon: MessageSquare },
  { name: "Projects", href: "/projects", icon: FolderOpen },
  { name: "About", href: "/about", icon: Info },
];

export default function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden">
      <div className="grid grid-cols-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 text-xs transition-colors",
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Icon className={cn("h-5 w-5 mb-1", isActive ? "text-blue-600" : "text-gray-400")} />
              <span className={cn("font-medium", isActive ? "text-blue-600" : "text-gray-500")}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}