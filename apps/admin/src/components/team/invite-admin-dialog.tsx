'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCustomMutation, useInvalidate } from '@refinedev/core';
import { toast } from 'sonner';
import { Loader2, UserPlus } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { inviteAdminSchema, type InviteAdminForm } from '@/lib/validation/team';

const EMPTY: InviteAdminForm = { name: '', email: '', password: '' };

export function InviteAdminDialog() {
  const [open, setOpen] = useState(false);
  const { mutate: createAdmin, mutation } = useCustomMutation();
  const invalidate = useInvalidate();
  const isPending = mutation.isPending;

  const form = useForm<InviteAdminForm>({
    resolver: zodResolver(inviteAdminSchema),
    defaultValues: EMPTY,
  });

  const { reset } = form;
  useEffect(() => {
    if (open) reset(EMPTY);
  }, [open, reset]);

  const onSubmit = (values: InviteAdminForm) => {
    createAdmin(
      {
        url: '/superadmin/admins',
        method: 'post',
        values,
        errorNotification: false,
      },
      {
        onSuccess: () => {
          toast.success(`${values.name} can now sign in to the admin`);
          setOpen(false);
          invalidate({ resource: 'team', invalidates: ['list'] });
        },
        onError: (err) => {
          // e.g. 409 "An account with this email already exists"
          if (err.statusCode === 409) {
            form.setError('email', { message: err.message });
          } else {
            toast.error(err.message || 'Failed to create admin');
          }
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !isPending && setOpen(o)}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Admin
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Admin</DialogTitle>
          <DialogDescription>
            Admins manage products, orders, customers, and content. They can&apos;t change
            settings, manage the team, or see audit logs.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input autoComplete="off" placeholder="Rahul Verma" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="off" placeholder="rahul@luxe.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temporary Password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormDescription>
                    8+ characters with upper and lower case letters and a number. Share it with
                    them securely.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Admin
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
