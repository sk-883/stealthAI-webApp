import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { UserPlus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PeopleSectionProps {
  title?: string;
}

export default function PeopleSection({ title = "People you may know" }: PeopleSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: users, isLoading } = useQuery({ 
    queryKey: ["/api/users"],
  });
  
  const connectMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("POST", "/api/connections", {
        connectedUserId: userId
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Connection request sent",
        description: "Your connection request has been sent."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send connection request.",
        variant: "destructive"
      });
    }
  });
  
  const handleConnect = (userId: number) => {
    connectMutation.mutate(userId);
  };
  
  if (isLoading) {
    return (
      <div className="linkedin-card p-4 animate-pulse">
        <div className="h-6 w-48 bg-gray-300 rounded mb-3"></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="flex mb-4">
            <div className="h-12 w-12 rounded-full bg-gray-300"></div>
            <div className="ml-2 flex-grow">
              <div className="h-5 w-32 bg-gray-300 rounded"></div>
              <div className="h-4 w-40 bg-gray-200 rounded mt-1"></div>
              <div className="h-8 w-24 bg-gray-200 rounded mt-2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (!users || users.length === 0) {
    return null;
  }
  
  return (
    <div className="linkedin-card">
      <div className="p-4">
        <h2 className="font-bold text-[#191919] text-base">{title}</h2>
        <ul className="mt-3 space-y-4">
          {users.map(user => (
            <li key={user.id} className="flex">
              <Link href={`/profile/${user.id}`}>
                <Avatar className="h-12 w-12 cursor-pointer">
                  <AvatarImage src={user.profilePicture} alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="ml-2">
                <Link href={`/profile/${user.id}`}>
                  <h3 className="font-medium text-sm text-[#191919] hover:underline cursor-pointer">
                    {user.name}
                  </h3>
                </Link>
                <p className="text-xs text-[#666666] mt-0.5">{user.headline}</p>
                <Button
                  variant="outline"
                  className="mt-2 border border-[#0a66c2] text-[#0a66c2] hover:bg-[#e7f3ff] px-3 py-1 h-auto text-sm font-medium rounded-full"
                  onClick={() => handleConnect(user.id)}
                  disabled={connectMutation.isPending}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Connect
                </Button>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-3">
          <a href="#" className="text-sm text-[#666666] font-medium hover:text-[#0a66c2] flex items-center">
            Show more
            <svg className="h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
