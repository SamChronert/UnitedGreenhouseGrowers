import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Edit, Trash2, Save, X } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import type { ForumComment, User, Profile } from "@shared/schema";

interface CommentProps {
  comment: ForumComment & { user: User & { profile: Profile } };
  postId: string;
}

export default function Comment({ comment, postId }: CommentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const canEdit = user?.id === comment.userId;
  const isDeleted = comment.isDeleted || comment.content === "_message deleted_";

  const editCommentMutation = useMutation({
    mutationFn: (content: string) =>
      apiRequest("PUT", `/api/forum/posts/${postId}/comments/${comment.id}`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Comment updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: () =>
      apiRequest("DELETE", `/api/forum/posts/${postId}/comments/${comment.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      toast({
        title: "Success",
        description: "Comment deleted successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    if (!editContent.trim()) {
      toast({
        title: "Error",
        description: "Comment content cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    editCommentMutation.mutate(editContent);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate();
    }
  };

  const renderMedia = (attachments: string[]) => {
    if (!attachments || attachments.length === 0) return null;
    
    return (
      <div className="mt-2 space-y-2">
        {attachments.map((attachment, index) => {
          const isImage = attachment.match(/\.(jpg|jpeg|png|gif)$/i);
          const isVideo = attachment.match(/\.(mp4|mov|webm)$/i);
          
          if (isImage) {
            return (
              <img
                key={index}
                src={attachment}
                alt="Attachment"
                className="max-w-md rounded-lg border"
              />
            );
          } else if (isVideo) {
            return (
              <video
                key={index}
                src={attachment}
                controls
                className="max-w-md rounded-lg border"
              />
            );
          } else {
            return (
              <a
                key={index}
                href={attachment}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View attachment
              </a>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.user.profile.name}`} />
          <AvatarFallback>
            {comment.user.profile.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              {comment.user.profile.name}
            </span>
            <span className="text-xs text-gray-500">
              {comment.user.profile.state}
              {comment.user.profile.county && `, ${comment.user.profile.county}`}
            </span>
            <span className="text-xs text-gray-500">
              {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </span>
            {comment.editedAt && (
              <span className="text-xs text-gray-500 italic flex items-center gap-1">
                <Edit className="h-3 w-3" />
                Edited · {format(new Date(comment.editedAt), "MMM d, yyyy 'at' h:mm a")}
              </span>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-20"
                maxLength={2000}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleEdit}
                  disabled={editCommentMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className={`text-sm ${isDeleted ? 'italic text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                {comment.content}
              </p>
              {!isDeleted && renderMedia(comment.attachments)}
            </div>
          )}
          
          {canEdit && !isDeleted && !isEditing && (
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                disabled={deleteCommentMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}