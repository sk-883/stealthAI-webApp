import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageBubble } from './MessageBubble';
import { useWebSocket } from '@/hooks/use-websocket';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface MessageData {
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
  receiver: {
    id: number;
    name: string;
    username: string;
    profilePicture: string | null;
  };
}

interface MessageContainerProps {
  userId: number;
  user: {
    id: number;
    name: string;
    username: string;
    profilePicture: string | null;
    headline?: string | null;
  };
}

export function MessageContainer({ userId, user }: MessageContainerProps) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageText, setMessageText] = useState('');
  const { isConnected, sendMessage: sendWebSocketMessage } = useWebSocket();

  // Fetch messages
  const { data: messages, isLoading, error } = useQuery<MessageData[]>({
    queryKey: ['/api/messages', userId],
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', '/api/messages', {
        receiverId: userId,
        content
      });
      return response.json();
    },
    onSuccess: (newMessage) => {
      // Update message list
      queryClient.setQueryData<MessageData[]>(['/api/messages', userId], (prev) => {
        if (!prev) return [newMessage];
        return [...prev, newMessage];
      });
      
      // Also update conversations
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      
      // Clear input
      setMessageText('');
    },
    onError: (error) => {
      toast({
        title: 'Failed to send message',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    }
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: number) => {
      await apiRequest('DELETE', `/api/messages/${messageId}`);
      return messageId;
    },
    onSuccess: (messageId) => {
      // Remove message from list
      queryClient.setQueryData<MessageData[]>(['/api/messages', userId], (prev) => {
        if (!prev) return [];
        return prev.filter(message => message.id !== messageId);
      });
      
      // Also update conversations
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete message',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    }
  });

  // Send message handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim()) return;
    
    // Send through REST API
    sendMessageMutation.mutate(messageText);
    
    // Also send through WebSocket for real-time delivery
    if (isConnected) {
      sendWebSocketMessage({
        type: 'message',
        receiverId: userId,
        content: messageText
      });
    }
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Display loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b p-4 flex items-center">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="ml-3">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-3 w-[100px] mt-1" />
          </div>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'} mb-4`}>
              <Skeleton className={`h-[60px] ${i % 2 === 0 ? 'w-[200px]' : 'w-[150px]'} rounded-lg`} />
            </div>
          ))}
        </div>
        
        <div className="border-t p-4">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-destructive">
            <p>Failed to load messages</p>
            <Button variant="outline" className="mt-4" onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/messages', userId] });
            }}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 flex items-center">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.profilePicture || undefined} alt={user.name} />
          <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <h3 className="font-medium">{user.name}</h3>
          {user.headline && <p className="text-sm text-muted-foreground">{user.headline}</p>}
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages && messages.length > 0 ? (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              id={message.id}
              senderId={message.senderId}
              receiverId={message.receiverId}
              content={message.content}
              createdAt={message.createdAt}
              isRead={message.isRead}
              sender={message.sender}
              onDelete={
                message.senderId === currentUser?.id 
                  ? (id) => deleteMessageMutation.mutate(id) 
                  : undefined
              }
            />
          ))
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <form onSubmit={handleSendMessage} className="border-t p-4">
        <div className="flex space-x-2">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={sendMessageMutation.isPending}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={sendMessageMutation.isPending || !messageText.trim()}
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}