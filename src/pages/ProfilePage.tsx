import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { authApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  phone: z.string().optional(),
  student_id: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const { user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      student_id: user?.student_id || '',
      password: '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      const body: { full_name: string; phone?: string; student_id?: string; password?: string } = {
        full_name: data.full_name,
      };
      if (user?.role === 'student') {
        body.student_id = data.student_id;
      }
      body.phone = data.phone;
      if (data.password) {
        body.password = data.password;
      }
      const res = await authApi.updateProfile(body);
      setAuth(res.user, useAuthStore.getState().token || '');
      toast({ title: 'Profile updated', description: 'Your profile has been updated successfully.' });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: getErrorMessage(err, 'Something went wrong.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const initials = (user?.full_name || 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="container-tight section-padding flex min-h-[calc(100vh-64px)] items-center justify-center py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mb-3 flex justify-center">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl font-semibold">{initials}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="font-playfair-display text-2xl">My Profile</CardTitle>
            <CardDescription>Manage your personal details and password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={
                    user?.role === 'student'
                      ? 'Student'
                      : user?.role === 'head_counsellor'
                        ? 'Head Counsellor'
                        : 'Admin'
                  }
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input placeholder="Jane Doe" {...register('full_name')} />
                {(errors as any).full_name && <p className="text-sm text-destructive">{(errors as any).full_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="9876543210" {...register('phone')} />
              </div>
              {user?.role === 'student' && (
                <div className="space-y-2">
                  <Label>Student ID</Label>
                  <Input placeholder="CS21B001" {...register('student_id')} />
                </div>
              )}
              <div className="space-y-2">
                <Label>New password (optional)</Label>
                <Input type="password" placeholder="Leave blank to keep current password" {...register('password')} />
                {(errors as any).password && <p className="text-sm text-destructive">{(errors as any).password.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
