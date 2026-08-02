import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DateRange, Counsellor, AnalyticsSummary, Feedback } from '@/types';
import { analyticsApi, getErrorMessage } from '@/lib/api';
import { MetricCard } from '@/components/analytics/MetricCard';
import { DateRangeFilter } from '@/components/analytics/DateRangeFilter';
import { ExportToolbar } from '@/components/analytics/ExportToolbar';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { LineChart } from '@/components/charts/LineChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Star, MessageSquare, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


export function CounsellorDetail() {
  const { id } = useParams<{ id: string }>();
  const [range, setRange] = useState<DateRange>('all');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [counsellor, setCounsellor] = useState<Counsellor | null>(null);
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();


  useEffect(() => {
    setLoading(true);
    const params = { range, start, end };
    analyticsApi
      .counsellor(Number(id), params)
      .then((res) => {
        setCounsellor(res.counsellor);
        setStats({
          total_feedback: res.total_feedback,
          avg_rating: res.avg_rating,
          recommendation: res.recommendation,
          monthly_trend: res.monthly_trend,
          question_averages: res.question_averages,
          feedback: res.feedback,
        });
        setFeedback(res.feedback);
      })
      .catch((err) => {
        toast({ variant: 'destructive', title: 'Error', description: getErrorMessage(err, 'Could not load analytics') });
      })
      .finally(() => setLoading(false));
  }, [id, range, start, end, toast]);

  const handleExport = async (format: 'ppt' | 'pdf' | 'excel') => {
    if (!counsellor) return;
    try {
      if (format === 'ppt') {
        const { exportPPT } = await import('@/lib/export-ppt');
        exportPPT(feedback, counsellor);
      } else if (format === 'pdf') {
        const { exportPDF } = await import('@/lib/export-pdf');
        exportPDF(feedback, counsellor);
      } else {
        const { exportExcel } = await import('@/lib/export-excel');
        exportExcel(feedback, counsellor);
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Export failed', description: getErrorMessage(err, 'Export failed') });
    }
  };

  const recommendationData = stats
    ? [
        { label: 'Yes', value: stats.recommendation.counts.Yes },
        { label: 'No', value: stats.recommendation.counts.No },
        { label: 'Maybe', value: stats.recommendation.counts.Maybe },
      ]
    : [];

  return (
    <div className="container-tight section-padding py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-playfair-display text-3xl font-bold md:text-4xl">
              {counsellor ? counsellor.name : 'Counsellor'}
            </h1>
            <p className="mt-2 text-muted-foreground">{counsellor?.designation}</p>
          </div>
          <ExportToolbar onExport={handleExport} />
        </div>
      </motion.div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <DateRangeFilter value={range} onChange={setRange} start={start} end={end} onStartChange={setStart} onEndChange={setEnd} />
      </div>

      {loading ? (
        <div className="mt-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : stats ? (
        <>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <MetricCard title="Total Feedback" value={stats.total_feedback} icon={<MessageSquare className="h-5 w-5" />} />
            <MetricCard title="Average Rating" value={stats.avg_rating.toFixed(2)} icon={<Star className="h-5 w-5" />} />
            <MetricCard title="Recommendation Yes" value={`${stats.recommendation.yesPct}%`} icon={<TrendingUp className="h-5 w-5" />} />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ratings by Question</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart data={stats.question_averages} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recommendation Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart data={recommendationData} />
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Monthly Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart data={stats.monthly_trend} />
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Student Email</TableHead>
                    <TableHead>Overall</TableHead>
                    <TableHead>Recommendation</TableHead>
                    <TableHead>Comments</TableHead>
                    <TableHead>Anonymous</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedback.slice(0, 10).map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>{new Date(f.submitted_at).toLocaleDateString()}</TableCell>
                      <TableCell>{f.student_id || '—'}</TableCell>
                      <TableCell>{f.student_name || '—'}</TableCell>
                      <TableCell>{f.student_email || '—'}</TableCell>
                      <TableCell>{f.q10_overall}</TableCell>
                      <TableCell>{f.recommendation}</TableCell>
                      <TableCell className="max-w-xs truncate">{f.comments || '—'}</TableCell>
                      <TableCell>{f.is_anonymous ? 'Yes' : 'No'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
