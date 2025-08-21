import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Check } from "lucide-react";

const suggestionQuestions = [
  "What does a United Greenhouse Growers Association look like to you?",
  "Which existing features or resources would you actually see yourself using regularly?",
  "What different features, tools, or resources would be most helpful to you that aren't here yet?",
  "What problems or challenges in your work do you hope this Association could help solve?",
  "What would make you excited to join and stay engaged with a community like this?",
  "What kinds of connections (with growers, researchers, suppliers, policymakers, etc.) would you most value?",
  "What formats of resources are most useful for you (guides, templates, webinars, discussion boards, research summaries, funding opportunities, etc.)?",
  "How could the Association best support you in growing your business, advancing your career, or improving your greenhouse operations?",
  "What would make this Association feel unique and worth your time compared to existing resources or networks?",
  "What's one big idea or 'dream feature' you'd love to see included here?"
];

export default function ChallengeSubmissionForm() {
  const [description, setDescription] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitChallenge = useMutation({
    mutationFn: (data: { description: string }) => 
      apiRequest("POST", "/api/challenges", data),
    onSuccess: () => {
      setIsSubmitted(true);
      setDescription("");
      toast({
        title: "Response Submitted",
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
        description: "Unable to submit your response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast({
        title: "Response Required",
        description: "Please share your thoughts before submitting.",
        variant: "destructive",
      });
      return;
    }

    submitChallenge.mutate({
      description: description.trim()
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
      <div className="grid md:grid-cols-3 gap-6">
        {/* Response Text Area - Left Side */}
        <div className="md:col-span-2 space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Your Response
          </label>
          <Textarea
            id="description"
            placeholder="Share your thoughts on any of the questions in the sidebar, or tell us anything else you'd like us to know about your vision for the Association..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[200px] resize-none"
            maxLength={2000}
          />
          <p className="text-xs text-gray-500">
            {description.length}/2000 characters
          </p>
          
          <Button 
            type="submit" 
            disabled={!description.trim() || submitChallenge.isPending}
            className="w-full text-white rounded-lg font-medium shadow-lg hover:opacity-90 transition-all duration-300 mt-4"
            style={{backgroundColor: 'var(--color-clay)'}}
          >
            {submitChallenge.isPending ? "Submitting..." : "Submit Response"}
          </Button>
        </div>

        {/* Suggestion Questions - Right Sidebar */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Questions to Consider (optional)
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 h-[240px] overflow-y-auto">
            <div className="space-y-3">
              {suggestionQuestions.map((question, index) => (
                <div key={index} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2 pb-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0">
                  <span className="text-ugga-secondary font-medium mt-0.5 flex-shrink-0">{index + 1}.</span>
                  <span className="leading-relaxed">{question}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}