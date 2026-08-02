import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { authApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const role = (searchParams.get('role') || 'student') as UserRole;
  const [loading, setLoading] = useState(false);
  const { setAuth, user } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : user.role === 'head_counsellor' ? '/head/dashboard' : '/student/home');
    }
  }, [user, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const res = await authApi.login({ ...data, role });
      setAuth(res.user, res.token);
      toast({ title: 'Welcome back', description: `Signed in as ${res.user.full_name}` });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Sign in failed',
        description: getErrorMessage(err, 'Invalid credentials'),
      });
    } finally {
      setLoading(false);
    }
  };

  const roleLabels: Record<UserRole, string> = {
    student: 'Student',
    head_counsellor: 'Head Counsellor',
    admin: 'Admin',
  };

  return (
    <div className="container-tight section-padding flex min-h-[calc(100vh-64px)] items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-playfair-display text-2xl">Sign in as {roleLabels[role]}</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to={`/forgot-password?role=${role}`}
                    className="text-xs font-medium text-accent hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            {role === 'student' && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register?role=student" className="font-medium text-accent hover:underline">
                  Register
                </Link>
              </p>
            )}
            {role === 'head_counsellor' && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Need an account?{' '}
                <Link to="/register?role=head_counsellor" className="font-medium text-accent hover:underline">
                  Apply
                </Link>
              </p>
            )}
            <p className="mt-2 text-center text-sm text-muted-foreground">
              <Link to="/role-select" className="hover:text-foreground">Change role</Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
