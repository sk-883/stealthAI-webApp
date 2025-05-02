import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Experience } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

// Define schema for form validation
const experienceSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
  isCurrentRole: z.boolean().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  companyLogo: z.string().optional(),
});

type ExperienceFormValues = z.infer<typeof experienceSchema>;

interface ExperienceFormProps {
  experience?: Experience;
  onSuccess?: () => void;
}

export default function ExperienceForm({ experience, onSuccess }: ExperienceFormProps) {
  const { toast } = useToast();
  const [isCurrentRole, setIsCurrentRole] = useState(experience?.isCurrentRole || false);

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      title: experience?.title || "",
      company: experience?.company || "",
      startDate: experience?.startDate || "",
      endDate: experience?.endDate || "",
      isCurrentRole: experience?.isCurrentRole || false,
      location: experience?.location || "",
      description: experience?.description || "",
      companyLogo: experience?.companyLogo || "",
    },
  });

  const { mutate: saveExperience, isPending } = useMutation({
    mutationFn: async (values: ExperienceFormValues) => {
      if (experience) {
        return await apiRequest(`/api/experiences/${experience.id}`, {
          method: "PATCH",
          body: JSON.stringify(values),
        });
      } else {
        return await apiRequest("/api/experiences", {
          method: "POST",
          body: JSON.stringify(values),
        });
      }
    },
    onSuccess: () => {
      toast({
        title: experience ? "Experience updated" : "Experience added",
        description: experience
          ? "Your experience has been updated successfully"
          : "Your experience has been added successfully",
      });
      
      // Invalidate queries to refresh data
      const currentUser = queryClient.getQueryData<any>(["/api/auth/user"]);
      if (currentUser?.id) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/users', currentUser.id, 'experiences'] 
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      console.error("Failed to save experience:", error);
      toast({
        title: "Error",
        description:
          "There was an error saving your experience. Please try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: ExperienceFormValues) {
    saveExperience(values);
  }

  return (
    <Form {...form}>
      <h2 className="text-lg font-medium mb-6">
        {experience ? "Edit Experience" : "Add Experience"}
      </h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title*</FormLabel>
                <FormControl>
                  <Input placeholder="Software Engineer" {...field} />
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
                <FormLabel>Company*</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Corp" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date*</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="isCurrentRole"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0">
                  <FormLabel>I currently work here</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        setIsCurrentRole(checked);
                        if (checked) {
                          form.setValue("endDate", "");
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {!isCurrentRole && (
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="New York, NY" {...field} value={field.value || ""} />
              </FormControl>
              <FormDescription>
                City, State, Country, or Remote
              </FormDescription>
              <FormMessage />
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
                  placeholder="Describe your responsibilities and achievements..."
                  {...field}
                  value={field.value || ""}
                  rows={4}
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
                <Input placeholder="https://example.com/logo.png" {...field} value={field.value || ""} />
              </FormControl>
              <FormDescription>
                URL to the company logo image (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (onSuccess) onSuccess();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {experience ? "Update" : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
}