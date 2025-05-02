import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Image, Video, FileText, Hash, X } from "lucide-react";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: user } = useQuery({ 
    queryKey: ["/api/auth/user"]
  });
  
  const createPostMutation = useMutation({
    mutationFn: async (postContent: string) => {
      const response = await apiRequest("POST", "/api/posts", {
        content: postContent
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post created",
        description: "Your post has been published successfully."
      });
      onClose();
      setContent("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleSubmit = () => {
    if (content.trim()) {
      createPostMutation.mutate(content);
    }
  };
  
  // Reset content when modal closes
  useEffect(() => {
    if (!isOpen) {
      setContent("");
    }
  }, [isOpen]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-[#191919]">Create a post</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        
        <div className="p-1">
          <div className="flex items-center mb-4">
            <Avatar className="h-12 w-12 mr-3">
              <AvatarImage src={user?.profilePicture} alt={user?.name} />
              <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-[#191919]">{user?.name}</h3>
              <button className="text-[#666666] text-xs border border-[#e0e0e0] rounded-full px-3 py-1 mt-1 flex items-center">
                <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Anyone
              </button>
            </div>
          </div>
          
          <textarea 
            placeholder="What do you want to talk about?" 
            className="w-full border-none focus:outline-none focus:ring-0 text-[#191919] resize-none h-32 placeholder-[#666666]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
        </div>
        
        <div className="p-1 border-t border-[#e0e0e0]">
          <div className="flex">
            <button className="text-[#666666] hover:bg-[#f3f2ef] p-2 rounded-full" title="Add a photo">
              <Image className="h-6 w-6" />
            </button>
            <button className="text-[#666666] hover:bg-[#f3f2ef] p-2 rounded-full" title="Add a video">
              <Video className="h-6 w-6" />
            </button>
            <button className="text-[#666666] hover:bg-[#f3f2ef] p-2 rounded-full" title="Add a document">
              <FileText className="h-6 w-6" />
            </button>
            <button className="text-[#666666] hover:bg-[#f3f2ef] p-2 rounded-full" title="Add hashtag">
              <Hash className="h-6 w-6" />
            </button>
            <div className="ml-auto">
              <Button
                className="bg-[#0a66c2] text-white font-medium rounded-full px-4 py-2 hover:bg-[#004182]"
                disabled={!content.trim() || createPostMutation.isPending}
                onClick={handleSubmit}
              >
                {createPostMutation.isPending ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
