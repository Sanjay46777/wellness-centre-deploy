import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Feedback } from '@/types';
import { feedbackApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

export function StudentHome() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    feedbackApi.myHistory().then((res) => {
      setFeedback(res.feedback);
      setLoading(false);
    });
  }, []);

  return (
    <div className="container-tight section-padding py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-playfair-display text-3xl font-bold md:text-4xl">Your Feedback History</h1>
        <p className="mt-3 text-muted-foreground">View the feedback you have submitted</p>
      </motion.div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            </div>
          ) : feedback.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No feedback submitted yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Counsellor</TableHead>
                  <TableHead>Recommendation</TableHead>
                  <TableHead>Comments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedback.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>{new Date(f.submitted_at).toLocaleDateString()}</TableCell>
                    <TableCell>{f.counsellor_name}</TableCell>
                    <TableCell>{f.recommendation}</TableCell>
                    <TableCell className="max-w-xs truncate">{f.comments || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
