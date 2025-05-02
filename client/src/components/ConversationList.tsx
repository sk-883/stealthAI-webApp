import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from '@tanstack/react-query';

interface Conversation {
  user: {
    id: number;
    name: string;
    username: string;
    profilePicture: string | null;
    headline: string | null;
  };
  latestMessage: {
    id: number;
    content: string;
    createdAt: string;
    isRead: boolean;
  } | null;
  unreadCount: number;
}

interface ConversationListProps {
  onSelectConversation: (userId: number) => void;
  selectedUserId: number | null;
}

export function ConversationList({ onSelectConversation, selectedUserId }: ConversationListProps) {
  const { data: conversations, isLoading, error } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-destructive">Failed to load conversations</div>;
  }

  if (!conversations?.length) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>No conversations yet</p>
        <p className="text-sm mt-2">Connect with other users to start chatting</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((conversation) => {
        const isSelected = selectedUserId === conversation.user.id;
        const timeAgo = conversation.latestMessage 
          ? formatDistanceToNow(new Date(conversation.latestMessage.createdAt), { addSuffix: true })
          : '';

        return (
          <button
            key={conversation.user.id}
            className={`w-full flex items-center space-x-3 p-3 rounded-md transition-colors ${
              isSelected 
                ? 'bg-accent text-accent-foreground' 
                : 'hover:bg-accent/50'
            }`}
            onClick={() => onSelectConversation(conversation.user.id)}
          >
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={conversation.user.profilePicture || undefined} alt={conversation.user.name} />
                <AvatarFallback>{conversation.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              
              {conversation.unreadCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center" 
                  variant="destructive"
                >
                  {conversation.unreadCount}
                </Badge>
              )}
            </div>
            
            <div className="flex-1 overflow-hidden text-left">
              <div className="flex justify-between">
                <h4 className="font-medium truncate">{conversation.user.name}</h4>
                {timeAgo && (
                  <span className="text-xs text-muted-foreground">{timeAgo}</span>
                )}
              </div>
              
              {conversation.latestMessage && (
                <p className={`text-sm truncate ${
                  !conversation.latestMessage.isRead && conversation.latestMessage.content
                    ? 'font-medium' 
                    : 'text-muted-foreground'
                }`}>
                  {conversation.latestMessage.content}
                </p>
              )}
              
              {!conversation.latestMessage && conversation.user.headline && (
                <p className="text-sm truncate text-muted-foreground">
                  {conversation.user.headline}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}