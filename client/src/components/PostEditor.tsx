import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ForumCategory, type ForumPost } from "@shared/schema";
import { Upload, X, Image, Video, Link } from "lucide-react";

interface PostEditorProps {
  post?: ForumPost;
  onSave: (data: {
    title: string;
    content: string;
    category: string;
    attachments: string[];
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function PostEditor({ post, onSave, onCancel, isLoading }: PostEditorProps) {
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [category, setCategory] = useState(post?.category || "");
  const [attachments, setAttachments] = useState<string[]>(post?.attachments || []);
  const [uploadMode, setUploadMode] = useState<'file' | 'url' | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, GIF, MP4, MOV, or WEBM file.",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/forum/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setAttachments(prev => [...prev, result.url]);
      setUploadMode(null);
      
      toast({
        title: "Success",
        description: "File uploaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return;
    
    // Basic URL validation
    try {
      new URL(urlInput);
      setAttachments(prev => [...prev, urlInput]);
      setUrlInput("");
      setUploadMode(null);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL.",
        variant: "destructive",
      });
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim() || !category) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    onSave({
      title: title.trim(),
      content: content.trim(),
      category,
      attachments,
    });
  };

  const isEditing = !!post;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Post" : "Create New Post"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title..."
            maxLength={200}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category *
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ForumCategory).map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Content *
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            rows={8}
            maxLength={5000}
          />
        </div>

        {/* Media Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Media (Optional)
          </label>
          
          {!uploadMode && (
            <div className="flex gap-2 mb-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setUploadMode('file')}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setUploadMode('url')}
              >
                <Link className="h-4 w-4 mr-2" />
                Add URL
              </Button>
            </div>
          )}

          {uploadMode === 'file' && (
            <div className="mb-2">
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,video/mp4,video/quicktime,video/webm"
                onChange={handleFileUpload}
                className="mb-2"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setUploadMode(null)}
              >
                Cancel
              </Button>
            </div>
          )}

          {uploadMode === 'url' && (
            <div className="flex gap-2 mb-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter image or video URL..."
              />
              <Button
                type="button"
                size="sm"
                onClick={handleUrlAdd}
              >
                Add
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setUploadMode(null)}
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((attachment, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  {attachment.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <Image className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Video className="h-4 w-4 text-green-500" />
                  )}
                  <span className="text-sm truncate flex-1">{attachment}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : (isEditing ? "Update Post" : "Create Post")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}