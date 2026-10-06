'use client';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import type { UseFormReturn } from 'react-hook-form';
import type { ProductFormValues } from '@/types/product-form';
import { toNumber } from './utils';

interface SpecsTabProps {
  form: UseFormReturn<ProductFormValues>;
}

export function SpecsTab({ form }: SpecsTabProps) {
  return (
    <div className="space-y-6">
      {/* ─── Identification ─── */}
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="specs.referenceNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference Number</FormLabel>
              <FormControl>
                <Input placeholder="126610LN" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specs.warranty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Warranty</FormLabel>
              <FormControl>
                <Input placeholder="5 years international" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ─── Movement ─── */}
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="specs.movementType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Movement Type</FormLabel>
              <FormControl>
                <Input placeholder="Automatic" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specs.movementCaliber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Movement Caliber</FormLabel>
              <FormControl>
                <Input placeholder="Cal. 3235" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specs.powerReserve"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Power Reserve (hours)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="70"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(toNumber(e))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specs.jewels"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jewels</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="31"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(toNumber(e))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ─── Case ─── */}
      <div className="grid gap-6 md:grid-cols-3">
        <FormField
          control={form.control}
          name="specs.caseDiameter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Case Diameter (mm)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="41"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(toNumber(e))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specs.caseThickness"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Case Thickness (mm)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="12.4"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(toNumber(e))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specs.lugWidth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lug Width (mm)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="21"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(toNumber(e))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="specs.caseMaterial"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Case Material</FormLabel>
              <FormControl>
                <Input placeholder="Oystersteel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specs.bezelMaterial"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bezel Material</FormLabel>
              <FormControl>
                <Input placeholder="Ceramic" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ─── Crystal + Water ─── */}
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="specs.crystalType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Crystal Type</FormLabel>
              <FormControl>
                <Input placeholder="Sapphire" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specs.waterResistance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Water Resistance (m)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="300"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(toNumber(e))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ─── Dial details ─── */}
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="specs.indices"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Indices</FormLabel>
              <FormControl>
                <Input placeholder="Baton" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specs.hands"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hands</FormLabel>
              <FormControl>
                <Input placeholder="Mercedes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ─── Box & Papers ─── */}
      <FormField
        control={form.control}
        name="specs.boxAndPapers"
        render={({ field }) => (
          <FormItem className="flex items-center gap-3 rounded-md border border-border p-4">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel className="!mt-0 cursor-pointer">
              Box & papers included
            </FormLabel>
          </FormItem>
        )}
      />
    </div>
  );
}
