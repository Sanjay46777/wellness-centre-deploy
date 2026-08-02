import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { authApi, getErrorMessage } from '@/lib/api';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const studentSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Full name is required'),
  student_id: z.string().min(1, 'Student ID is required'),
  phone: z.string().optional(),
});

const headSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Full name is required'),
  phone: z.string().optional(),
});

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const role = (searchParams.get('role') || 'student') as UserRole;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const schema = role === 'student' ? studentSchema : headSchema;
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema) as any,
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res =
        role === 'student'
          ? await authApi.registerStudent(data)
          : await authApi.registerHead(data);
      toast({ title: 'Success', description: res.message });
      navigate('/login?role=' + role);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: getErrorMessage(err, 'Something went wrong'),
      });
    } finally {
      setLoading(false);
    }
  };

  const label = role === 'student' ? 'Student Registration' : 'Head Counsellor Application';

  return (
    <div className="container-tight section-padding flex min-h-[calc(100vh-64px)] items-center justify-center py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-playfair-display text-2xl">{label}</CardTitle>
            <CardDescription>
              {role === 'head_counsellor'
                ? 'Your application will be reviewed by an admin'
                : 'Create your student account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input placeholder="Jane Doe" {...register('full_name')} />
                {(errors as any).full_name && <p className="text-sm text-destructive">{(errors as any).full_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="you@example.com" {...register('email')} />
                {(errors as any).email && <p className="text-sm text-destructive">{(errors as any).email.message}</p>}
              </div>
              {role === 'student' && (
                <div className="space-y-2">
                  <Label>Student ID</Label>
                  <Input placeholder="CS21B001" {...register('student_id')} />
                  {(errors as any).student_id && <p className="text-sm text-destructive">{(errors as any).student_id.message}</p>}
                </div>
              )}
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="9876543210" {...register('phone')} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" placeholder="••••••••" {...register('password')} />
                {(errors as any).password && <p className="text-sm text-destructive">{(errors as any).password.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : role === 'student' ? 'Register' : 'Apply'}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to={`/login?role=${role}`} className="font-medium text-accent hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
