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
  GraduationCapIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon
} from "lucide-react";
import type { Education } from "@shared/schema";
import EducationForm from "./EducationForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EducationSectionProps {
  userId: number;
  isCurrentUser: boolean;
}

export default function EducationSection({ userId, isCurrentUser }: EducationSectionProps) {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const { toast } = useToast();

  const { data: educations = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/users', userId, 'educations'],
  });

  async function handleDelete(educationId: number) {
    try {
      await apiRequest(
        'DELETE',
        `/api/educations/${educationId}`
      );
      
      toast({
        title: "Education deleted",
        description: "Your education entry has been deleted successfully.",
      });
      
      // Refetch educations
      refetch();
    } catch (error) {
      console.error("Failed to delete education:", error);
      toast({
        title: "Error",
        description: "Failed to delete education. Please try again.",
        variant: "destructive",
      });
    }
  }

  function formatDateRange(startDate: string, endDate: string | null) {
    const start = new Date(startDate).getFullYear();
    
    if (endDate) {
      const end = new Date(endDate).getFullYear();
      return `${start} - ${end}`;
    }
    
    return `${start} - Present`;
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Education</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Education</CardTitle>
          <CardDescription>Academic background and qualifications</CardDescription>
        </div>
        {isCurrentUser && (
          <Dialog open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Education
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <EducationForm 
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
        {educations.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            {isCurrentUser 
              ? "You haven't added any education yet." 
              : "No education listed."}
          </div>
        ) : (
          educations.map((education: Education) => (
            <div key={education.id} className="flex gap-4">
              <div className="h-12 w-12 flex items-center justify-center rounded-md bg-muted">
                {education.schoolLogo ? (
                  <img 
                    src={education.schoolLogo} 
                    alt={education.school} 
                    className="h-8 w-8 object-contain"
                  />
                ) : (
                  <GraduationCapIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-medium">{education.school}</h4>
                    <p className="text-sm text-muted-foreground">
                      {education.degree} 
                      {education.fieldOfStudy && `, ${education.fieldOfStudy}`}
                    </p>
                  </div>
                  {isCurrentUser && (
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditingEducation(education)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px]">
                          {editingEducation && (
                            <EducationForm 
                              education={editingEducation}
                              onSuccess={() => {
                                setEditingEducation(null);
                                refetch();
                              }}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(education.id)}
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
                      education.startDate, 
                      education.endDate || null
                    )}
                  </div>
                </div>
                {education.description && (
                  <p className="mt-2 text-sm">{education.description}</p>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}