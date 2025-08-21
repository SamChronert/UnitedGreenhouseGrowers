import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface VoteButtonsProps {
  entityType: 'post' | 'comment';
  entityId: string;
  score: number;
  userVote?: 1 | -1 | null;
  className?: string;
}

export default function VoteButtons({ entityType, entityId, score, userVote, className }: VoteButtonsProps) {
  const [optimisticScore, setOptimisticScore] = useState(score);
  const [optimisticUserVote, setOptimisticUserVote] = useState(userVote);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: async (value: 1 | -1) => {
      return apiRequest("POST", `${entityType === 'post' ? '/api/forum/posts' : '/api/forum/comments'}/${entityId}/vote`, { value });
    },
    onMutate: (value: 1 | -1) => {
      // Optimistic update
      const currentVote = optimisticUserVote;
      let newScore = optimisticScore;
      
      if (currentVote === value) {
        // Removing vote
        setOptimisticUserVote(null);
        setOptimisticScore(optimisticScore - value);
      } else {
        // Adding or changing vote
        if (currentVote) {
          // Changing vote (remove old, add new)
          newScore = optimisticScore - currentVote + value;
        } else {
          // Adding new vote
          newScore = optimisticScore + value;
        }
        setOptimisticUserVote(value);
        setOptimisticScore(newScore);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
    },
    onError: (error: Error) => {
      // Revert optimistic update
      setOptimisticScore(score);
      setOptimisticUserVote(userVote);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeVoteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `${entityType === 'post' ? '/api/forum/posts' : '/api/forum/comments'}/${entityId}/vote`);
    },
    onMutate: () => {
      // Optimistic update
      if (optimisticUserVote) {
        setOptimisticScore(optimisticScore - optimisticUserVote);
        setOptimisticUserVote(null);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
    },
    onError: (error: Error) => {
      // Revert optimistic update
      setOptimisticScore(score);
      setOptimisticUserVote(userVote);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleVote = (value: 1 | -1) => {
    if (optimisticUserVote === value) {
      // Remove vote if clicking the same button
      removeVoteMutation.mutate();
    } else {
      // Add or change vote
      voteMutation.mutate(value);
    }
  };

  return (
    <div className={cn("flex flex-col items-center space-y-1", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote(1)}
        disabled={voteMutation.isPending || removeVoteMutation.isPending}
        className={cn(
          "h-8 w-8 p-0 hover:bg-orange-100 dark:hover:bg-orange-900/20",
          optimisticUserVote === 1 && "text-orange-500 bg-orange-100 dark:bg-orange-900/20"
        )}
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
      
      <span className={cn(
        "text-sm font-medium text-center min-w-[2rem]",
        optimisticScore > 0 && "text-orange-500",
        optimisticScore < 0 && "text-blue-500"
      )}>
        {optimisticScore}
      </span>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote(-1)}
        disabled={voteMutation.isPending || removeVoteMutation.isPending}
        className={cn(
          "h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20",
          optimisticUserVote === -1 && "text-blue-500 bg-blue-100 dark:bg-blue-900/20"
        )}
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
    </div>
  );
}