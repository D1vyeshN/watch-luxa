'use client';

import { useRef, useState } from 'react';
import { Camera, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { tokenStorage } from '@/lib/storage/tokenStorage';
import { CONFIG } from '@/constants/config';

const FRAME_STEP = 1 / 30;   // ≈ one frame at 30 fps
const MAX_POSTER_WIDTH = 1920;

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = (s % 60).toFixed(1).padStart(4, '0');
  return `${m}:${sec}`;
};

interface PosterFramePickerProps {
  videoUrl: string;
  onPick: (posterUrl: string) => void;
}

// Scrub the video, then capture the visible frame as the slide's poster.
// Needs the video host to send CORS headers (Supabase storage does);
// otherwise the browser refuses to export the frame.
export function PosterFramePicker({ videoUrl, onPick }: PosterFramePickerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Chrome fails a media load with ERR_CACHE_OPERATION_NOT_SUPPORTED when
  // other <video> elements (the previews) are fetching the same URL, so the
  // picker uses its own cache entry via an extra query param. If a host
  // rejects that, fall back to the plain URL, then give up.
  // Tracked per URL so pasting a different video starts over.
  const [attempt, setAttempt] = useState<{ url: string; n: number }>({ url: videoUrl, n: 0 });
  const tries = attempt.url === videoUrl ? attempt.n : 0;
  const loadFailed = tries >= 2;
  const src =
    tries === 0 ? `${videoUrl}${videoUrl.includes('?') ? '&' : '?'}frame-picker=1` : videoUrl;

  const seek = (t: number) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    // Stop just short of the end — seeking to exactly `duration` can show black
    const next = Math.min(Math.max(t, 0), Math.max(duration - 0.05, 0));
    setTime(next);
    setSeeking(true);
    video.currentTime = next;
  };

  const capture = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    setIsSaving(true);
    try {
      const scale = Math.min(1, MAX_POSTER_WIDTH / video.videoWidth);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height);

      let blob: Blob | null;
      try {
        blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
      } catch {
        // SecurityError: the video host doesn't allow cross-origin reads
        throw new Error("This video's host doesn't allow capturing frames — upload a poster image instead");
      }
      if (!blob) throw new Error('Could not capture the frame');

      const formData = new FormData();
      formData.append('file', new File([blob], 'video-poster.jpg', { type: 'image/jpeg' }));
      formData.append('folder', 'hero');
      formData.append('nameHint', 'video-poster');

      const token = tokenStorage.getAccess();
      const res = await fetch(`${CONFIG.apiUrl}/admin/uploads/single`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Upload failed');

      onPick(json.data.url);
      toast.success(`Poster set from ${formatTime(video.currentTime)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not set the poster');
    } finally {
      setIsSaving(false);
    }
  };

  if (loadFailed) {
    return (
      <p className="rounded-md border border-dashed border-border p-4 text-xs text-muted-foreground">
        Can&apos;t read frames from this video — its host doesn&apos;t allow it. Upload the video here
        instead of pasting a link, or upload a poster image.
      </p>
    );
  }

  return (
    <div className="space-y-3 rounded-md border border-border p-4">
      <div>
        <p className="text-sm font-medium">Poster from video</p>
        <p className="text-xs text-muted-foreground">
          Scrub to the frame you want, then use it as the poster.
        </p>
      </div>

      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-black">
        <video
          ref={videoRef}
          key={src}
          src={src}
          // Without CORS mode the canvas is "tainted" and can't be exported
          crossOrigin="anonymous"
          muted
          playsInline
          preload="auto"
          className="h-full w-full object-contain"
          onLoadedMetadata={(e) => {
            setDuration(e.currentTarget.duration || 0);
            setTime(0);
          }}
          onSeeked={() => setSeeking(false)}
          onError={() => setAttempt({ url: videoUrl, n: tries + 1 })}
        />
        {seeking && (
          <Loader2 className="absolute right-2 top-2 h-4 w-4 animate-spin text-white" aria-hidden />
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => seek(time - FRAME_STEP)}
          disabled={!duration}
          aria-label="Previous frame"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.01}
          value={time}
          onChange={(e) => seek(e.target.valueAsNumber)}
          disabled={!duration}
          className="h-6 w-full accent-primary"
          aria-label="Video position"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => seek(time + FRAME_STEP)}
          disabled={!duration}
          aria-label="Next frame"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
        <span className="shrink-0 whitespace-nowrap text-right text-xs tabular-nums text-muted-foreground">
          {formatTime(time)} / {formatTime(duration)}
        </span>
      </div>

      <Button
        type="button"
        size="sm"
        onClick={capture}
        disabled={!duration || seeking || isSaving}
      >
        {isSaving ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Camera className="mr-2 h-3.5 w-3.5" />}
        {isSaving ? 'Saving poster…' : 'Use this frame as poster'}
      </Button>
    </div>
  );
}
