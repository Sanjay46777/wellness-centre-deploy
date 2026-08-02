import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DateRange, AnalyticsSummary, LeaderboardEntry } from '@/types';
import { analyticsApi, getErrorMessage } from '@/lib/api';
import { MetricCard } from '@/components/analytics/MetricCard';
import { DateRangeFilter } from '@/components/analytics/DateRangeFilter';
import { ExportToolbar } from '@/components/analytics/ExportToolbar';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { LineChart } from '@/components/charts/LineChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Star, MessageSquare, TrendingUp, Users, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


export function HeadDashboard() {
  const [range, setRange] = useState<DateRange>('all');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [team, setTeam] = useState<string>('all');
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();


  useEffect(() => {
    setLoading(true);
    const params = { range, start, end, team: team === 'all' ? undefined : team };
    Promise.all([
      analyticsApi.institution(params),
      analyticsApi.leaderboard(params),
    ])
      .then(([s, l]) => {
        setStats(s);
        setLeaderboard(l.leaderboard);
      })
      .catch((err) => {
        toast({ variant: 'destructive', title: 'Error', description: getErrorMessage(err, 'Could not load analytics') });
      })
      .finally(() => setLoading(false));
  }, [range, start, end, team, toast]);

  const handleExport = async (format: 'ppt' | 'pdf' | 'excel') => {
    if (!stats) return;
    try {
      if (format === 'ppt') {
        const { exportPPT } = await import('@/lib/export-ppt');
        exportPPT(stats.feedback || [], undefined, leaderboard);
      } else if (format === 'pdf') {
        const { exportPDF } = await import('@/lib/export-pdf');
        exportPDF(stats.feedback || []);
      } else {
        const { exportExcel } = await import('@/lib/export-excel');
        exportExcel(stats.feedback || []);
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
            <h1 className="font-playfair-display text-3xl font-bold md:text-4xl">Head Counsellor Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Institution-wide feedback analytics</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Link to="/admin/counsellors">
              <Button variant="outline" className="gap-2">
                <Users className="h-4 w-4" /> Manage Counsellors
              </Button>
            </Link>
            <Link to="/admin/students">
              <Button variant="outline" className="gap-2">
                <User className="h-4 w-4" /> Manage Students
              </Button>
            </Link>
            <ExportToolbar onExport={handleExport} />
          </div>
        </div>
      </motion.div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <DateRangeFilter value={range} onChange={setRange} start={start} end={end} onStartChange={setStart} onEndChange={setEnd} />
        <Select value={team} onValueChange={setTeam}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            <SelectItem value="Team A">Team A</SelectItem>
            <SelectItem value="Team B">Team B</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
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
              <CardTitle>Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Counsellor</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Avg Rating</TableHead>
                    <TableHead>Feedback</TableHead>
                    <TableHead>Would Recommend</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((entry, idx) => (
                    <TableRow key={entry.counsellor_id}>
                      <TableCell className="font-medium">{idx + 1}</TableCell>
                      <TableCell>{entry.name}</TableCell>
                      <TableCell>{entry.designation || '—'}</TableCell>
                      <TableCell>{entry.team || '—'}</TableCell>
                      <TableCell>{entry.avg_rating.toFixed(2)}</TableCell>
                      <TableCell>{entry.feedback_count}</TableCell>
                      <TableCell>{entry.recommendation_percentage}%</TableCell>
                      <TableCell>
                        <Link to={`/counsellor/${entry.counsellor_id}`} className="text-sm font-medium text-accent hover:underline">
                          View
                        </Link>
                      </TableCell>
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
