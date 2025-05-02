import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/hooks/use-auth';

interface MessageProps {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
  isRead: boolean;
  sender: {
    id: number;
    name: string;
    username: string;
    profilePicture: string | null;
  };
  onDelete?: (id: number) => void;
}

export function MessageBubble({ id, senderId, content, createdAt, sender, onDelete }: MessageProps) {
  const { user } = useAuth();
  const isCurrentUser = senderId === user?.id;
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4 group`}>
      {!isCurrentUser && (
        <div className="flex-shrink-0 mr-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={sender.profilePicture || undefined} alt={sender.name} />
            <AvatarFallback>{sender.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
      )}
      
      <div className={`relative max-w-[75%] ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg px-4 py-2 shadow`}>
        <p className="text-sm">{content}</p>
        <div className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
          {timeAgo}
        </div>
        
        {isCurrentUser && onDelete && (
          <button 
            onClick={() => onDelete(id)}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Delete message"
          >
            ×
          </button>
        )}
      </div>
      
      {isCurrentUser && (
        <div className="flex-shrink-0 ml-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.profilePicture || undefined} alt={user?.name} />
            <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
}