'use client';

import { useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm, useWatch, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCustom, useCustomMutation } from '@refinedev/core';
import { Loader2, Monitor, Plus, Save, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { keepValue } from '@/components/products/product-form/utils';
import { inputValue, requiredNumber } from '@/lib/form/number-input';
import { formatDateTime } from '@/lib/format/currency';
import { cn } from '@/lib/utils';
import {
  heroSchema,
  type HeroFormSchema,
  type HeroSlideFormSchema,
} from '@/lib/validation/homepage';
import {
  DEFAULT_FRAME,
  HERO_MAX_SLIDES,
  type HeroConfig,
  type HeroCta,
  type HeroSlide,
  type HomepageContent,
} from '@/types/homepage';
import { HeroPreview } from './hero-preview';
import { SlideCard } from './slide-card';

// ─── API ↔ form (flat CTA fields, '' for empty text, seconds) ───
const slideToForm = (s: HeroSlide): HeroSlideFormSchema => ({
  _id: s._id,
  isActive: s.isActive,
  mediaType: s.mediaType,
  imageUrl: s.imageUrl ?? '',
  mobileImageUrl: s.mobileImageUrl ?? '',
  imageFrame: s.imageFrame ?? { ...DEFAULT_FRAME },
  mobileImageFrame: s.mobileImageFrame ?? { ...DEFAULT_FRAME },
  videoUrl: s.videoUrl ?? '',
  tagline: s.tagline ?? '',
  headline: s.headline,
  subtext: s.subtext ?? '',
  primaryLabel: s.primaryCta?.label ?? '',
  primaryHref: s.primaryCta?.href ?? '',
  secondaryLabel: s.secondaryCta?.label ?? '',
  secondaryHref: s.secondaryCta?.href ?? '',
  textAlign: s.textAlign,
  overlayOpacity: s.overlayOpacity,
});

const toFormValues = (h: HeroConfig): HeroFormSchema => ({
  carouselEnabled: h.carouselEnabled,
  autoplay: h.autoplay,
  intervalSeconds: h.intervalMs / 1000,
  showArrows: h.showArrows,
  showDots: h.showDots,
  height: h.height,
  slides: h.slides.map(slideToForm),
});

const opt = (v: string) => v.trim() || undefined;
const cta = (label: string, href: string): HeroCta | undefined =>
  label.trim() && href.trim() ? { label: label.trim(), href: href.trim() } : undefined;

const toPayload = (v: HeroFormSchema) => ({
  carouselEnabled: v.carouselEnabled,
  autoplay: v.autoplay,
  intervalMs: Math.round(v.intervalSeconds * 1000),
  showArrows: v.showArrows,
  showDots: v.showDots,
  height: v.height,
  slides: v.slides.map((s) => ({
    ...(s._id ? { _id: s._id } : {}),
    isActive: s.isActive,
    mediaType: s.mediaType,
    imageUrl: s.imageUrl.trim(),
    mobileImageUrl: opt(s.mobileImageUrl),
    imageFrame: s.imageFrame,
    mobileImageFrame: s.mobileImageFrame,
    // A video URL left on an image slide would be stored but never shown
    videoUrl: s.mediaType === 'video' ? opt(s.videoUrl) : undefined,
    tagline: opt(s.tagline),
    headline: s.headline.trim(),
    subtext: opt(s.subtext),
    primaryCta: cta(s.primaryLabel, s.primaryHref),
    secondaryCta: cta(s.secondaryLabel, s.secondaryHref),
    textAlign: s.textAlign,
    overlayOpacity: s.overlayOpacity,
  })),
});

const NEW_SLIDE: HeroSlideFormSchema = {
  isActive: true,
  mediaType: 'image',
  imageUrl: '',
  mobileImageUrl: '',
  imageFrame: { ...DEFAULT_FRAME },
  mobileImageFrame: { ...DEFAULT_FRAME },
  videoUrl: '',
  tagline: '',
  headline: '',
  subtext: '',
  primaryLabel: '',
  primaryHref: '',
  secondaryLabel: '',
  secondaryHref: '',
  textAlign: 'left',
  overlayOpacity: 75,
};

const EMPTY: HeroFormSchema = {
  carouselEnabled: false,
  autoplay: true,
  intervalSeconds: 6,
  showArrows: true,
  showDots: true,
  height: 'full',
  slides: [],
};

const DISPLAY_FLAGS = [
  { name: 'autoplay', label: 'Autoplay' },
  { name: 'showArrows', label: 'Show arrows' },
  { name: 'showDots', label: 'Show dots' },
] as const;

export function HeroForm() {
  const { query } = useCustom<HomepageContent>({
    url: '/admin/homepage',
    method: 'get',
    queryOptions: { refetchOnWindowFocus: false },
  });
  const homepage = query.data?.data;

  const { mutate: saveHero, mutation } = useCustomMutation<HomepageContent>();
  const isSaving = mutation.isPending;

  const form = useForm<HeroFormSchema>({
    resolver: zodResolver(heroSchema),
    defaultValues: EMPTY,
  });
  const { fields, append, insert, remove, move } = useFieldArray({ control: form.control, name: 'slides' });

  // Field-array keys (not indices) so open state follows a slide when it moves
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());
  // Reloading after a save gives every slide a new field key; remember which
  // positions were open so the slide being edited doesn't snap shut
  const reopenAfterReload = useRef<number[] | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewMobile, setPreviewMobile] = useState(false);

  const { reset } = form;
  useEffect(() => {
    if (homepage) reset(toFormValues(homepage.hero));
  }, [homepage, reset]);

  useEffect(() => {
    const indices = reopenAfterReload.current;
    if (!indices) return;
    reopenAfterReload.current = null;
    setOpenKeys(new Set(indices.map((i) => fields[i]?.id).filter((id): id is string => !!id)));
  }, [fields]);

  // useWatch (not form.watch) so the React Compiler can still optimise this component
  const carouselEnabled = useWatch({ control: form.control, name: 'carouselEnabled' });
  const safePreviewIndex = Math.min(previewIndex, Math.max(fields.length - 1, 0));
  const previewSlide = useWatch({ control: form.control, name: `slides.${safePreviewIndex}` });

  const setOpen = (key: string, open: boolean) =>
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (open) next.add(key);
      else next.delete(key);
      return next;
    });

  const addSlide = () => {
    append({ ...NEW_SLIDE });
    setPreviewIndex(fields.length);
  };

  const duplicateSlide = (index: number) => {
    const { _id: _omit, ...copy } = form.getValues(`slides.${index}`);
    insert(index + 1, copy);
    setPreviewIndex(index + 1);
  };

  const onSubmit = (values: HeroFormSchema) => {
    saveHero(
      {
        url: '/admin/homepage/hero',
        method: 'put',
        values: toPayload(values),
        errorNotification: false,
      },
      {
        onSuccess: () => {
          reopenAfterReload.current = fields.flatMap((f, i) => (openKeys.has(f.id) ? [i] : []));
          toast.success('Hero saved — the storefront updates shortly');
          query.refetch();
        },
        onError: (err) => toast.error(err.message || 'Failed to save hero'),
      }
    );
  };

  // Open every slide with an error so the messages are visible
  const onInvalid = (errors: FieldErrors<HeroFormSchema>) => {
    const slideErrors = Array.isArray(errors.slides) ? errors.slides : [];
    const failing = fields.filter((_, i) => slideErrors[i]).map((f) => f.id);
    if (failing.length) setOpenKeys((prev) => new Set([...prev, ...failing]));
    toast.error('Fix the highlighted fields before saving');
  };

  if (query.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (query.isError || !homepage) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Failed to load homepage content. Is the backend running?
      </div>
    );
  }

  const slidesError = form.formState.errors.slides?.root?.message ?? form.formState.errors.slides?.message;

  return (
    <Form {...form}>
      {/* handleSubmit runs inside the event, so onSubmit's ref writes happen on submit, not during render */}
      <form noValidate onSubmit={(e) => form.handleSubmit(onSubmit, onInvalid)(e)} className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-6">
            {/* ─── Display ─── */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Display</CardTitle>
                <CardDescription>
                  With the carousel off, only the first active slide is shown.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="carouselEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 rounded-md border border-border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />
                      </FormControl>
                      <FormLabel className="!mt-0 cursor-pointer">Carousel — rotate through all active slides</FormLabel>
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-3">
                  {DISPLAY_FLAGS.map(({ name, label }) => (
                    <FormField
                      key={name}
                      control={form.control}
                      name={name}
                      render={({ field }) => (
                        <FormItem
                          className={cn(
                            'flex items-center gap-3 rounded-md border border-border p-4',
                            !carouselEnabled && 'opacity-50'
                          )}
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(c) => field.onChange(c === true)}
                              disabled={!carouselEnabled}
                            />
                          </FormControl>
                          <FormLabel className="!mt-0 cursor-pointer">{label}</FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="intervalSeconds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slide Duration (seconds)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={3}
                            max={15}
                            step={0.5}
                            disabled={!carouselEnabled}
                            {...field}
                            value={inputValue(field.value)}
                            onChange={(e) => field.onChange(requiredNumber(e))}
                          />
                        </FormControl>
                        <FormDescription>3–15 s. Pauses while a visitor hovers or focuses the hero.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hero Height</FormLabel>
                        <Select onValueChange={keepValue(field.onChange)} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="full">Full screen (100%)</SelectItem>
                            <SelectItem value="large">Large (72%)</SelectItem>
                            <SelectItem value="medium">Medium (60%)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* ─── Slides ─── */}
            <div className="space-y-3">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold">
                    Slides ({fields.length}/{HERO_MAX_SLIDES})
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {carouselEnabled
                      ? 'Active slides rotate in this order.'
                      : 'Carousel is off — only the first active slide is shown.'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSlide}
                  disabled={fields.length >= HERO_MAX_SLIDES}
                >
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  Add Slide
                </Button>
              </div>

              {slidesError && <p className="text-sm text-destructive">{slidesError}</p>}

              {fields.map((field, index) => (
                <SlideCard
                  key={field.id}
                  form={form}
                  index={index}
                  count={fields.length}
                  open={openKeys.has(field.id)}
                  onOpenChange={(open) => {
                    setOpen(field.id, open);
                    if (open) setPreviewIndex(index);
                  }}
                  onMove={(to) => {
                    move(index, to);
                    if (safePreviewIndex === index) setPreviewIndex(to);
                  }}
                  onDuplicate={fields.length < HERO_MAX_SLIDES ? () => duplicateSlide(index) : undefined}
                  onRemove={fields.length > 1 ? () => remove(index) : undefined}
                />
              ))}
            </div>
          </div>

          {/* ─── Preview ─── */}
          {previewSlide && (
            <div className="xl:sticky xl:top-20 xl:self-start">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                  <div className="min-w-0">
                    <CardTitle className="text-base">Preview</CardTitle>
                    <CardDescription className="truncate">
                      Slide {safePreviewIndex + 1}
                      {!previewSlide.isActive && ' (hidden)'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {fields.length > 1 && (
                      <Select
                        value={String(safePreviewIndex)}
                        onValueChange={(v) => setPreviewIndex(Number(v))}
                      >
                        <SelectTrigger className="h-8 w-[90px]" aria-label="Slide to preview">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fields.map((f, i) => (
                            <SelectItem key={f.id} value={String(i)}>
                              Slide {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPreviewMobile((m) => !m)}
                      aria-label={previewMobile ? 'Preview desktop layout' : 'Preview mobile layout'}
                      aria-pressed={previewMobile}
                    >
                      {previewMobile ? <Monitor className="h-3.5 w-3.5" /> : <Smartphone className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <HeroPreview slide={previewSlide} mobile={previewMobile} />
                  <p className="mt-3 text-xs text-muted-foreground">
                    Approximate — fonts and proportions differ slightly from the storefront.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* ─── Submit ─── */}
        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-background/95 py-4 backdrop-blur">
          <p className="text-xs text-muted-foreground">Last saved {formatDateTime(homepage.updatedAt)}</p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset(toFormValues(homepage.hero))}
              disabled={isSaving || !form.formState.isDirty}
            >
              Discard changes
            </Button>
            <Button type="submit" disabled={isSaving || !form.formState.isDirty}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Hero
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
