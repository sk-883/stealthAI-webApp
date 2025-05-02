import { Link, useLocation } from "wouter";
import { Home, Users, PlusCircle, Bell, Search, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function MobileNavigation() {
  const [location] = useLocation();
  const { user } = useAuth();

  // Only show mobile navigation if user is authenticated
  if (!user) {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e0e0e0] z-40">
        <div className="flex justify-between px-6 py-2">
          <Link href="/login" className="text-[#666666] hover:text-[#0a66c2] flex flex-col items-center text-xs">
            <LogIn className="h-6 w-6" />
            <span>Sign In</span>
          </Link>
          <Link href="/register" className="text-[#666666] hover:text-[#0a66c2] flex flex-col items-center text-xs">
            <UserPlus className="h-6 w-6" />
            <span>Register</span>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e0e0e0] z-40">
      <div className="flex justify-between px-6 py-2">
        <Link href="/" className={`text-[#666666] hover:text-[#0a66c2] flex flex-col items-center text-xs ${location === '/' ? 'text-[#0a66c2]' : ''}`}>
          <Home className="h-6 w-6" />
          <span>Home</span>
        </Link>
        <Link href="/network" className={`text-[#666666] hover:text-[#0a66c2] flex flex-col items-center text-xs ${location === '/network' ? 'text-[#0a66c2]' : ''}`}>
          <Users className="h-6 w-6" />
          <span>Network</span>
        </Link>
        <button className="text-[#666666] hover:text-[#0a66c2] flex flex-col items-center text-xs">
          <PlusCircle className="h-6 w-6" />
          <span>Post</span>
        </button>
        <Link href="/notifications" className={`text-[#666666] hover:text-[#0a66c2] flex flex-col items-center text-xs ${location === '/notifications' ? 'text-[#0a66c2]' : ''}`}>
          <Bell className="h-6 w-6" />
          <span>Notifications</span>
        </Link>
        <button className="text-[#666666] hover:text-[#0a66c2] flex flex-col items-center text-xs">
          <Search className="h-6 w-6" />
          <span>Search</span>
        </button>
      </div>
    </div>
  );
}
