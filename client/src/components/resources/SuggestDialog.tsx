import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";

const suggestResourceSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  type: z.string().min(1, "Resource type is required"),
  note: z.string().max(1000, "Note must be less than 1000 characters").optional(),
});

type SuggestResourceData = z.infer<typeof suggestResourceSchema>;

interface SuggestResourcePayload {
  type: "resource_suggestion";
  title: string;
  url?: string;
  resourceType: string;
  note?: string;
}

async function submitResourceSuggestion(data: SuggestResourcePayload) {
  const response = await fetch('/api/feedback', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to submit resource suggestion');
  }

  return response.json();
}

export function SuggestDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<SuggestResourceData>({
    resolver: zodResolver(suggestResourceSchema),
    defaultValues: {
      title: "",
      url: "",
      type: "",
      note: "",
    },
  });

  const mutation = useMutation({
    mutationFn: submitResourceSuggestion,
    onSuccess: () => {
      toast({
        title: "Resource suggestion submitted",
        description: "Thank you for helping us expand our resource library!",
      });
      form.reset();
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit resource suggestion. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SuggestResourceData) => {
    mutation.mutate({
      type: "resource_suggestion",
      title: data.title,
      url: data.url || undefined,
      resourceType: data.type,
      note: data.note || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Suggest a resource
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Suggest a resource</DialogTitle>
          <DialogDescription>
            Help fellow growers by suggesting a valuable resource for our library. We'll review and add it if appropriate.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Cornell Greenhouse Production Guide"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/resource"
                      type="url"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resource type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="university">University/Extension</SelectItem>
                      <SelectItem value="organization">Organization</SelectItem>
                      <SelectItem value="grant">Grant/Funding</SelectItem>
                      <SelectItem value="tool">Tool/Software</SelectItem>
                      <SelectItem value="education">Educational Material</SelectItem>
                      <SelectItem value="template">Template/Document</SelectItem>
                      <SelectItem value="consultant">Consultant/Service</SelectItem>
                      <SelectItem value="article">Article/Publication</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Why is this resource valuable? What topics does it cover?"
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  "Submit suggestion"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}