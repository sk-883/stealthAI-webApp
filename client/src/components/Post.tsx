import { useState } from "react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ThumbsUp, MessageSquare, Share2, Send, MoreHorizontal, Eye, Clock } from "lucide-react";
import { PostWithUser } from "@shared/schema";
import { formatDistanceToNow } from 'date-fns';

interface PostProps {
  post: PostWithUser;
  currentUserId?: number;
}

export default function Post({ post, currentUserId }: PostProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  
  const isOwnPost = currentUserId === post.userId;
  
  const deletePostMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/posts/${post.id}`, undefined);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete the post. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    toast({
      title: isLiked ? "Post unliked" : "Post liked",
      description: isLiked ? "You have unliked this post" : "You have liked this post"
    });
  };
  
  const handleComment = () => {
    toast({
      title: "Comment",
      description: "Comment functionality is coming soon!"
    });
  };
  
  const handleShare = () => {
    toast({
      title: "Share",
      description: "Share functionality is coming soon!"
    });
  };
  
  const handleSend = () => {
    toast({
      title: "Send",
      description: "Send functionality is coming soon!"
    });
  };
  
  const handleDelete = () => {
    deletePostMutation.mutate();
  };
  
  return (
    <div className="linkedin-card">
      {/* Post Header */}
      <div className="p-4">
        <div className="flex">
          <Link href={`/profile/${post.user.id}`}>
            <Avatar className="h-12 w-12 cursor-pointer">
              <AvatarImage src={post.user.profilePicture} alt={post.user.name} />
              <AvatarFallback>{post.user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="ml-3">
            <div className="flex items-center">
              <Link href={`/profile/${post.user.id}`}>
                <h3 className="font-medium text-[#191919] hover:underline cursor-pointer">
                  {post.user.name}
                </h3>
              </Link>
              <span className="ml-1 text-[#666666]">• 1st</span>
            </div>
            <p className="text-xs text-[#666666]">{post.user.headline}</p>
            <div className="flex items-center text-xs text-[#666666] mt-1">
              <span>{post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : ''}</span>
              <span className="mx-1">•</span>
              <Eye className="h-3 w-3" />
            </div>
          </div>
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-[#666666] hover:bg-[#f3f2ef] rounded-full">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  toast({
                    title: "Save post",
                    description: "This feature is coming soon!"
                  });
                }}>
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Save post</span>
                </DropdownMenuItem>
                {isOwnPost && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={handleDelete}>
                      Delete post
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Post Content */}
        <div className="mt-3">
          <p className="text-[#191919] whitespace-pre-wrap">{post.content}</p>
        </div>
      </div>
      
      {post.imageUrl && (
        <div className="border-t border-[#e0e0e0]">
          <img src={post.imageUrl} alt="Post content" className="w-full h-auto object-cover" />
        </div>
      )}
      
      {/* Post Stats */}
      <div className="px-4 py-2 flex justify-between items-center text-xs text-[#666666] border-t border-[#e0e0e0]">
        <div className="flex items-center">
          <span className="flex items-center justify-center bg-[#0a66c2] text-white rounded-full h-4 w-4 mr-1">
            <ThumbsUp className="h-3 w-3" />
          </span>
          <span>{likeCount}</span>
        </div>
        <div>
          <span>{post.comments || 0} comments</span>
          <span className="mx-1">•</span>
          <span>{post.shares || 0} shares</span>
        </div>
      </div>
      
      {/* Post Actions */}
      <div className="px-2 py-1 flex justify-between border-t border-[#e0e0e0]">
        <button 
          className={`flex items-center justify-center rounded-lg py-2 px-3 flex-1 transition-colors ${
            isLiked 
              ? 'text-[#0a66c2] font-medium' 
              : 'text-[#666666] hover:bg-[#f3f2ef]'
          }`}
          onClick={handleLike}
        >
          <ThumbsUp className="h-5 w-5 mr-1" />
          <span className="text-sm font-medium">Like</span>
        </button>
        <button 
          className="flex items-center justify-center text-[#666666] hover:bg-[#f3f2ef] rounded-lg py-2 px-3 flex-1 transition-colors"
          onClick={handleComment}
        >
          <MessageSquare className="h-5 w-5 mr-1" />
          <span className="text-sm font-medium">Comment</span>
        </button>
        <button 
          className="flex items-center justify-center text-[#666666] hover:bg-[#f3f2ef] rounded-lg py-2 px-3 flex-1 transition-colors"
          onClick={handleShare}
        >
          <Share2 className="h-5 w-5 mr-1" />
          <span className="text-sm font-medium">Share</span>
        </button>
        <button 
          className="flex items-center justify-center text-[#666666] hover:bg-[#f3f2ef] rounded-lg py-2 px-3 flex-1 transition-colors"
          onClick={handleSend}
        >
          <Send className="h-5 w-5 mr-1" />
          <span className="text-sm font-medium">Send</span>
        </button>
      </div>
    </div>
  );
}
