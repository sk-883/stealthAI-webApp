import { useState } from "react";
import { Search, Edit, MoreHorizontal, Send, Paperclip, Video, Phone, Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Sample data for conversations
const conversations = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    lastMessage: "Thanks for the project update, I'll review it today.",
    time: "2m",
    unread: true,
  },
  {
    id: 2,
    name: "Michael Chen",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    lastMessage: "Let's schedule that coffee chat for next week.",
    time: "1h",
    unread: false,
  },
  {
    id: 3,
    name: "Emily Wilson",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    lastMessage: "I'm interested in discussing the position further.",
    time: "3h",
    unread: false,
  },
  {
    id: 4,
    name: "Robert Taylor",
    avatar: "https://randomuser.me/api/portraits/men/42.jpg",
    lastMessage: "The presentation went really well, thank you for your help!",
    time: "1d",
    unread: false,
  },
  {
    id: 5,
    name: "Lisa Garcia",
    avatar: "https://randomuser.me/api/portraits/women/52.jpg",
    lastMessage: "Can you send me the details for the conference?",
    time: "2d",
    unread: false,
  },
];

// Sample messages for the selected conversation
const messages = [
  {
    id: 1,
    sender: "Sarah Johnson",
    content: "Hi there! I saw your post about the project management role. I'm really interested in learning more.",
    time: "10:30 AM",
    isMe: false,
  },
  {
    id: 2,
    sender: "Me",
    content: "Hello Sarah! Thanks for reaching out. Yes, we're looking for someone with experience in agile methodologies. Do you have experience with that?",
    time: "10:45 AM",
    isMe: true,
  },
  {
    id: 3,
    sender: "Sarah Johnson",
    content: "Yes, I've been working as a Scrum Master for the past 3 years, and I'm certified in both Scrum and Kanban.",
    time: "11:02 AM",
    isMe: false,
  },
  {
    id: 4,
    sender: "Me",
    content: "That sounds perfect! I'd love to hear more about your experience. Are you available for a chat this week?",
    time: "11:15 AM",
    isMe: true,
  },
  {
    id: 5,
    sender: "Sarah Johnson",
    content: "Absolutely! I'm free on Thursday afternoon if that works for you?",
    time: "11:20 AM",
    isMe: false,
  },
  {
    id: 6,
    sender: "Me",
    content: "Thursday at 2pm would be great. I'll send you a calendar invite with the details.",
    time: "11:25 AM",
    isMe: true,
  },
  {
    id: 7,
    sender: "Sarah Johnson",
    content: "Perfect! I'll look forward to it. Could you also send me some more information about the team and the project scope?",
    time: "11:30 AM",
    isMe: false,
  },
  {
    id: 8,
    sender: "Me",
    content: "Of course. I'll include that in the calendar invite. It's a really exciting project with a lot of potential for growth.",
    time: "11:35 AM",
    isMe: true,
  },
  {
    id: 9,
    sender: "Sarah Johnson",
    content: "Thanks for the project update, I'll review it today.",
    time: "11:45 AM",
    isMe: false,
  },
];

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      // In a real app, we would add the message to the conversation
      setMessageText("");
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-16 md:mb-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 h-[calc(100vh-150px)]">
        {/* Left sidebar - Conversations list */}
        <div className="col-span-1 bg-white rounded-lg border overflow-hidden flex flex-col">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Messaging</h2>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
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
          </div>
          
          <Tabs defaultValue="focused" className="px-4 pt-4">
            <TabsList className="w-full mb-2">
              <TabsTrigger value="focused" className="flex-1">Focused</TabsTrigger>
              <TabsTrigger value="other" className="flex-1">Other</TabsTrigger>
            </TabsList>
            <TabsContent value="focused" className="space-y-0 mt-0">
              <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
                {conversations.map((conversation) => (
                  <div 
                    key={conversation.id}
                    className={`p-3 hover:bg-slate-50 cursor-pointer ${selectedConversation.id === conversation.id ? 'bg-slate-50' : ''}`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={conversation.avatar} alt={conversation.name} />
                        <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium truncate">{conversation.name}</h3>
                          <span className="text-xs text-muted-foreground shrink-0">{conversation.time}</span>
                        </div>
                        <p className={`text-sm truncate ${conversation.unread ? 'font-medium' : 'text-muted-foreground'}`}>
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="other">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">No other messages yet</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right side - Selected conversation */}
        <div className="col-span-2 bg-white rounded-lg border overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              {/* Conversation header */}
              <div className="p-4 border-b flex justify-between items-center">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} />
                    <AvatarFallback>{selectedConversation.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <h3 className="font-medium">{selectedConversation.name}</h3>
                    <p className="text-xs text-muted-foreground">Active now</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-280px)]">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex items-start gap-2 max-w-[70%]">
                      {!message.isMe && (
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} />
                          <AvatarFallback>{selectedConversation.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <div 
                          className={`rounded-2xl p-3 ${
                            message.isMe 
                              ? 'bg-[#0a66c2] text-white' 
                              : 'bg-slate-100 text-slate-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{message.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Message input */}
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Paperclip className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem>
                        <Image className="h-4 w-4 mr-2" />
                        <span>Image</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Paperclip className="h-4 w-4 mr-2" />
                        <span>File</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Input 
                    placeholder="Write a message..." 
                    className="flex-1"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                  <Button type="submit" disabled={!messageText.trim()}>
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </>
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