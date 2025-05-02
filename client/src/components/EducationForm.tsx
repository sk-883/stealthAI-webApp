import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Education } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

// Education schema for form validation
const educationFormSchema = z.object({
  school: z.string().min(1, "School name is required"),
  degree: z.string().min(1, "Degree is required"),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  description: z.string().optional(),
  schoolLogo: z.string().optional(),
});

type EducationFormValues = z.infer<typeof educationFormSchema>;

interface EducationFormProps {
  education?: Education;
  onSuccess: () => void;
}

export default function EducationForm({ education, onSuccess }: EducationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize form with existing education data or defaults
  const form = useForm<EducationFormValues>({
    resolver: zodResolver(educationFormSchema),
    defaultValues: {
      school: education?.school || "",
      degree: education?.degree || "",
      fieldOfStudy: education?.fieldOfStudy || "",
      startDate: education?.startDate 
        ? new Date(education.startDate).toISOString().split('T')[0] 
        : "",
      endDate: education?.endDate 
        ? new Date(education.endDate).toISOString().split('T')[0] 
        : "",
      description: education?.description || "",
      schoolLogo: education?.schoolLogo || "",
    },
  });

  async function onSubmit(values: EducationFormValues) {
    try {
      setIsSubmitting(true);

      // Prepare form data
      const formData = {
        ...values,
        // Convert dates to ISO format
        startDate: new Date(values.startDate).toISOString(),
        endDate: values.endDate 
          ? new Date(values.endDate).toISOString() 
          : null,
      };

      // Determine if this is an update or create operation
      if (education) {
        // Update existing education
        await apiRequest(
          "PATCH",
          `/api/educations/${education.id}`,
          formData
        );
        toast({
          title: "Education updated",
          description: "Your education has been updated successfully.",
        });
      } else {
        // Create new education
        await apiRequest(
          "POST",
          "/api/educations",
          formData
        );
        toast({
          title: "Education added",
          description: "Your education has been added successfully.",
        });
      }

      // Call the success callback
      onSuccess();
    } catch (error) {
      console.error("Failed to save education:", error);
      toast({
        title: "Error",
        description: "Failed to save education. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="school"
          render={({ field }) => (
            <FormItem>
              <FormLabel>School</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Stanford University" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="degree"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Degree</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Bachelor's, Master's, PhD" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fieldOfStudy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field of Study</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Computer Science (Optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add details about your education experience (Optional)" 
                  {...field} 
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="schoolLogo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>School Logo URL</FormLabel>
              <FormControl>
                <Input placeholder="URL to school logo (Optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button 
            type="submit" 
            className="bg-[#0a66c2] hover:bg-[#004182]" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {education ? "Updating..." : "Adding..."}
              </>
            ) : (
              education ? "Update Education" : "Add Education"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}