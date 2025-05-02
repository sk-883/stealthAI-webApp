import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface NotificationProps {
  id: number;
  userId: number;
  actorId: number | null;
  type: string;
  content: string;
  entityId: number | null;
  entityType: string | null;
  isRead: boolean;
  createdAt: string;
  actor: {
    id: number;
    name: string;
    username: string;
    profilePicture: string | null;
  } | null;
}

export function NotificationDropdown() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  
  // Get notifications
  const { data: notifications, isLoading } = useQuery<NotificationProps[]>({
    queryKey: ['/api/notifications'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Get unread notification count
  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications/unread/count'],
    refetchInterval: 30000,
  });
  
  // Mark all notifications as read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('PATCH', '/api/notifications/read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread/count'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to mark notifications as read',
        variant: 'destructive',
      });
    },
  });
  
  // Mark a specific notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('PATCH', `/api/notifications/${id}/read`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<NotificationProps[]>(['/api/notifications'], (old) => {
        if (!old) return [];
        return old.map(notification => 
          notification.id === id ? { ...notification, isRead: true } : notification
        );
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread/count'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to mark notification as read',
        variant: 'destructive',
      });
    },
  });
  
  // Delete a notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/notifications/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<NotificationProps[]>(['/api/notifications'], (old) => {
        if (!old) return [];
        return old.filter(notification => notification.id !== id);
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread/count'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete notification',
        variant: 'destructive',
      });
    },
  });
  
  // Mark notifications as read when dropdown is opened
  useEffect(() => {
    if (isOpen && notifications?.some(n => !n.isRead)) {
      markAllReadMutation.mutate();
    }
  }, [isOpen, notifications, markAllReadMutation]);
  
  // Handle notification click
  const handleNotificationClick = (notification: NotificationProps) => {
    // If not already read, mark as read
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Navigate based on notification type and entity
    if (notification.type === 'new_message' && notification.entityType === 'message') {
      // Navigate to messages with the specific user
      window.location.href = `/messages?userId=${notification.actorId}`;
    } else if (notification.type.includes('connection')) {
      // Navigate to network/connections page
      window.location.href = '/network';
    } else if (notification.type.includes('post') || notification.type.includes('comment')) {
      // Navigate to the specific post
      window.location.href = `/posts/${notification.entityId}`;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {(unreadCount?.count || 0) > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount?.count > 9 ? '9+' : unreadCount?.count}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-semibold">Notifications</h3>
          {notifications?.some(n => !n.isRead) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications?.length ? (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                className={`p-3 flex items-start gap-3 cursor-pointer ${!notification.isRead ? 'bg-accent' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                {notification.actor ? (
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={notification.actor.profilePicture || undefined} alt={notification.actor.name} />
                    <AvatarFallback>{notification.actor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>SY</AvatarFallback>
                  </Avatar>
                )}
                
                <div className="flex-1 space-y-1">
                  <p className="text-sm">{notification.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotificationMutation.mutate(notification.id);
                  }}
                >
                  <span className="sr-only">Delete</span>
                  <span aria-hidden>×</span>
                </Button>
              </DropdownMenuItem>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}