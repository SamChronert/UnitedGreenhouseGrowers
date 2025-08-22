import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ObjectUploaderProps {
  onComplete?: (imageUrl: string) => void;
  buttonClassName?: string;
  children: ReactNode;
  accept?: string;
  maxFileSize?: number; // in bytes
}

/**
 * A simple file upload component that uploads to object storage
 * 
 * @param props - Component props
 * @param props.onComplete - Callback when upload is complete with the image URL
 * @param props.buttonClassName - Optional CSS class name for the button
 * @param props.children - Content to be rendered inside the button
 * @param props.accept - File types to accept (default: images)
 * @param props.maxFileSize - Maximum file size in bytes (default: 5MB)
 */
export function ObjectUploader({
  onComplete,
  buttonClassName,
  children,
  accept = "image/*",
  maxFileSize = 5 * 1024 * 1024, // 5MB default
}: ObjectUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxFileSize) {
      toast({
        title: "File too large",
        description: `File must be smaller than ${Math.round(maxFileSize / 1024 / 1024)}MB`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Get upload URL from backend
      const uploadResponse = await fetch('/api/resource-images/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to get upload URL');
      }
      
      const { uploadURL } = await uploadResponse.json();
      
      // Upload file directly to object storage
      const uploadFileResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
      
      if (!uploadFileResponse.ok) {
        throw new Error('Failed to upload file');
      }
      
      // Extract the file path from the upload URL
      const url = new URL(uploadURL);
      const filePath = url.pathname;
      
      // Notify completion with the file path
      onComplete?.(filePath);
      
      toast({
        title: "Upload successful",
        description: "Image has been uploaded successfully.",
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  return (
    <div>
      <input
        type="file"
        accept={accept}
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        id="image-upload-input"
        disabled={isUploading}
      />
      <label htmlFor="image-upload-input">
        <Button 
          type="button"
          disabled={isUploading} 
          className={buttonClassName}
          asChild
        >
          <span>
            {isUploading ? "Uploading..." : children}
          </span>
        </Button>
      </label>
    </div>
  );
}