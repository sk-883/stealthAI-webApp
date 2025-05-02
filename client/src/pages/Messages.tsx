import { useState } from "react";
import { Search, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConversationList } from "@/components/ConversationList";
import { MessageContainer } from "@/components/MessageContainer";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: number;
  name: string;
  username: string;
  profilePicture: string | null;
  headline: string | null;
}

export default function Messages() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { isConnected } = useWebSocket();
  
  // Fetch user data for the selected conversation
  const { data: selectedUser, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ['/api/users', selectedUserId],
    enabled: !!selectedUserId,
  });

  // Filter conversations based on search query (client-side search)
  // This filtering would be applied to the ConversationList component

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-16 md:mb-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 h-[calc(100vh-150px)]">
        {/* Left sidebar - Conversations list */}
        <div className="col-span-1 bg-card rounded-lg border overflow-hidden flex flex-col">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Messaging</h2>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" title="New message">
                  <Edit className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="mt-2 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-9" 
                placeholder="Search messages" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {isConnected && (
              <div className="mt-2 text-xs text-center">
                <span className="inline-flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                  Connected
                </span>
              </div>
            )}
          </div>
          
          <Tabs defaultValue="all" className="px-4 pt-4">
            <TabsList className="w-full mb-2">
              <TabsTrigger value="all" className="flex-1">All Messages</TabsTrigger>
              <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-0 mt-0">
              <ConversationList 
                onSelectConversation={setSelectedUserId}
                selectedUserId={selectedUserId}
              />
            </TabsContent>
            <TabsContent value="unread">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">No unread messages</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right side - Selected conversation */}
        <div className="col-span-2 bg-card rounded-lg border overflow-hidden flex flex-col">
          {selectedUserId && selectedUser ? (
            <MessageContainer userId={selectedUserId} user={selectedUser} />
          ) : isLoadingUser && selectedUserId ? (
            <div className="p-4 flex flex-col h-full">
              <div className="border-b pb-4 flex items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-3">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-3 w-[100px] mt-1" />
                </div>
              </div>
              <div className="flex-1"></div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center max-w-sm">
                <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
                <p className="text-muted-foreground">Select a conversation from the list or start a new one.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}