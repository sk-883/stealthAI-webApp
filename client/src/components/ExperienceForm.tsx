import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Experience } from "@shared/schema";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

// Experience schema for form validation
const experienceFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  isCurrentRole: z.boolean().optional(),
  description: z.string().optional(),
  companyLogo: z.string().optional(),
});

type ExperienceFormValues = z.infer<typeof experienceFormSchema>;

interface ExperienceFormProps {
  experience?: Experience;
  onSuccess: () => void;
}

export default function ExperienceForm({ experience, onSuccess }: ExperienceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize form with existing experience data or defaults
  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: {
      title: experience?.title || "",
      company: experience?.company || "",
      location: experience?.location || "",
      startDate: experience?.startDate 
        ? new Date(experience.startDate).toISOString().split('T')[0] 
        : "",
      endDate: experience?.endDate 
        ? new Date(experience.endDate).toISOString().split('T')[0] 
        : "",
      isCurrentRole: experience?.isCurrentRole || false,
      description: experience?.description || "",
      companyLogo: experience?.companyLogo || "",
    },
  });

  const isCurrentRole = form.watch("isCurrentRole");

  async function onSubmit(values: ExperienceFormValues) {
    try {
      setIsSubmitting(true);

      // Prepare form data
      const formData = {
        ...values,
        // Convert dates to ISO format
        startDate: new Date(values.startDate).toISOString(),
        endDate: values.isCurrentRole 
          ? null 
          : values.endDate 
            ? new Date(values.endDate).toISOString() 
            : null,
      };

      // Determine if this is an update or create operation
      if (experience) {
        // Update existing experience
        await apiRequest(
          "PATCH",
          `/api/experiences/${experience.id}`,
          formData
        );
        toast({
          title: "Experience updated",
          description: "Your experience has been updated successfully.",
        });
      } else {
        // Create new experience
        await apiRequest(
          "POST",
          "/api/experiences",
          formData
        );
        toast({
          title: "Experience added",
          description: "Your experience has been added successfully.",
        });
      }

      // Call the success callback
      onSuccess();
    } catch (error) {
      console.error("Failed to save experience:", error);
      toast({
        title: "Error",
        description: "Failed to save experience. Please try again.",
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Software Engineer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Tech Company Inc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g. San Francisco, CA (Optional)" {...field} />
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
                    disabled={isCurrentRole}
                    value={isCurrentRole ? "" : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isCurrentRole"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>I am currently working in this role</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your responsibilities and achievements (Optional)" 
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
          name="companyLogo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Logo URL</FormLabel>
              <FormControl>
                <Input placeholder="URL to company logo (Optional)" {...field} />
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
                {experience ? "Updating..." : "Adding..."}
              </>
            ) : (
              experience ? "Update Experience" : "Add Experience"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}