import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import ProfileCard from "@/components/ProfileCard";
import RecentSection from "@/components/RecentSection";
import CreatePostCard from "@/components/CreatePostCard";
import Post from "@/components/Post";
import NewsSection from "@/components/NewsSection";
import PeopleSection from "@/components/PeopleSection";
import FooterLinks from "@/components/FooterLinks";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"]
  });

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["/api/posts"]
  });

  // Update document title
  useEffect(() => {
    document.title = "LinkedUp - Home";
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-16 md:mb-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-3 space-y-5">
          <ProfileCard />
          <RecentSection />
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-6 space-y-5">
          <CreatePostCard />
          
          {/* Post loading state */}
          {isLoading && (
            <>
              {[1, 2].map((i) => (
                <div key={i} className="linkedin-card p-4 space-y-4">
                  <div className="flex gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-24 w-full" />
                  <div className="flex justify-between pt-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              ))}
            </>
          )}
          
          {/* Error state */}
          {error && (
            <div className="linkedin-card p-8 text-center">
              <p className="text-red-500 mb-2">Error loading posts</p>
              <p className="text-sm text-[#666666]">Please try refreshing the page</p>
            </div>
          )}
          
          {/* Posts */}
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <Post 
                key={post.id} 
                post={post} 
                currentUserId={user?.id}
              />
            ))
          ) : (
            !isLoading && !error && (
              <div className="linkedin-card p-8 text-center">
                <p className="text-lg font-medium text-[#191919] mb-2">No posts yet</p>
                <p className="text-sm text-[#666666]">Be the first to share something with your network!</p>
              </div>
            )
          )}
        </div>
        
        {/* Right Sidebar */}
        <div className="lg:col-span-3 space-y-5">
          <NewsSection />
          <PeopleSection />
          <FooterLinks />
        </div>
      </div>
    </main>
  );
}
