'use client';

import { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { tokenStorage } from '@/lib/storage/tokenStorage';
import { CONFIG } from '@/constants/config';

const MAX_VIDEO_MB = 50;

interface VideoUploaderProps {
  value: string;
  onChange: (url: string) => void;
  poster?: string;
}

// Upload an MP4/WebM to the hero folder, or paste a direct video URL.
export function VideoUploader({ value, onChange, poster }: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      toast.error(`Video too large (max ${MAX_VIDEO_MB} MB) — compress it or paste a URL instead`);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('nameHint', file.name.replace(/\.[^.]+$/, ''));

      const token = tokenStorage.getAccess();
      const res = await fetch(`${CONFIG.apiUrl}/admin/uploads/video`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Upload failed');

      onChange(json.data.url);
      toast.success('Video uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium uppercase tracking-[0.14em] text-foreground">
        Background Video
      </label>

      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md border border-dashed border-border bg-muted/30">
        {value ? (
          <>
            {/* Clicking the preview picks a replacement — no need to remove first */}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="group absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Replace video"
            >
              <video
                key={value}
                src={value}
                poster={poster || undefined}
                className="h-full w-full object-cover"
                muted
                loop
                autoPlay
                playsInline
              />
              <span
                className={`absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 text-white transition-opacity ${
                  isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-xs">Uploading…</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span className="text-xs">Click to replace</span>
                  </>
                )}
              </span>
            </button>
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute right-2 top-2 h-7 w-7"
              onClick={() => onChange('')}
              aria-label="Remove video"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground transition-colors hover:bg-muted/50"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-xs">Uploading…</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <span className="text-xs">Click to upload</span>
                <span className="text-[10px]">MP4 or WebM (max {MAX_VIDEO_MB} MB)</span>
              </>
            )}
          </button>
        )}
      </div>

      <Input
        type="url"
        placeholder="…or paste a direct .mp4 / .webm URL"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Video URL"
      />

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
    </div>
  );
}
