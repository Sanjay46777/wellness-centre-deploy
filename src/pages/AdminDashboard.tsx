import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DateRange, AnalyticsSummary, LeaderboardEntry } from '@/types';
import { analyticsApi } from '@/lib/api';
import { MetricCard } from '@/components/analytics/MetricCard';
import { DateRangeFilter } from '@/components/analytics/DateRangeFilter';
import { ExportToolbar } from '@/components/analytics/ExportToolbar';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { LineChart } from '@/components/charts/LineChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Star, MessageSquare, TrendingUp, AlertTriangle, Users, UserCheck, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


export function AdminDashboard() {
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
    Promise.all([analyticsApi.institution(params), analyticsApi.leaderboard(params)])
      .then(([s, l]) => {
        setStats(s);
        setLeaderboard(l.leaderboard);
      })
      .catch((err: any) => {
        toast({ variant: 'destructive', title: 'Error', description: err?.message });
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
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Export failed', description: err?.message });
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-playfair-display text-3xl font-bold md:text-4xl">Admin Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Institution analytics, team filters, and flagged counsellors</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Link to="/admin/approvals">
              <Button variant="outline" className="gap-2">
                <UserCheck className="h-4 w-4" /> Approvals
              </Button>
            </Link>
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

          {stats.flagged_counsellors && stats.flagged_counsellors.length > 0 && (
            <Card className="mt-8 border-destructive/30 bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" /> Flagged Counsellors
                </CardTitle>
                <CardDescription>Average rating below 3.2</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Avg Rating</TableHead>
                      <TableHead>Feedback Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.flagged_counsellors.map((c) => (
                      <TableRow key={c.counsellor_id}>
                        <TableCell>{c.name}</TableCell>
                        <TableCell>{c.designation || '—'}</TableCell>
                        <TableCell>{c.team || '—'}</TableCell>
                        <TableCell>{c.avg_rating}</TableCell>
                        <TableCell>{c.feedback_count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

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
                    <TableHead>Recommend %</TableHead>
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
