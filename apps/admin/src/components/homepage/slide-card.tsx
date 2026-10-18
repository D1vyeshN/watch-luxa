'use client';

import { ArrowDown, ArrowUp, ChevronDown, Copy, Image as ImageIcon, Trash2, Video } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploader } from '@/components/products/image-uploader';
import { keepValue } from '@/components/products/product-form/utils';
import { cn } from '@/lib/utils';
import type { HeroFormSchema } from '@/lib/validation/homepage';
import { VideoUploader } from './video-uploader';
import { ImageFramer } from './image-framer';
import { PosterFramePicker } from './poster-frame-picker';
import { DEFAULT_FRAME } from '@/types/homepage';

interface SlideCardProps {
  form: UseFormReturn<HeroFormSchema>;
  index: number;
  count: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMove: (to: number) => void;
  onDuplicate?: () => void; // undefined when the slide limit is reached
  onRemove?: () => void;    // undefined for the last remaining slide
}

export function SlideCard({
  form,
  index,
  count,
  open,
  onOpenChange,
  onMove,
  onDuplicate,
  onRemove,
}: SlideCardProps) {
  const name = `slides.${index}` as const;
  const [mediaType, headline, isActive, imageUrl, mobileImageUrl, videoUrl] = form.watch([
    `${name}.mediaType`,
    `${name}.headline`,
    `${name}.isActive`,
    `${name}.imageUrl`,
    `${name}.mobileImageUrl`,
    `${name}.videoUrl`,
  ]);

  // A different picture needs its own framing — start it centred
  const resetFrame = (key: 'imageFrame' | 'mobileImageFrame') =>
    form.setValue(`${name}.${key}`, { ...DEFAULT_FRAME }, { shouldDirty: true });

  // Desktop / poster image changed — by upload or by picking a video frame
  const setMainImage = (url: string) => {
    form.setValue(`${name}.imageUrl`, url, { shouldDirty: true, shouldValidate: true });
    resetFrame('imageFrame');
    // Phones fall back to this image when there's no mobile one
    if (!form.getValues(`${name}.mobileImageUrl`)) resetFrame('mobileImageFrame');
  };
  const hasErrors = !!form.formState.errors.slides?.[index];
  const MediaIcon = mediaType === 'video' ? Video : ImageIcon;

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <Card className={cn(hasErrors && 'border-destructive/60', !isActive && 'opacity-70')}>
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-4">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="relative flex h-10 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- tiny admin thumbnail, any host
                  <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <MediaIcon className="h-4 w-4 text-muted-foreground" aria-hidden />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {index + 1}. {headline || 'Untitled slide'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {mediaType === 'video' ? 'Video' : 'Image'}
                  {!isActive && ' · Hidden'}
                  {hasErrors && <span className="text-destructive"> · Needs attention</span>}
                </p>
              </div>
              <ChevronDown
                className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
                aria-hidden
              />
            </button>
          </CollapsibleTrigger>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onMove(index - 1)}
              disabled={index === 0}
              aria-label={`Move slide ${index + 1} up`}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onMove(index + 1)}
              disabled={index === count - 1}
              aria-label={`Move slide ${index + 1} down`}
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onDuplicate}
              disabled={!onDuplicate}
              aria-label={`Duplicate slide ${index + 1}`}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={onRemove}
              disabled={!onRemove}
              aria-label={`Delete slide ${index + 1}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-6 border-t border-border p-4 pt-6">
            {/* ─── Visibility + media type ─── */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name={`${name}.isActive`}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 rounded-md border border-border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />
                    </FormControl>
                    <FormLabel className="!mt-0 cursor-pointer">Active — show on the storefront</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`${name}.mediaType`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background</FormLabel>
                    <Select onValueChange={keepValue(field.onChange)} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ─── Media ─── */}
            <div className="grid gap-4 md:grid-cols-2">
              {mediaType === 'video' && (
                <FormField
                  control={form.control}
                  name={`${name}.videoUrl`}
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormControl>
                        <VideoUploader value={field.value} onChange={field.onChange} poster={imageUrl} />
                      </FormControl>
                      <FormDescription>
                        Plays muted and looped. Keep it short (10–30 s) and compressed for fast loading.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {mediaType === 'video' && /^https?:\/\/\S+$/i.test(videoUrl) && (
                <div className="md:col-span-2">
                  <PosterFramePicker videoUrl={videoUrl} onPick={setMainImage} />
                </div>
              )}
              <FormField
                control={form.control}
                name={`${name}.imageUrl`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUploader
                        value={field.value}
                        onChange={setMainImage}
                        folder="hero"
                        label={mediaType === 'video' ? 'Poster Image' : 'Desktop Image'}
                        aspect="wide"
                      />
                    </FormControl>
                    <FormDescription>
                      {mediaType === 'video'
                        ? 'Shown while the video loads and for visitors who prefer reduced motion.'
                        : 'Landscape, at least 1920 px wide.'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`${name}.mobileImageUrl`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUploader
                        value={field.value}
                        onChange={(url) => {
                          field.onChange(url);
                          resetFrame('mobileImageFrame');
                        }}
                        folder="hero"
                        label="Mobile Image (optional)"
                        aspect="wide"
                      />
                    </FormControl>
                    <FormDescription>Portrait crop for phones. Falls back to the desktop image.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ─── Framing ─── */}
            {imageUrl && (
              <div className="space-y-3 rounded-md border border-border p-4">
                <div>
                  <p className="text-sm font-medium">Framing</p>
                  <p className="text-xs text-muted-foreground">
                    Choose which part of the image the hero shows. The original file is kept, so you can
                    change this any time.
                    {mediaType === 'video' && ' Applies to the poster image; the video fills the frame centred.'}
                  </p>
                </div>
                <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_200px]">
                  <FormField
                    control={form.control}
                    name={`${name}.imageFrame`}
                    render={({ field }) => (
                      <FormItem>
                        <ImageFramer
                          src={imageUrl}
                          value={field.value}
                          onChange={field.onChange}
                          variant="desktop"
                          label="Desktop"
                        />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`${name}.mobileImageFrame`}
                    render={({ field }) => (
                      <FormItem>
                        <ImageFramer
                          src={mobileImageUrl || imageUrl}
                          value={field.value}
                          onChange={field.onChange}
                          variant="mobile"
                          label="Mobile"
                        />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* ─── Text ─── */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name={`${name}.tagline`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tagline (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="LUXE Timepieces" maxLength={60} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`${name}.headline`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headline</FormLabel>
                    <FormControl>
                      <Input placeholder="Time, Refined." maxLength={120} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`${name}.subtext`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtext (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        maxLength={300}
                        placeholder="Precision crafted for those who appreciate the extraordinary."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ─── Buttons ─── */}
            {(['primary', 'secondary'] as const).map((key) => (
              <div key={key} className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name={`${name}.${key}Label`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{key === 'primary' ? 'Primary' : 'Secondary'} Button Label (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={key === 'primary' ? 'Explore Watches' : 'Discover Our Story'}
                          maxLength={40}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`${name}.${key}Href`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{key === 'primary' ? 'Primary' : 'Secondary'} Button Link</FormLabel>
                      <FormControl>
                        <Input placeholder={key === 'primary' ? '/shop' : '/about'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}

            {/* ─── Layout ─── */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name={`${name}.textAlign`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text Alignment</FormLabel>
                    <Select onValueChange={keepValue(field.onChange)} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`${name}.overlayOpacity`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overlay Darkness — {field.value}%</FormLabel>
                    <FormControl>
                      <input
                        type="range"
                        min={0}
                        max={90}
                        step={5}
                        className="h-9 w-full accent-primary"
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormDescription>Darker keeps text readable on busy images.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
