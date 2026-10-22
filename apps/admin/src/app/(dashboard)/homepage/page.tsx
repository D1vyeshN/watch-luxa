'use client';

import { HeroForm } from '@/components/homepage/hero-form';
import { SectionsEditor } from '@/components/homepage/sections/sections-editor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function HomepagePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Content
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Homepage</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The hero at the top of the storefront, then the sections below it. Each tab saves separately.
        </p>
      </div>

      <Tabs defaultValue="hero">
        <TabsList>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
        </TabsList>
        <TabsContent value="hero" className="mt-6">
          <HeroForm />
        </TabsContent>
        <TabsContent value="sections" className="mt-6">
          <SectionsEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
