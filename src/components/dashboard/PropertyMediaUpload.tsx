import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, X, Image, Video, Loader2 } from "lucide-react";

interface MediaFile {
  id?: string;
  file_url: string;
  file_type: "image" | "video";
  file_name: string;
  file_size?: number;
}

interface PropertyMediaUploadProps {
  propertyId?: string;
  onMediaChange?: (media: MediaFile[]) => void;
  initialMedia?: MediaFile[];
}

export function PropertyMediaUpload({ 
  propertyId, 
  onMediaChange,
  initialMedia = [] 
}: PropertyMediaUploadProps) {
  const { profile } = useAuth();
  const [media, setMedia] = useState<MediaFile[]>(initialMedia);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newMedia: MediaFile[] = [];

    try {
      for (const file of Array.from(files)) {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");

        if (!isImage && !isVideo) {
          toast.error(`${file.name} is not a supported file type`);
          continue;
        }

        // Check file size (50MB limit for videos, 10MB for images)
        const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
          toast.error(`${file.name} is too large. Max size: ${isVideo ? "50MB" : "10MB"}`);
          continue;
        }

        // Generate unique filename
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = propertyId ? `${propertyId}/${fileName}` : `temp/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("property-media")
          .upload(filePath, file);

        if (uploadError) {
          toast.error(`Failed to upload ${file.name}`);
          console.error("Upload error:", uploadError);
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("property-media")
          .getPublicUrl(filePath);

        const mediaItem: MediaFile = {
          file_url: publicUrl,
          file_type: isImage ? "image" : "video",
          file_name: file.name,
          file_size: file.size,
        };

        // If we have a propertyId, save to database
        if (propertyId) {
          const { data, error: dbError } = await supabase
            .from("property_media")
            .insert({
              property_id: propertyId,
              file_url: publicUrl,
              file_type: isImage ? "image" : "video",
              file_name: file.name,
              file_size: file.size,
              uploaded_by_id: profile?.id,
            })
            .select()
            .single();

          if (dbError) {
            console.error("Database error:", dbError);
          } else if (data) {
            mediaItem.id = data.id;
          }
        }

        newMedia.push(mediaItem);
      }

      const updatedMedia = [...media, ...newMedia];
      setMedia(updatedMedia);
      onMediaChange?.(updatedMedia);

      if (newMedia.length > 0) {
        toast.success(`${newMedia.length} file(s) uploaded successfully`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload files");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeMedia = async (index: number) => {
    const item = media[index];
    
    try {
      // Extract file path from URL
      const urlParts = item.file_url.split("/property-media/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from("property-media").remove([filePath]);
      }

      // Remove from database if it has an id
      if (item.id) {
        await supabase.from("property_media").delete().eq("id", item.id);
      }

      const updatedMedia = media.filter((_, i) => i !== index);
      setMedia(updatedMedia);
      onMediaChange?.(updatedMedia);
      toast.success("File removed");
    } catch (error) {
      console.error("Remove error:", error);
      toast.error("Failed to remove file");
    }
  };

  return (
    <div className="space-y-4">
      <Label>Property Media (Images & Videos)</Label>
      
      <div className="border-2 border-dashed border-border rounded-lg p-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="media-upload"
        />
        
        <label
          htmlFor="media-upload"
          className="flex flex-col items-center justify-center cursor-pointer py-4"
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-2" />
              <span className="text-sm text-muted-foreground">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                Click to upload images or videos
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                Images: up to 10MB | Videos: up to 50MB
              </span>
            </>
          )}
        </label>
      </div>

      {media.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {media.map((item, index) => (
            <div
              key={index}
              className="relative group rounded-lg overflow-hidden border border-border bg-muted"
            >
              {item.file_type === "image" ? (
                <img
                  src={item.file_url}
                  alt={item.file_name}
                  className="w-full h-24 object-cover"
                />
              ) : (
                <div className="w-full h-24 flex items-center justify-center bg-muted">
                  <Video className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeMedia(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                <div className="flex items-center gap-1">
                  {item.file_type === "image" ? (
                    <Image className="h-3 w-3 text-white" />
                  ) : (
                    <Video className="h-3 w-3 text-white" />
                  )}
                  <span className="text-xs text-white truncate">{item.file_name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
