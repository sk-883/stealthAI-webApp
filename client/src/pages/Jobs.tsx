import { Briefcase, Search, MapPin, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Jobs() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-16 md:mb-0">
      <h1 className="text-2xl font-bold mb-6">Jobs</h1>
      
      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="md:col-span-5">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-9" 
              placeholder="Search by title, skill, or company" 
            />
          </div>
        </div>
        <div className="md:col-span-5">
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-9" 
              placeholder="Location" 
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <Button variant="outline" className="w-full">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left Column - Filters */}
        <div className="md:col-span-3 space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">My Jobs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4 mr-2" />
                <span>Saved Jobs</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4 mr-2" />
                <span>Job Alerts</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4 mr-2" />
                <span>Applications</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Job Type</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="full-time" className="mr-2" />
                    <label htmlFor="full-time">Full-time</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="part-time" className="mr-2" />
                    <label htmlFor="part-time">Part-time</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="contract" className="mr-2" />
                    <label htmlFor="contract">Contract</label>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Location</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="remote" className="mr-2" />
                    <label htmlFor="remote">Remote</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="hybrid" className="mr-2" />
                    <label htmlFor="hybrid">Hybrid</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="onsite" className="mr-2" />
                    <label htmlFor="onsite">On-site</label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Job Listings */}
        <div className="md:col-span-9 space-y-5">
          <Select defaultValue="relevant">
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevant">Most Relevant</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="salary">Highest Salary</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Job Cards */}
          <div className="space-y-4">
            {/* Job Card 1 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src="https://logo.clearbit.com/google.com" alt="Google" />
                    <AvatarFallback>G</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-1">Senior Frontend Developer</h3>
                    <p className="text-sm text-muted-foreground mb-2">Google · Mountain View, CA (On-site)</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline">React</Badge>
                      <Badge variant="outline">TypeScript</Badge>
                      <Badge variant="outline">GraphQL</Badge>
                    </div>
                    <p className="text-sm mb-3">
                      Join our team to build exceptional user interfaces for our products.
                      You'll work closely with designers and backend engineers to create 
                      seamless experiences used by millions.
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        <span>$140K - $180K · </span>
                        <span>Posted 2 days ago</span>
                      </div>
                      <Button size="sm">Apply</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Job Card 2 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src="https://logo.clearbit.com/microsoft.com" alt="Microsoft" />
                    <AvatarFallback>M</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-1">Full Stack Engineer</h3>
                    <p className="text-sm text-muted-foreground mb-2">Microsoft · Remote (US)</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline">Node.js</Badge>
                      <Badge variant="outline">React</Badge>
                      <Badge variant="outline">Azure</Badge>
                    </div>
                    <p className="text-sm mb-3">
                      Looking for a talented Full Stack Engineer to join our cloud services team.
                      You'll be responsible for building and maintaining APIs and frontends for 
                      our enterprise applications.
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        <span>$130K - $170K · </span>
                        <span>Posted 5 days ago</span>
                      </div>
                      <Button size="sm">Apply</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Job Card 3 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src="https://logo.clearbit.com/apple.com" alt="Apple" />
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-1">iOS Developer</h3>
                    <p className="text-sm text-muted-foreground mb-2">Apple · Cupertino, CA (Hybrid)</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline">Swift</Badge>
                      <Badge variant="outline">iOS</Badge>
                      <Badge variant="outline">SwiftUI</Badge>
                    </div>
                    <p className="text-sm mb-3">
                      Join the team that builds world-class iOS applications. You'll work on
                      creating innovative features for our suite of applications with a focus
                      on performance and user experience.
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        <span>$150K - $190K · </span>
                        <span>Posted yesterday</span>
                      </div>
                      <Button size="sm">Apply</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Separator />
          
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Show More
          </Button>
        </div>
      </div>
    </div>
  );
}