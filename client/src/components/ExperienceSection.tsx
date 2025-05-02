import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CalendarIcon, 
  BriefcaseIcon, 
  MapPinIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon
} from "lucide-react";
import type { Experience } from "@shared/schema";
import ExperienceForm from "./ExperienceForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ExperienceSectionProps {
  userId: number;
  isCurrentUser: boolean;
}

export default function ExperienceSection({ userId, isCurrentUser }: ExperienceSectionProps) {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const { toast } = useToast();

  const { data: experiences = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/users', userId, 'experiences'],
    queryFn: () => apiRequest(`/api/users/${userId}/experiences`),
  });

  async function handleDelete(experienceId: number) {
    try {
      await apiRequest(`/api/experiences/${experienceId}`, {
        method: 'DELETE',
      });
      
      toast({
        title: "Experience deleted",
        description: "Your experience has been deleted successfully.",
      });
      
      // Refetch experiences
      refetch();
    } catch (error) {
      console.error("Failed to delete experience:", error);
      toast({
        title: "Error",
        description: "Failed to delete experience. Please try again.",
        variant: "destructive",
      });
    }
  }

  function formatDateRange(startDate: string, endDate: string | null, isCurrentRole: boolean | null) {
    const start = new Date(startDate).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
    
    if (isCurrentRole) {
      return `${start} - Present`;
    }
    
    if (endDate) {
      const end = new Date(endDate).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      return `${start} - ${end}`;
    }
    
    return start;
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Experience</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Experience</CardTitle>
          <CardDescription>Professional experience and work history</CardDescription>
        </div>
        {isCurrentUser && (
          <Dialog open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Experience
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <ExperienceForm 
                onSuccess={() => {
                  setIsAddFormOpen(false);
                  refetch();
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {experiences.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            {isCurrentUser 
              ? "You haven't added any work experience yet." 
              : "No work experience listed."}
          </div>
        ) : (
          experiences.map((experience: Experience) => (
            <div key={experience.id} className="flex gap-4">
              <div className="h-12 w-12 flex items-center justify-center rounded-md bg-muted">
                {experience.companyLogo ? (
                  <img 
                    src={experience.companyLogo} 
                    alt={experience.company} 
                    className="h-8 w-8 object-contain"
                  />
                ) : (
                  <BriefcaseIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-medium">{experience.title}</h4>
                    <p className="text-sm text-muted-foreground">{experience.company}</p>
                  </div>
                  {isCurrentUser && (
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditingExperience(experience)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px]">
                          {editingExperience && (
                            <ExperienceForm 
                              experience={editingExperience}
                              onSuccess={() => {
                                setEditingExperience(null);
                                refetch();
                              }}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(experience.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                    {formatDateRange(
                      experience.startDate, 
                      experience.endDate || null, 
                      experience.isCurrentRole || false
                    )}
                  </div>
                  {experience.location && (
                    <div className="flex items-center">
                      <MapPinIcon className="h-3.5 w-3.5 mr-1" />
                      {experience.location}
                    </div>
                  )}
                </div>
                {experience.description && (
                  <p className="mt-2 text-sm">{experience.description}</p>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}