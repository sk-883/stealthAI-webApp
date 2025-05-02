import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import CreatePostModal from "./CreatePostModal";
import { useQuery } from "@tanstack/react-query";
import { Image, Video, Calendar, FileText } from "lucide-react";

export default function CreatePostCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: user, isLoading } = useQuery({ 
    queryKey: ["/api/auth/user"]
  });
  
  if (isLoading) {
    return (
      <div className="linkedin-card p-4 animate-pulse">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-gray-300"></div>
          <div className="bg-gray-200 h-12 rounded-full flex-grow ml-3"></div>
        </div>
        <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
          <div className="h-8 w-20 bg-gray-200 rounded"></div>
          <div className="h-8 w-20 bg-gray-200 rounded"></div>
          <div className="h-8 w-20 bg-gray-200 rounded"></div>
          <div className="h-8 w-20 bg-gray-200 rounded hidden md:block"></div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null;
  }
  
  return (
    <>
      <div className="linkedin-card p-4">
        <div className="flex items-center">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.profilePicture} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <button 
            className="bg-white border border-[#e0e0e0] hover:bg-[#f3f2ef] text-[#666666] rounded-full py-3 px-3 text-left flex-grow ml-3"
            onClick={() => setIsModalOpen(true)}
          >
            Start a post
          </button>
        </div>
        <div className="flex justify-between mt-3 pt-3 border-t border-[#e0e0e0]">
          <button 
            className="flex items-center text-[#666666] hover:bg-[#f3f2ef] rounded-lg py-1 px-3 transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            <Image className="h-6 w-6 mr-2 text-blue-500" />
            <span className="text-sm font-medium">Photo</span>
          </button>
          <button 
            className="flex items-center text-[#666666] hover:bg-[#f3f2ef] rounded-lg py-1 px-3 transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            <Video className="h-6 w-6 mr-2 text-green-600" />
            <span className="text-sm font-medium">Video</span>
          </button>
          <button 
            className="flex items-center text-[#666666] hover:bg-[#f3f2ef] rounded-lg py-1 px-3 transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            <Calendar className="h-6 w-6 mr-2 text-amber-600" />
            <span className="text-sm font-medium">Event</span>
          </button>
          <button 
            className="flex items-center text-[#666666] hover:bg-[#f3f2ef] rounded-lg py-1 px-3 transition-colors md:inline-flex hidden"
            onClick={() => setIsModalOpen(true)}
          >
            <FileText className="h-6 w-6 mr-2 text-rose-600" />
            <span className="text-sm font-medium">Article</span>
          </button>
        </div>
      </div>
      
      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
