import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Upload, X, Image, Video, Loader2, RefreshCw, AlertCircle, 
  CheckCircle, WifiOff, ShieldAlert, FolderX, Database, GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// File validation config
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_VIDEO_SIZE = 250 * 1024 * 1024; // 250MB
const MAX_FILES_PER_PROPERTY = 20;

type UploadStatus = "pending" | "uploading" | "linking" | "success" | "error" | "cancelled";
type ErrorType = "size" | "type" | "network" | "permission" | "bucket" | "database" | "unknown";

interface UploadFile {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
  errorType?: ErrorType;
  mediaId?: string;
  publicUrl?: string;
  storagePath?: string;
}

interface MediaFile {
  id?: string;
  file_url: string;
  file_type: "image" | "video";
  file_name: string;
  file_size?: number;
  sort_order?: number;
}

interface PropertyMediaUploadProps {
  propertyId?: string;
  onMediaChange?: (media: MediaFile[]) => void;
}

const getErrorIcon = (errorType?: ErrorType) => {
  switch (errorType) {
    case "network": return <WifiOff className="h-4 w-4" />;
    case "permission": return <ShieldAlert className="h-4 w-4" />;
    case "bucket": return <FolderX className="h-4 w-4" />;
    case "database": return <Database className="h-4 w-4" />;
    default: return <AlertCircle className="h-4 w-4" />;
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Sortable media item component
function SortableMediaItem({ 
  item, 
  index, 
  onRemove 
}: { 
  item: MediaFile; 
  index: number; 
  onRemove: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id || `item-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group rounded-lg overflow-hidden border border-border bg-muted",
        isDragging && "z-50 shadow-lg"
      )}
    >
      {/* Drag handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-1 left-1 z-10 bg-black/50 rounded p-1 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-white" />
      </div>

      {/* Sort order badge */}
      <div className="absolute top-1 right-8 z-10 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
        {index + 1}
      </div>

      {item.file_type === "image" ? (
        imageError ? (
          <div className="w-full h-28 flex items-center justify-center bg-muted">
            <div className="text-center text-muted-foreground">
              <Image className="h-8 w-8 mx-auto mb-1 opacity-50" />
              <span className="text-xs">Failed to load</span>
            </div>
          </div>
        ) : (
          <img
            src={item.file_url}
            alt={item.file_name}
            className="w-full h-28 object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )
      ) : (
        videoError ? (
          <div className="w-full h-28 flex items-center justify-center bg-muted">
            <div className="text-center text-muted-foreground">
              <Video className="h-8 w-8 mx-auto mb-1 opacity-50" />
              <span className="text-xs">Failed to load</span>
            </div>
          </div>
        ) : (
          <video
            src={item.file_url}
            className="w-full h-28 object-cover"
            muted
            playsInline
            onError={() => setVideoError(true)}
          />
        )
      )}
      
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="h-8 w-8 pointer-events-auto"
          onClick={() => onRemove(index)}
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
  );
}

export function PropertyMediaUpload({ 
  propertyId, 
  onMediaChange,
}: PropertyMediaUploadProps) {
  const { profile } = useAuth();
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [uploadQueue, setUploadQueue] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch existing media when propertyId is provided
  useEffect(() => {
    if (propertyId) {
      fetchExistingMedia();
    }
  }, [propertyId]);

  const fetchExistingMedia = async () => {
    if (!propertyId) return;
    
    setIsLoading(true);
    setLoadError(null);
    
    try {
      const { data, error } = await supabase
        .from("property_media")
        .select("id, file_url, file_type, file_name, file_size, sort_order")
        .eq("property_id", propertyId)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Error fetching media:", error);
        setLoadError("Failed to load existing media");
        return;
      }

      const mediaItems: MediaFile[] = (data || []).map(item => ({
        id: item.id,
        file_url: item.file_url,
        file_type: item.file_type as "image" | "video",
        file_name: item.file_name,
        file_size: item.file_size || undefined,
        sort_order: item.sort_order || 0,
      }));

      setMedia(mediaItems);
      onMediaChange?.(mediaItems);
    } catch (err) {
      console.error("Error fetching media:", err);
      setLoadError("Failed to load existing media");
    } finally {
      setIsLoading(false);
    }
  };

  const validateFile = (file: File): { valid: boolean; error?: string; errorType?: ErrorType } => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      return { valid: false, error: `Unsupported file type: ${file.type || "unknown"}`, errorType: "type" };
    }

    if (isImage && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { 
        valid: false, 
        error: `Image type not allowed. Use: JPG, PNG, or WebP`, 
        errorType: "type" 
      };
    }

    if (isVideo && !ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return { 
        valid: false, 
        error: `Video type not allowed. Use: MP4, MOV, or WebM`, 
        errorType: "type" 
      };
    }

    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `File too large. Max: ${formatFileSize(maxSize)}`, 
        errorType: "size" 
      };
    }

    return { valid: true };
  };

  const parseStorageError = (error: any): { message: string; type: ErrorType } => {
    const errorMessage = error?.message?.toLowerCase() || error?.error?.toLowerCase() || "";
    
    if (errorMessage.includes("policy") || errorMessage.includes("permission") || errorMessage.includes("row-level security")) {
      return { 
        message: "Permission denied. You may not have access to upload media for this property.", 
        type: "permission" 
      };
    }
    if (errorMessage.includes("bucket") || errorMessage.includes("not found")) {
      return { 
        message: "Storage bucket not configured. Contact support.", 
        type: "bucket" 
      };
    }
    if (errorMessage.includes("network") || errorMessage.includes("fetch") || errorMessage.includes("timeout")) {
      return { 
        message: "Network error. Check your connection and retry.", 
        type: "network" 
      };
    }
    return { 
      message: error?.message || "Upload failed. Please try again.", 
      type: "unknown" 
    };
  };

  const uploadSingleFile = async (uploadFile: UploadFile): Promise<void> => {
    const { id, file } = uploadFile;
    const isImage = file.type.startsWith("image/");
    const mediaType = isImage ? "image" : "video";

    setUploadQueue(prev => prev.map(f => 
      f.id === id ? { ...f, status: "uploading" as UploadStatus, progress: 0 } : f
    ));

    try {
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "bin";
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 50);
      const fileName = `${timestamp}-${safeFileName}`;
      const basePath = propertyId || "temp";
      const storagePath = `${basePath}/${mediaType}/${fileName}`;

      const abortController = new AbortController();
      abortControllers.current.set(id, abortController);

      const progressInterval = setInterval(() => {
        setUploadQueue(prev => prev.map(f => {
          if (f.id === id && f.status === "uploading" && f.progress < 90) {
            return { ...f, progress: Math.min(f.progress + Math.random() * 15, 90) };
          }
          return f;
        }));
      }, 300);

      const { error: uploadError } = await supabase.storage
        .from("property-media")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      clearInterval(progressInterval);

      if (uploadError) {
        const { message, type } = parseStorageError(uploadError);
        console.error("Storage upload error:", uploadError);
        setUploadQueue(prev => prev.map(f => 
          f.id === id ? { ...f, status: "error" as UploadStatus, error: message, errorType: type, progress: 0 } : f
        ));
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("property-media")
        .getPublicUrl(storagePath);

      setUploadQueue(prev => prev.map(f => 
        f.id === id ? { ...f, progress: 95, storagePath, publicUrl } : f
      ));

      if (propertyId) {
        setUploadQueue(prev => prev.map(f => 
          f.id === id ? { ...f, status: "linking" as UploadStatus } : f
        ));

        const { data: mediaData, error: dbError } = await supabase
          .from("property_media")
          .insert({
            property_id: propertyId,
            file_url: publicUrl,
            file_type: mediaType,
            file_name: file.name,
            file_size: file.size,
            uploaded_by_id: profile?.id,
            sort_order: media.length,
          })
          .select()
          .single();

        if (dbError) {
          console.error("Database insert error:", dbError);
          setUploadQueue(prev => prev.map(f => 
            f.id === id ? { 
              ...f, 
              status: "error" as UploadStatus, 
              error: "Uploaded but failed to link. Click 'Fix Link' to retry.", 
              errorType: "database" as ErrorType,
              publicUrl,
              storagePath,
            } : f
          ));
          return;
        }

        const newMediaItem: MediaFile = {
          id: mediaData.id,
          file_url: publicUrl,
          file_type: mediaType,
          file_name: file.name,
          file_size: file.size,
          sort_order: media.length,
        };

        setMedia(prev => {
          const updated = [...prev, newMediaItem];
          onMediaChange?.(updated);
          return updated;
        });

        setUploadQueue(prev => prev.map(f => 
          f.id === id ? { ...f, status: "success" as UploadStatus, progress: 100, mediaId: mediaData.id } : f
        ));
      } else {
        const newMediaItem: MediaFile = {
          file_url: publicUrl,
          file_type: mediaType,
          file_name: file.name,
          file_size: file.size,
        };

        setMedia(prev => {
          const updated = [...prev, newMediaItem];
          onMediaChange?.(updated);
          return updated;
        });

        setUploadQueue(prev => prev.map(f => 
          f.id === id ? { ...f, status: "success" as UploadStatus, progress: 100, publicUrl } : f
        ));
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      const isAborted = error?.name === "AbortError";
      if (!isAborted) {
        const { message, type } = parseStorageError(error);
        setUploadQueue(prev => prev.map(f => 
          f.id === id ? { ...f, status: "error" as UploadStatus, error: message, errorType: type, progress: 0 } : f
        ));
      }
    } finally {
      abortControllers.current.delete(id);
    }
  };

  const retryUpload = async (uploadId: string) => {
    const uploadFile = uploadQueue.find(f => f.id === uploadId);
    if (!uploadFile) return;

    if (uploadFile.errorType === "database" && uploadFile.publicUrl && propertyId) {
      setUploadQueue(prev => prev.map(f => 
        f.id === uploadId ? { ...f, status: "linking" as UploadStatus, error: undefined, errorType: undefined } : f
      ));

      const isImage = uploadFile.file.type.startsWith("image/");
      const mediaType = isImage ? "image" : "video";

      const { data: mediaData, error: dbError } = await supabase
        .from("property_media")
        .insert({
          property_id: propertyId,
          file_url: uploadFile.publicUrl,
          file_type: mediaType,
          file_name: uploadFile.file.name,
          file_size: uploadFile.file.size,
          uploaded_by_id: profile?.id,
          sort_order: media.length,
        })
        .select()
        .single();

      if (dbError) {
        setUploadQueue(prev => prev.map(f => 
          f.id === uploadId ? { ...f, status: "error" as UploadStatus, error: "Still failed to link. Try again later.", errorType: "database" as ErrorType } : f
        ));
        return;
      }

      const newMediaItem: MediaFile = {
        id: mediaData.id,
        file_url: uploadFile.publicUrl,
        file_type: mediaType,
        file_name: uploadFile.file.name,
        file_size: uploadFile.file.size,
      };

      setMedia(prev => {
        const updated = [...prev, newMediaItem];
        onMediaChange?.(updated);
        return updated;
      });

      setUploadQueue(prev => prev.map(f => 
        f.id === uploadId ? { ...f, status: "success" as UploadStatus, progress: 100, mediaId: mediaData.id } : f
      ));
    } else {
      setUploadQueue(prev => prev.map(f => 
        f.id === uploadId ? { ...f, status: "pending" as UploadStatus, error: undefined, errorType: undefined, progress: 0 } : f
      ));
      await uploadSingleFile(uploadFile);
    }
  };

  const cancelUpload = (uploadId: string) => {
    const controller = abortControllers.current.get(uploadId);
    if (controller) {
      controller.abort();
    }
    setUploadQueue(prev => prev.filter(f => f.id !== uploadId));
  };

  const removeFromQueue = (uploadId: string) => {
    setUploadQueue(prev => prev.filter(f => f.id !== uploadId));
  };

  const handleFileSelect = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    const totalFiles = media.length + uploadQueue.filter(f => f.status !== "error").length + fileArray.length;
    if (totalFiles > MAX_FILES_PER_PROPERTY) {
      toast.error(`Maximum ${MAX_FILES_PER_PROPERTY} files per property`);
      return;
    }

    const newUploads: UploadFile[] = [];
    const validationErrors: string[] = [];

    for (const file of fileArray) {
      const validation = validateFile(file);
      if (!validation.valid) {
        validationErrors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      newUploads.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        file,
        status: "pending",
        progress: 0,
      });
    }

    if (validationErrors.length > 0) {
      validationErrors.forEach(err => toast.error(err));
    }

    if (newUploads.length === 0) return;

    setUploadQueue(prev => [...prev, ...newUploads]);

    for (const upload of newUploads) {
      await uploadSingleFile(upload);
    }
  }, [media.length, uploadQueue, propertyId, profile?.id, onMediaChange]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const removeMedia = async (index: number) => {
    const item = media[index];
    
    try {
      const urlParts = item.file_url.split("/property-media/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from("property-media").remove([filePath]);
      }

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = media.findIndex(item => (item.id || `item-${media.indexOf(item)}`) === active.id);
      const newIndex = media.findIndex(item => (item.id || `item-${media.indexOf(item)}`) === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newMedia = arrayMove(media, oldIndex, newIndex);
        setMedia(newMedia);
        onMediaChange?.(newMedia);
        
        // Update sort_order in database if we have propertyId
        if (propertyId) {
          const updates = newMedia.map((item, idx) => ({
            id: item.id,
            sort_order: idx,
          })).filter(item => item.id);
          
          for (const update of updates) {
            await supabase
              .from("property_media")
              .update({ sort_order: update.sort_order })
              .eq("id", update.id);
          }
        }
      }
    }
  };

  const activeUploads = uploadQueue.filter(f => f.status === "uploading" || f.status === "linking");
  const errorUploads = uploadQueue.filter(f => f.status === "error");
  const overallProgress = activeUploads.length > 0 
    ? activeUploads.reduce((sum, f) => sum + f.progress, 0) / activeUploads.length 
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Property Media (Images & Videos)</Label>
        {propertyId && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={fetchExistingMedia}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-1", isLoading && "animate-spin")} />
            Refresh
          </Button>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-8 border-2 border-dashed border-border rounded-lg">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading existing media...</span>
        </div>
      )}

      {/* Error loading media */}
      {loadError && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {loadError}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={fetchExistingMedia}
            className="ml-auto"
          >
            Retry
          </Button>
        </div>
      )}
      
      {/* Upload Zone */}
      {!isLoading && (
        <div 
          className={cn(
            "border-2 border-dashed rounded-lg p-4 transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-border",
            activeUploads.length > 0 && "pointer-events-none opacity-70"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(",")}
            multiple
            onChange={handleInputChange}
            className="hidden"
            id="media-upload"
            disabled={activeUploads.length > 0}
          />
          
          <label
            htmlFor="media-upload"
            className="flex flex-col items-center justify-center cursor-pointer py-4"
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground text-center">
              {isDragging ? "Drop files here" : "Click or drag to upload images/videos"}
            </span>
            <span className="text-xs text-muted-foreground mt-1 text-center">
              Images: JPG, PNG, WebP (max 50MB) | Videos: MP4, MOV, WebM (max 250MB)
            </span>
            <span className="text-xs text-muted-foreground">
              Max {MAX_FILES_PER_PROPERTY} files per property
            </span>
          </label>
        </div>
      )}

      {/* Overall Progress */}
      {activeUploads.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading {activeUploads.length} file{activeUploads.length > 1 ? "s" : ""}...
            </span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      )}

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <div className="space-y-2">
          {uploadQueue.map((upload) => (
            <div 
              key={upload.id} 
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border",
                upload.status === "error" && "border-destructive/50 bg-destructive/5",
                upload.status === "success" && "border-green-500/50 bg-green-500/5",
                (upload.status === "uploading" || upload.status === "linking" || upload.status === "pending") && "border-border bg-muted/30"
              )}
            >
              <div className="flex-shrink-0">
                {upload.file.type.startsWith("image/") ? (
                  <Image className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Video className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{upload.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(upload.file.size)}
                  {upload.status === "uploading" && ` • ${Math.round(upload.progress)}%`}
                  {upload.status === "linking" && " • Linking to property..."}
                  {upload.status === "success" && " • Complete"}
                </p>
                {upload.error && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    {getErrorIcon(upload.errorType)}
                    {upload.error}
                  </p>
                )}
              </div>

              {(upload.status === "uploading" || upload.status === "linking") && (
                <div className="w-20">
                  <Progress value={upload.progress} className="h-1.5" />
                </div>
              )}

              {upload.status === "success" && (
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              )}

              <div className="flex items-center gap-1 flex-shrink-0">
                {upload.status === "error" && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => retryUpload(upload.id)}
                      className="h-7 px-2 text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      {upload.errorType === "database" ? "Fix Link" : "Retry"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromQueue(upload.id)}
                      className="h-7 w-7"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {(upload.status === "uploading" || upload.status === "pending") && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => cancelUpload(upload.id)}
                    className="h-7 w-7"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                {upload.status === "success" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromQueue(upload.id)}
                    className="h-7 w-7"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Media Grid with Drag & Drop Reordering */}
      {media.length > 0 && !isLoading && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Drag items to reorder. First image will be the main/featured image.
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={media.map((item, index) => item.id || `item-${index}`)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {media.map((item, index) => (
                  <SortableMediaItem
                    key={item.id || `item-${index}`}
                    item={item}
                    index={index}
                    onRemove={removeMedia}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Error summary */}
      {errorUploads.length > 0 && (
        <div className="text-xs text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {errorUploads.length} file{errorUploads.length > 1 ? "s" : ""} failed to upload
        </div>
      )}
    </div>
  );
}
