import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, BarChart3, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { IITM_LOGO_URL, WELLNESS_CENTRE_LOGO_URL } from '@/lib/assets';

export function LandingPage() {
  const { user, isRole } = useAuthStore();
  const isStudent = isRole('student');

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-background py-16 md:py-24 lg:py-32">
        <div className="container-tight section-padding relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-8 flex flex-col items-center gap-6">
              <img
                src={IITM_LOGO_URL}
                alt="IIT Madras"
                className="h-24 w-auto object-contain md:h-32"
              />
            </div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <img
                src={WELLNESS_CENTRE_LOGO_URL}
                alt="Wellness Centre"
                className="h-4 w-auto object-contain"
              />
              IIT Madras Wellness Centre
            </div>
            <h1 className="editorial-title mb-6 font-playfair-display text-foreground">
              Supporting student well-being through thoughtful feedback
            </h1>
            <p className="editorial-subtitle mx-auto mb-10 max-w-2xl">
              A confidential platform for students to share counselling experiences, helping the Wellness Centre continuously improve care.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              {isStudent ? (
                <Link to="/feedback">
                  <Button size="lg" className="h-12 px-8">
                    Submit Feedback
                  </Button>
                </Link>
              ) : (
                <Link to="/role-select">
                  <Button size="lg" className="h-12 px-8">
                    Get Started
                  </Button>
                </Link>
              )}
              {user ? (
                <Link to={isRole('admin') ? '/admin/dashboard' : isRole('head_counsellor') ? '/head/dashboard' : '/student/home'}>
                  <Button size="lg" variant="outline" className="h-12 px-8">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/role-select">
                  <Button size="lg" variant="outline" className="h-12 px-8">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/30 py-20">
        <div className="container-tight section-padding">
          <div className="mb-12 text-center">
            <h2 className="font-playfair-display text-3xl font-bold tracking-tight md:text-4xl">How it works</h2>
            <p className="mt-3 text-muted-foreground">Simple, secure, and designed for students</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: MessageSquare, title: 'Share feedback', desc: 'Rate your counselling experience and leave confidential comments.' },
              { icon: BarChart3, title: 'Insights', desc: 'Admins and heads review anonymised analytics to improve services.' },
              { icon: Shield, title: 'Privacy first', desc: 'Anonymous submissions and secure data handling protect your identity.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm shadow-black/5"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-playfair-display text-xl font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
