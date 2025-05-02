import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, MapPin, Briefcase, GraduationCap, UserPlus, Mail } from "lucide-react";
import Post from "@/components/Post";
import NewsSection from "@/components/NewsSection";
import FooterLinks from "@/components/FooterLinks";

export default function Profile() {
  // Get the id from the URL
  const params = useParams();
  const profileId = params.id ? parseInt(params.id) : undefined;
  
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/user"]
  });

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: [`/api/users/${profileId}`],
    enabled: !!profileId
  });

  const { data: posts, isLoading: isLoadingPosts } = useQuery({
    queryKey: [`/api/users/${profileId}/posts`],
    enabled: !!profileId
  });

  const isOwnProfile = currentUser?.id === profileId;

  // Update document title
  useEffect(() => {
    if (user) {
      document.title = `${user.name} | LinkedUp`;
    } else {
      document.title = "Profile | LinkedUp";
    }
  }, [user]);

  if (isLoadingUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-16 md:mb-0">
        <div className="linkedin-card animate-pulse">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-6 relative">
            <div className="absolute -top-16 left-8">
              <div className="h-32 w-32 rounded-full bg-gray-300 border-4 border-white"></div>
            </div>
            <div className="mt-20">
              <div className="h-8 w-48 bg-gray-300 rounded"></div>
              <div className="h-5 w-72 bg-gray-200 rounded mt-2"></div>
              <div className="h-4 w-32 bg-gray-200 rounded mt-2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-16 md:mb-0">
        <div className="linkedin-card p-8 text-center">
          <p className="text-lg font-medium text-[#191919] mb-2">User not found</p>
          <p className="text-sm text-[#666666]">The profile you're looking for doesn't exist or you may not have access to view it.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-16 md:mb-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Main Content */}
        <div className="lg:col-span-9 space-y-5">
          {/* Profile Header */}
          <div className="linkedin-card">
            <div className="h-48 bg-gradient-to-r from-[#0a66c2] to-blue-500"></div>
            <div className="p-6 relative">
              <div className="absolute -top-16 left-8">
                <Avatar className="h-32 w-32 border-4 border-white">
                  <AvatarImage src={user.profilePicture} alt={user.name} />
                  <AvatarFallback className="text-4xl">{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex justify-end">
                {isOwnProfile ? (
                  <Button variant="outline" className="rounded-full">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit profile
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button variant="outline" className="rounded-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button className="rounded-full bg-[#0a66c2] hover:bg-[#004182]">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <h1 className="text-2xl font-bold text-[#191919]">{user.name}</h1>
                <p className="text-lg text-[#666666]">{user.headline}</p>
                
                <div className="flex items-center text-sm text-[#666666] mt-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>San Francisco Bay Area</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src="https://logo.clearbit.com/techcorp.com" alt="TechCorp" />
                      <AvatarFallback>TC</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">TechCorp</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src="https://logo.clearbit.com/stanford.edu" alt="Stanford University" />
                      <AvatarFallback>SU</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">Stanford University</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* About */}
          <div className="linkedin-card p-6">
            <h2 className="text-xl font-bold text-[#191919] mb-4">About</h2>
            <p className="text-[#191919]">{user.bio || "No bio information available."}</p>
          </div>
          
          {/* Experience and Education */}
          <div className="linkedin-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#191919]">Experience</h2>
              {isOwnProfile && (
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="mb-6">
              <div className="flex">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src="https://logo.clearbit.com/techcorp.com" alt="TechCorp" />
                  <AvatarFallback>TC</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-[#191919]">Software Engineer</h3>
                  <p className="text-sm text-[#666666]">TechCorp · Full-time</p>
                  <p className="text-sm text-[#666666]">Jan 2020 - Present · 3 yrs 9 mos</p>
                  <p className="text-sm text-[#666666]">San Francisco, California</p>
                  <p className="text-sm mt-2">Building innovative software solutions for enterprise clients.</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-4 mt-8">
              <h2 className="text-xl font-bold text-[#191919]">Education</h2>
              {isOwnProfile && (
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div>
              <div className="flex">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src="https://logo.clearbit.com/stanford.edu" alt="Stanford University" />
                  <AvatarFallback>SU</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-[#191919]">Stanford University</h3>
                  <p className="text-sm text-[#666666]">Master's degree, Computer Science</p>
                  <p className="text-sm text-[#666666]">2017 - 2019</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Posts */}
          <div className="space-y-5">
            <Tabs defaultValue="posts">
              <TabsList className="w-full bg-white border-b rounded-none h-auto p-0">
                <TabsTrigger 
                  value="posts" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-[#0a66c2] data-[state=active]:rounded-none data-[state=active]:shadow-none py-4 px-6"
                >
                  Posts
                </TabsTrigger>
                <TabsTrigger 
                  value="activity" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-[#0a66c2] data-[state=active]:rounded-none data-[state=active]:shadow-none py-4 px-6"
                >
                  Activity
                </TabsTrigger>
              </TabsList>
              <TabsContent value="posts" className="mt-5 space-y-5">
                {isLoadingPosts ? (
                  <div className="linkedin-card p-8 text-center">
                    <p>Loading posts...</p>
                  </div>
                ) : posts && posts.length > 0 ? (
                  posts.map((post) => (
                    <Post 
                      key={post.id} 
                      post={{ ...post, user }} 
                      currentUserId={currentUser?.id}
                    />
                  ))
                ) : (
                  <div className="linkedin-card p-8 text-center">
                    <p className="text-lg font-medium text-[#191919] mb-2">No posts yet</p>
                    <p className="text-sm text-[#666666]">When {isOwnProfile ? 'you' : 'they'} create posts, they'll appear here.</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="activity" className="mt-5">
                <div className="linkedin-card p-8 text-center">
                  <p className="text-lg font-medium text-[#191919] mb-2">No activity yet</p>
                  <p className="text-sm text-[#666666]">When {isOwnProfile ? 'you' : 'they'} like or comment on posts, it will appear here.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className="lg:col-span-3 space-y-5">
          <NewsSection />
          <FooterLinks />
        </div>
      </div>
    </main>
  );
}
