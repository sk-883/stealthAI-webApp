import { Bell, Settings, CheckCircle2, UserPlus, Heart, MessageSquare, BriefcaseBusiness } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Sample notifications data
const notifications = [
  {
    id: 1,
    type: "connection",
    user: {
      name: "Jennifer Lee",
      avatar: "https://randomuser.me/api/portraits/women/62.jpg",
      headline: "Product Designer at Netflix"
    },
    content: "accepted your connection request",
    time: "2h ago",
    isRead: false
  },
  {
    id: 2,
    type: "post_engagement",
    user: {
      name: "David Miller",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      headline: "Senior Software Engineer at Amazon"
    },
    content: "liked your post about React best practices",
    time: "4h ago",
    isRead: false
  },
  {
    id: 3,
    type: "connection_request",
    user: {
      name: "Sarah Thompson",
      avatar: "https://randomuser.me/api/portraits/women/45.jpg",
      headline: "Marketing Director at Adobe"
    },
    content: "sent you a connection request",
    time: "10h ago",
    isRead: true
  },
  {
    id: 4,
    type: "message",
    user: {
      name: "Michael Johnson",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      headline: "Full Stack Developer at Microsoft"
    },
    content: "sent you a message",
    time: "1d ago",
    isRead: true
  },
  {
    id: 5,
    type: "job",
    user: {
      name: "Recruiter at Google",
      avatar: "https://logo.clearbit.com/google.com",
      headline: "Technical Recruiter"
    },
    content: "posted a job that matches your skills: Senior Frontend Developer",
    time: "2d ago",
    isRead: true
  },
  {
    id: 6,
    type: "post_engagement",
    user: {
      name: "Emily Wilson",
      avatar: "https://randomuser.me/api/portraits/women/12.jpg",
      headline: "UI/UX Designer at Figma"
    },
    content: "commented on your post: 'Great insights! I've been using this approach too.'",
    time: "2d ago",
    isRead: true
  },
  {
    id: 7,
    type: "birthday",
    user: {
      name: "Robert Taylor",
      avatar: "https://randomuser.me/api/portraits/men/52.jpg",
      headline: "CTO at Startup XYZ"
    },
    content: "is celebrating a birthday today. Send your wishes!",
    time: "Today",
    isRead: true
  },
  {
    id: 8,
    type: "work_anniversary",
    user: {
      name: "Jessica Brown",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg",
      headline: "Project Manager at IBM"
    },
    content: "is celebrating 5 years at IBM today",
    time: "Today",
    isRead: true
  }
];

export default function Notifications() {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'connection':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'connection_request':
        return <UserPlus className="h-5 w-5 text-blue-500" />;
      case 'post_engagement':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case 'job':
        return <BriefcaseBusiness className="h-5 w-5 text-green-600" />;
      case 'birthday':
      case 'work_anniversary':
        return <Bell className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const unreadCount = notifications.filter(notification => !notification.isRead).length;
  
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 mb-16 md:mb-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="mb-6">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread" className="relative">
            Unread
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="mentions">Mentions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4 space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={notification.isRead ? "opacity-80" : ""}>
              <CardContent className="p-4">
                <div className="flex">
                  <div className="mr-4 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                        <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold">{notification.user.name}</span>
                          {' '}{notification.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                      </div>
                    </div>
                    
                    {notification.type === 'connection_request' && (
                      <div className="flex gap-2 mt-3 ml-12">
                        <Button size="sm">Accept</Button>
                        <Button size="sm" variant="outline">Ignore</Button>
                      </div>
                    )}
                    
                    {notification.type === 'job' && (
                      <div className="mt-3 ml-12">
                        <Button size="sm">View Job</Button>
                      </div>
                    )}
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Separator />
          
          <div className="text-center pt-4">
            <Button variant="outline">View More</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="unread" className="mt-4 space-y-4">
          {notifications.filter(n => !n.isRead).length > 0 ? (
            notifications.filter(n => !n.isRead).map((notification) => (
              <Card key={notification.id}>
                <CardContent className="p-4">
                  <div className="flex">
                    <div className="mr-4 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                          <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-semibold">{notification.user.name}</span>
                            {' '}{notification.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                      </div>
                      
                      {notification.type === 'connection_request' && (
                        <div className="flex gap-2 mt-3 ml-12">
                          <Button size="sm">Accept</Button>
                          <Button size="sm" variant="outline">Ignore</Button>
                        </div>
                      )}
                    </div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No unread notifications</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="mentions" className="mt-4">
          <div className="text-center py-8">
            <p className="text-muted-foreground">No mentions yet</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}