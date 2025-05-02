import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Home,
  Users,
  Briefcase,
  MessageSquare,
  Bell,
  Menu,
  Search,
  ChevronDown,
  LogIn
} from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would navigate to search results
    toast({
      title: "Search functionality",
      description: `Searching for "${searchQuery}"...`
    });
  };

  return (
    <header className="bg-white border-b border-[#e0e0e0] sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <svg className="h-8 w-8 text-[#0a66c2]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM9 17H6.5v-7H9v7zM7.8 9.2A1.6 1.6 0 117.8 6a1.6 1.6 0 010 3.2zm9.7 7.8h-2.5v-4c0-2.5-3-2.3-3 0v4h-2.5v-7h2.5v1.5c1-1.9 5-2 5 1.8v3.7z" />
              </svg>
              <h1 className="ml-2 text-xl font-bold text-[#0a66c2]">LinkedUp</h1>
            </Link>
            
            {/* Search bar - hidden on mobile - only show if logged in */}
            {user && (
              <div className="ml-6 hidden md:block">
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="text"
                    placeholder="Search"
                    className="linkedin-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-[#666666]" />
                  </div>
                </form>
              </div>
            )}
          </div>
          
          {/* Navigation for logged in users */}
          {user ? (
            <>
              {/* Nav links - hidden on mobile */}
              <div className="hidden md:flex items-center justify-between space-x-4">
                <Link href="/" className={`linkedin-nav-link ${location === '/' ? 'text-[#191919]' : ''}`}>
                  <Home className="linkedin-icon" />
                  <span>Home</span>
                </Link>
                <Link href="/network" className={`linkedin-nav-link ${location === '/network' ? 'text-[#191919]' : ''}`}>
                  <Users className="linkedin-icon" />
                  <span>Network</span>
                </Link>
                <Link href="/jobs" className="linkedin-nav-link">
                  <Briefcase className="linkedin-icon" />
                  <span>Jobs</span>
                </Link>
                <Link href="/messages" className="linkedin-nav-link">
                  <MessageSquare className="linkedin-icon" />
                  <span>Messages</span>
                </Link>
                <Link href="/notifications" className="linkedin-nav-link">
                  <Bell className="linkedin-icon" />
                  <span>Notifications</span>
                </Link>
                <Separator orientation="vertical" className="h-8" />
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex flex-col items-center justify-center cursor-pointer group outline-none">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.profilePicture} alt={user.name} />
                      <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center text-xs text-[#666666]">
                      <span>Me</span>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${user.id}`} className="cursor-pointer">
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button className="text-[#666666] hover:text-[#191919] focus:outline-none">
                  <Menu className="h-6 w-6" />
                </button>
                <Avatar className="h-8 w-8 ml-4">
                  <AvatarImage src={user.profilePicture} alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            </>
          ) : (
            /* Navigation for guests */
            <div className="flex items-center space-x-4">
              <Link href="/auth" className="text-[#0a66c2] font-medium hover:underline flex items-center">
                <LogIn className="h-4 w-4 mr-1" />
                Sign In
              </Link>
              <Link href="/auth" className="bg-[#0a66c2] text-white px-4 py-1.5 rounded-full hover:bg-[#004182]">
                Join Now
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
