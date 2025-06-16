import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Check } from "lucide-react";

const challengeCategories = [
  { value: "irrigation", label: "Irrigation & Water Management" },
  { value: "disease", label: "Disease & Pest Control" },
  { value: "labor", label: "Labor & Workforce" },
  { value: "economics", label: "Economics & Pricing" },
  { value: "policy", label: "Policy & Regulations" },
  { value: "technology", label: "Technology & Equipment" },
  { value: "energy", label: "Energy & Climate Control" },
  { value: "market", label: "Market Access & Distribution" },
  { value: "research", label: "Research & Development" },
  { value: "other", label: "Other" }
];

export default function ChallengeSubmissionForm() {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitChallenge = useMutation({
    mutationFn: (data: { description: string; category?: string }) => 
      apiRequest("POST", "/api/challenges", data),
    onSuccess: () => {
      setIsSubmitted(true);
      setDescription("");
      setCategory("");
      toast({
        title: "Challenge Submitted",
        description: "Thanks for sharing — your insight helps shape what we build next.",
      });
      
      // Reset submission state after 3 seconds
      setTimeout(() => setIsSubmitted(false), 3000);
      
      // Invalidate any admin challenge queries if they exist
      queryClient.invalidateQueries({ queryKey: ["/api/admin/challenges"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: "Unable to submit your challenge. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please describe the challenge you're facing.",
        variant: "destructive",
      });
      return;
    }

    submitChallenge.mutate({
      description: description.trim(),
      category: category || undefined,
    });
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center py-8 text-center">
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div>
            <p className="text-lg font-medium text-green-700">Thank you for sharing!</p>
            <p className="text-gray-600">Your insight helps shape what we build next.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            What challenge are you facing?
          </label>
          <Textarea
            id="description"
            placeholder="Tell us about operational challenges, areas where you need better support, knowledge gaps, or suggestions for research and policy..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[120px] resize-none"
            maxLength={2000}
          />
          <p className="text-xs text-gray-500">
            {description.length}/2000 characters
          </p>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            Category (optional)
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {challengeCategories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            type="submit" 
            disabled={!description.trim() || submitChallenge.isPending}
            className="w-full bg-ugga-secondary hover:bg-ugga-secondary/90 mt-4"
          >
            {submitChallenge.isPending ? "Submitting..." : "Share Challenge"}
          </Button>
        </div>
      </div>
    </form>
  );
}