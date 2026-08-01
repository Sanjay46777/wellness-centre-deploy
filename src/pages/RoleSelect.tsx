import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, UserCog, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function RoleSelect() {
  const roles = [
    {
      title: 'Student',
      desc: 'Submit feedback and view your history',
      icon: User,
      href: '/login?role=student',
      cta: 'Continue as Student',
    },
    {
      title: 'Head Counsellor',
      desc: 'Review analytics and manage feedback',
      icon: UserCog,
      href: '/login?role=head_counsellor',
      cta: 'Continue as Head Counsellor',
    },
    {
      title: 'Admin',
      desc: 'Dashboard, approvals, and reports',
      icon: ShieldCheck,
      href: '/login?role=admin',
      cta: 'Continue as Admin',
    },
  ];

  return (
    <div className="container-tight section-padding py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl text-center"
      >
        <h1 className="font-playfair-display text-3xl font-bold md:text-4xl">Select your role</h1>
        <p className="mt-3 text-muted-foreground">Choose how you would like to continue</p>
      </motion.div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {roles.map((role, i) => (
          <motion.div
            key={role.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={role.href}>
              <Card className="group h-full transition-all hover:shadow-md hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <role.icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{role.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{role.desc}</p>
                  <span className="mt-4 inline-block text-sm font-semibold text-accent group-hover:underline">
                    {role.cta}
                  </span>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
