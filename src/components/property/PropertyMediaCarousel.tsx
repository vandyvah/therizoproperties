import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, Maximize2, X, Video as VideoIcon, AlertCircle } from "lucide-react";
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sort media by sort_order, then images before videos
  const sortedMedia = [...media].sort((a, b) => {
    const orderA = a.sort_order ?? 999;
    const orderB = b.sort_order ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    if (a.file_type === "image" && b.file_type === "video") return -1;
    if (a.file_type === "video" && b.file_type === "image") return 1;
    return 0;
  });

  // Reset per-slide state when slide changes
  useEffect(() => {
    setHasStarted(false);
    setVideoError(false);
  }, [currentIndex]);

  // Lock body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isFullscreen]);

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
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === sortedMedia.length - 1 ? 0 : prev + 1));
  };

  const startPlayback = () => {
    setHasStarted(true);
    // Attempt playback on next tick after <video> mounts with src
    requestAnimationFrame(() => {
      const v = videoRef.current;
      if (!v) return;
      const p = v.play();
      if (p && typeof p.then === "function") {
        p.catch((err) => {
          // Autoplay blocked — native controls will still let user press play
          console.warn("Video autoplay blocked:", err?.message || err);
        });
      }
    });
  };

  const toggleFullscreen = () => setIsFullscreen((f) => !f);

  const renderMedia = (fullscreen: boolean) => {
    const mediaClasses = fullscreen
      ? "max-w-full max-h-full object-contain"
      : "w-full h-full object-cover";

    if (isVideo) {
      if (videoError) {
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-navy/90 text-ivory p-6 text-center gap-2">
            <AlertCircle className="w-8 h-8 text-gold" />
            <p className="text-sm">This video could not be played in your browser.</p>
            <a
              href={currentItem.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold underline text-sm"
            >
              Open video in new tab
            </a>
          </div>
        );
      }

      if (!hasStarted && !fullscreen) {
        // Poster/placeholder before first play — keeps page fast
        return (
          <button
            type="button"
            onClick={startPlayback}
            className="group absolute inset-0 flex items-center justify-center bg-gradient-to-br from-navy via-navy/90 to-navy/70"
            aria-label={`Play video for ${propertyTitle}`}
          >
            <div className="w-16 h-16 rounded-full bg-gold flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
              <Play className="w-6 h-6 text-navy ml-1" fill="currentColor" />
            </div>
            <span className="absolute bottom-6 text-ivory/80 text-xs uppercase tracking-widest flex items-center gap-2">
              <VideoIcon className="w-3.5 h-3.5" /> Property Video
            </span>
          </button>
        );
      }

      return (
        <video
          ref={videoRef}
          key={currentItem.file_url + (fullscreen ? "-fs" : "")}
          src={currentItem.file_url}
          className={mediaClasses}
          playsInline
          controls
          controlsList="nodownload"
          preload="metadata"
          autoPlay={hasStarted}
          onError={() => setVideoError(true)}
        />
      );
    }

    return (
      <img
        src={currentItem.file_url}
        alt={`${propertyTitle} - Image ${currentIndex + 1}`}
        className={mediaClasses}
        loading={currentIndex === 0 ? "eager" : "lazy"}
      />
    );
  };

  const CarouselContent = ({ fullscreen = false }: { fullscreen?: boolean }) => (
    <div
      className={cn(
        "relative bg-black",
        fullscreen ? "w-full h-full flex items-center justify-center" : "aspect-[4/3] rounded-sm overflow-hidden"
      )}
    >
      {renderMedia(fullscreen)}

      {/* Navigation arrows */}
      {sortedMedia.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full z-10"
            aria-label="Previous media"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full z-10"
            aria-label="Next media"
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
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full z-10"
          aria-label="View fullscreen"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      )}

      {/* Media counter */}
      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">
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
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all relative",
                index === currentIndex ? "border-gold" : "border-transparent hover:border-gold/50"
              )}
              aria-label={`Go to ${item.file_type === "video" ? "video" : "image"} ${index + 1}`}
            >
              {item.file_type === "video" ? (
                <div className="w-full h-full flex items-center justify-center bg-navy">
                  <Play className="w-5 h-5 text-gold" fill="currentColor" />
                </div>
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
          role="dialog"
          aria-modal="true"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full z-20"
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
