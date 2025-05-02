import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { UserPlus, UserCheck, UserX, Users, UserRoundPlus } from "lucide-react";
import { Connection } from "@shared/schema";
import NewsSection from "@/components/NewsSection";
import FooterLinks from "@/components/FooterLinks";

export default function Network() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get current user
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"]
  });
  
  // Get connections
  const { data: connections, isLoading: connectionsLoading } = useQuery({
    queryKey: ["/api/connections"]
  });
  
  // Get pending connection requests
  const { data: pendingConnections, isLoading: pendingLoading } = useQuery({
    queryKey: ["/api/connections/pending"]
  });
  
  // Get connection suggestions
  const { data: suggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ["/api/users"]
  });
  
  // Accept connection request mutation
  const acceptConnectionMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      const response = await apiRequest("PATCH", `/api/connections/${connectionId}`, {
        status: "accepted"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      toast({
        title: "Connection accepted",
        description: "You are now connected."
      });
    }
  });
  
  // Reject connection request mutation
  const rejectConnectionMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      const response = await apiRequest("PATCH", `/api/connections/${connectionId}`, {
        status: "rejected"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections/pending"] });
      toast({
        title: "Connection rejected",
        description: "The connection request has been rejected."
      });
    }
  });
  
  // Send connection request mutation
  const sendConnectionMutation = useMutation({
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
    }
  });

  // Update document title
  useEffect(() => {
    document.title = "My Network | LinkedUp";
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-16 md:mb-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Main Content */}
        <div className="lg:col-span-9 space-y-5">
          <div className="linkedin-card p-6">
            <h1 className="text-2xl font-bold text-[#191919] mb-6 flex items-center">
              <Users className="h-7 w-7 mr-2 text-[#0a66c2]" />
              My Network
            </h1>
            
            {/* Pending Connection Requests Section */}
            {pendingConnections && pendingConnections.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-[#191919] mb-4">
                  Pending Requests
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingLoading ? (
                    <div className="flex justify-center items-center h-24">
                      <p>Loading pending requests...</p>
                    </div>
                  ) : (
                    pendingConnections.map((connection: Connection) => (
                      <div key={connection.id} className="flex p-4 border border-[#e0e0e0] rounded-lg">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={`https://randomuser.me/api/portraits/men/${connection.userId % 70}.jpg`} />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className="ml-4 flex-grow">
                          <p className="font-medium text-[#191919]">Connection Request</p>
                          <p className="text-sm text-[#666666] mb-3">Someone wants to connect with you</p>
                          <div className="flex space-x-2">
                            <Button 
                              className="bg-[#0a66c2] hover:bg-[#004182] rounded-full"
                              onClick={() => acceptConnectionMutation.mutate(connection.id)}
                              disabled={acceptConnectionMutation.isPending}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                            <Button 
                              variant="outline" 
                              className="rounded-full"
                              onClick={() => rejectConnectionMutation.mutate(connection.id)}
                              disabled={rejectConnectionMutation.isPending}
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Ignore
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            
            {/* My Connections Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-[#191919] mb-4">
                My Connections
              </h2>
              {connectionsLoading ? (
                <div className="flex justify-center items-center h-24">
                  <p>Loading connections...</p>
                </div>
              ) : connections && connections.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {connections.map((connection: Connection) => (
                    <div key={connection.id} className="flex p-4 border border-[#e0e0e0] rounded-lg">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`https://randomuser.me/api/portraits/men/${connection.connectedUserId % 70}.jpg`} />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 flex-grow">
                        <p className="font-medium text-[#191919]">Connection #{connection.id}</p>
                        <p className="text-sm text-[#666666]">Connected User ID: {connection.connectedUserId}</p>
                        <Link href={`/profile/${connection.connectedUserId}`}>
                          <Button variant="link" className="p-0 h-auto text-[#0a66c2]">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border border-[#e0e0e0] rounded-lg">
                  <UserRoundPlus className="h-12 w-12 text-[#0a66c2] mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-[#191919] mb-2">No connections yet</h3>
                  <p className="text-[#666666] mb-4">
                    Connect with other professionals to grow your network
                  </p>
                  <Link href="/network">
                    <Button className="bg-[#0a66c2] hover:bg-[#004182] rounded-full">
                      Find connections
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            
            {/* People You May Know Section */}
            <div>
              <h2 className="text-lg font-semibold text-[#191919] mb-4">
                People You May Know
              </h2>
              {suggestionsLoading ? (
                <div className="flex justify-center items-center h-24">
                  <p>Loading suggestions...</p>
                </div>
              ) : suggestions && suggestions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestions.map((suggestion: any) => (
                    <div key={suggestion.id} className="flex flex-col p-4 border border-[#e0e0e0] rounded-lg">
                      <div className="flex items-start">
                        <Link href={`/profile/${suggestion.id}`}>
                          <Avatar className="h-12 w-12 cursor-pointer">
                            <AvatarImage src={suggestion.profilePicture} />
                            <AvatarFallback>{suggestion.name?.[0]}</AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="ml-3">
                          <Link href={`/profile/${suggestion.id}`}>
                            <h3 className="font-medium text-[#191919] hover:underline cursor-pointer">
                              {suggestion.name}
                            </h3>
                          </Link>
                          <p className="text-xs text-[#666666]">{suggestion.headline}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="mt-4 border border-[#0a66c2] text-[#0a66c2] hover:bg-[#e7f3ff] rounded-full"
                        onClick={() => sendConnectionMutation.mutate(suggestion.id)}
                        disabled={sendConnectionMutation.isPending}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border border-[#e0e0e0] rounded-lg">
                  <p className="text-[#666666]">No suggestions available at the moment</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className="lg:col-span-3 space-y-5">
          <div className="linkedin-card p-6">
            <h2 className="font-semibold text-[#191919] mb-3">Grow your network</h2>
            <p className="text-sm text-[#666666] mb-4">
              Connections help you discover opportunities and stay updated on your industry.
            </p>
            <div className="flex items-center justify-between text-sm p-3 bg-[#f3f2ef] rounded-lg">
              <span className="text-[#666666]">Invitation sent</span>
              <span className="font-medium text-[#0a66c2]">5</span>
            </div>
          </div>
          <NewsSection />
          <FooterLinks />
        </div>
      </div>
    </main>
  );
}
