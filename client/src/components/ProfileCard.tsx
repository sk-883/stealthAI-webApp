import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

type ProfileCardProps = {
  user?: Partial<User>;
};

export default function ProfileCard({ user: propUser }: ProfileCardProps) {
  // If user is not provided as prop, fetch the current user
  const { data: fetchedUser, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !propUser,
  });

  const user = propUser || fetchedUser;

  if (isLoading) {
    return (
      <div className="linkedin-card p-4 animate-pulse">
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="p-4 relative">
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
            <div className="h-16 w-16 rounded-full bg-gray-300"></div>
          </div>
          <div className="mt-8 text-center">
            <div className="h-6 w-24 bg-gray-300 rounded mx-auto"></div>
            <div className="h-4 w-40 bg-gray-200 rounded mx-auto mt-2"></div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-4 w-10 bg-gray-300 rounded"></div>
            </div>
            <div className="flex justify-between mt-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-4 w-10 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="linkedin-card">
      <div className="h-20 bg-gradient-to-r from-[#0a66c2] to-blue-500"></div>
      <div className="p-4 relative">
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <Avatar className="h-16 w-16 border-4 border-white">
            <AvatarImage src={user.profilePicture} alt={user.name} />
            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
        <div className="mt-8 text-center">
          <Link href={`/profile/${user.id}`}>
            <h2 className="text-lg font-medium text-[#191919] hover:underline cursor-pointer">
              {user.name}
            </h2>
          </Link>
          <p className="text-sm text-[#666666]">{user.headline}</p>
        </div>
        <div className="mt-3 pt-3 border-t border-[#e0e0e0]">
          <div className="flex justify-between text-sm">
            <span className="text-[#666666]">Profile views</span>
            <span className="font-medium text-[#0a66c2]">142</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-[#666666]">Connection reach</span>
            <span className="font-medium text-[#0a66c2]">503</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[#e0e0e0]">
          <p className="text-sm text-[#666666]">Access exclusive tools & insights</p>
          <a href="#" className="flex items-center text-sm font-medium mt-1">
            <svg className="h-4 w-4 mr-1 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 00-.894.553L7.382 6H4a1 1 0 000 2h.382l-.724 3.447A1 1 0 004 12h12a1 1 0 00.894-1.447L16.178 8H18a1 1 0 100-2h-3.382l-1.724-3.447A1 1 0 0012 2h-2zm2.724 4l-1.8-3h-1.848l-1.8 3h5.448zM9.276 14l1.8 3h1.848l1.8-3H9.276z" clipRule="evenodd" />
            </svg>
            Try Premium for free
          </a>
        </div>
        <div className="mt-3 pt-3 border-t border-[#e0e0e0]">
          <a href="#" className="flex items-center text-sm font-medium text-[#666666]">
            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            My items
          </a>
        </div>
      </div>
    </div>
  );
}
