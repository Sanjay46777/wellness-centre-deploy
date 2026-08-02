import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Counsellor } from '@/types';
import { counsellorApi } from '@/lib/api';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function FeedbackPage() {
  const [searchParams] = useSearchParams();
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const preselectedId = Number(searchParams.get('cid')) || undefined;

  useEffect(() => {
    counsellorApi
      .getAll({ active: true })
      .then((res) => {
        setCounsellors(res.counsellors);
        setError(null);
      })
      .catch(() => setError('Unable to load counsellors. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-tight section-padding py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl"
      >
        <div className="mb-8 text-center">
          <h1 className="font-playfair-display text-3xl font-bold md:text-4xl">Counselling Feedback</h1>
          <p className="mt-3 text-muted-foreground">Your feedback helps us improve mental health support</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Feedback Form</CardTitle>
            <CardDescription>
              All responses are confidential. You may choose to submit anonymously.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
              </div>
            ) : error ? (
              <p className="py-8 text-center text-destructive">{error}</p>
            ) : (
              <FeedbackForm
                counsellors={counsellors}
                preselectedCounsellorId={preselectedId}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
