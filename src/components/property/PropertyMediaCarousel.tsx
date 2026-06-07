import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MediaItem {
  file_url: string;
  file_type: string;
  file_name?: string;
  sort_order?: number | null;
}

interface PropertyMediaCarouselProps {
  media: MediaItem[];
  propertyTitle: string;
  className?: string;
}

export function PropertyMediaCarousel({ media, propertyTitle, className }: PropertyMediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sort media by sort_order, then by type (images first)
  const sortedMedia = [...media].sort((a, b) => {
    const orderA = a.sort_order ?? 999;
    const orderB = b.sort_order ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    // Images before videos
    if (a.file_type === "image" && b.file_type === "video") return -1;
    if (a.file_type === "video" && b.file_type === "image") return 1;
    return 0;
  });

  if (sortedMedia.length === 0) {
    return (
      <div className={cn("relative aspect-[4/3] bg-muted rounded-sm flex items-center justify-center", className)}>
        <p className="text-muted-foreground">No media available</p>
      </div>
    );
  }

  const currentItem = sortedMedia[currentIndex];
  const isVideo = currentItem.file_type === "video";

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? sortedMedia.length - 1 : prev - 1));
    setIsPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === sortedMedia.length - 1 ? 0 : prev + 1));
    setIsPlaying(false);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) {
      v.pause();
      setIsPlaying(false);
    } else {
      const p = v.play();
      if (p && typeof p.then === "function") {
        p.then(() => setIsPlaying(true)).catch((err) => {
          console.error("Video play failed:", err);
          setIsPlaying(false);
        });
      } else {
        setIsPlaying(true);
      }
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  const CarouselContent = ({ fullscreen = false }) => (
    <div className={cn(
      "relative bg-black",
      fullscreen ? "w-full h-full flex items-center justify-center" : "aspect-[4/3] rounded-sm overflow-hidden"
    )}>
      {/* Main media display */}
      {isVideo ? (
        <video
          ref={videoRef}
          src={currentItem.file_url}
          className={cn(
            "object-contain",
            fullscreen ? "max-w-full max-h-full" : "w-full h-full object-cover"
          )}
          playsInline
          controls
          preload="metadata"
          onEnded={handleVideoEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      ) : (
        <img
          src={currentItem.file_url}
          alt={`${propertyTitle} - Image ${currentIndex + 1}`}
          className={cn(
            "object-contain",
            fullscreen ? "max-w-full max-h-full" : "w-full h-full object-cover"
          )}
          loading={currentIndex === 0 ? "eager" : "lazy"}
        />
      )}

      {/* Video play overlay */}
      {isVideo && !isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
          aria-label="Play video"
        >
          <div className="w-16 h-16 rounded-full bg-gold flex items-center justify-center shadow-lg">
            <Play className="w-6 h-6 text-navy ml-1" fill="currentColor" />
          </div>
        </button>
      )}

      {/* Video controls */}
      {isVideo && isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute bottom-4 left-4 p-2 rounded-full bg-black/70 hover:bg-black/90 transition-colors"
          aria-label="Pause video"
        >
          <Pause className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Navigation arrows */}
      {sortedMedia.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      {/* Fullscreen toggle */}
      {!fullscreen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full"
          aria-label="View fullscreen"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      )}

      {/* Indicator dots */}
      {sortedMedia.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {sortedMedia.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsPlaying(false);
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex 
                  ? "bg-white w-4" 
                  : "bg-white/50 hover:bg-white/70"
              )}
              aria-label={`Go to ${item.file_type === "video" ? "video" : "image"} ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Media counter */}
      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
        {currentIndex + 1} / {sortedMedia.length}
        {isVideo && " • Video"}
      </div>
    </div>
  );

  return (
    <>
      <div className={className}>
        <CarouselContent />
      </div>

      {/* Thumbnails */}
      {sortedMedia.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {sortedMedia.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsPlaying(false);
              }}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all relative",
                index === currentIndex 
                  ? "border-gold" 
                  : "border-transparent hover:border-gold/50"
              )}
            >
              {item.file_type === "video" ? (
                <>
                  <video
                    src={item.file_url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                </>
              ) : (
                <img
                  src={item.file_url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen modal */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) toggleFullscreen();
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full z-10"
            aria-label="Close fullscreen"
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="w-full h-full p-4 flex items-center justify-center">
            <CarouselContent fullscreen />
          </div>
        </div>
      )}
    </>
  );
}