import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/client/supabase';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { ExportToolbar } from '@/components/ExportToolbar';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { BarChart, PieChart, LineChart } from '@/components/charts';
import { StarRating } from '@/components/StarRating';
import { ArrowLeft, Users, Shield, BarChart3, Settings, UserCheck } from 'lucide-react-native';
import { isInRange, averageRating, recommendationBreakdown, monthlyTrend, questionAveragesForChart } from '@/lib/analytics';
import type { Feedback, Counsellor, DateRange } from '@/types';

export default function AdminDashboard() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange>('month');
  const [customStart, setCustomStart] = useState<Date | undefined>(undefined);
  const [customEnd, setCustomEnd] = useState<Date | undefined>(undefined);

  const load = useCallback(async () => {
    const [{ data: c }, { data: f }] = await Promise.all([
      supabase.from('counsellors').select('*').order('name'),
      supabase.from('feedback').select('*').order('submitted_at', { ascending: false }),
    ]);
    setCounsellors((c as Counsellor[]) ?? []);
    setFeedback((f as Feedback[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (range === 'all') return feedback;
    return feedback.filter((f) => isInRange(f.submitted_at, range, customStart, customEnd));
  }, [feedback, range, customStart, customEnd]);

  const avg = averageRating(filtered);
  const rec = recommendationBreakdown(filtered);
  const perQ = questionAveragesForChart(filtered);
  const trend = monthlyTrend(filtered);
  const anonymousCount = filtered.filter((f) => f.is_anonymous).length;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Loading admin panel...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" className="flex-1 bg-background">
      <View className="px-4 py-8 items-center">
        <View style={{ width: Math.min(width - 32, 1000) }}>
          <View className="flex-row items-center gap-3 mb-6">
            <Pressable onPress={() => router.back()} className="p-2 rounded-full bg-muted active:opacity-70">
              <ArrowLeft size={20} className="text-foreground" />
            </Pressable>
            <View>
              <Text className="text-sm text-muted-foreground uppercase tracking-wide">Administration</Text>
              <Text className="text-2xl font-playfair-display font-bold text-foreground">Admin Dashboard</Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-4 mb-6">
            <ActionCard icon={<UserCheck size={24} className="text-emerald-500" />} title="Approve Head Admins" onPress={() => router.push('/(app)/admin/approvals')} />
            <ActionCard icon={<Users size={24} className="text-primary" />} title="Manage Counsellors" onPress={() => router.push('/(app)/admin/counsellors')} />
            <ActionCard icon={<BarChart3 size={24} className="text-secondary" />} title="View Reports" onPress={() => router.push('/(app)/head')} />
            <ActionCard icon={<Settings size={24} className="text-muted-foreground" />} title="Platform Settings" onPress={() => {}} />
          </View>

          <View className="flex-row flex-wrap items-center justify-between gap-4 mb-6">
            <DateRangeFilter
              value={range}
              onChange={setRange}
              customStart={customStart}
              customEnd={customEnd}
              onCustomChange={(s, e) => { setCustomStart(s); setCustomEnd(e); }}
            />
            <ExportToolbar items={filtered} />
          </View>

          <View className="flex-row flex-wrap gap-4 mb-6">
            <MetricCard icon={<Users size={20} className="text-primary" />} value={String(filtered.length)} label="Total Feedback" />
            <MetricCard icon={<StarRating value={Math.round(avg)} readOnly size={18} />} value={avg.toFixed(2)} label="Avg Rating" />
            <MetricCard icon={<Shield size={20} className="text-accent" />} value={String(counsellors.length)} label="Counsellors" />
            <MetricCard icon={<BarChart3 size={20} className="text-secondary" />} value={`${anonymousCount}`} label="Anonymous" />
          </View>

          <View className="gap-6 mb-6">
            <View>
              <Text className="text-lg font-semibold text-foreground mb-3">Ratings by Question</Text>
              <BarChart data={perQ} />
            </View>
            <View className="flex-row flex-wrap gap-6">
              <View className="flex-1 min-w-[280px]">
                <Text className="text-lg font-semibold text-foreground mb-3">Recommendation</Text>
                <PieChart
                  data={[
                    { label: 'Yes', value: rec.counts.Yes, color: '#10B981' },
                    { label: 'No', value: rec.counts.No, color: '#EF4444' },
                    { label: 'Maybe', value: rec.counts.Maybe, color: '#F59E0B' },
                  ]}
                />
              </View>
              <View className="flex-[2] min-w-[280px]">
                <Text className="text-lg font-semibold text-foreground mb-3">Monthly Submissions</Text>
                <LineChart data={trend.map((t) => ({ label: t.month, value: t.count }))} color="#38BDF8" />
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function ActionCard({ icon, title, onPress }: { icon: React.ReactNode; title: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="bg-card rounded-2xl border border-border p-5 flex-1 min-w-[180px] active:opacity-70 shadow-sm">
      <View className="mb-3">{icon}</View>
      <Text className="text-lg font-semibold text-foreground">{title}</Text>
    </Pressable>
  );
}

function MetricCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <View className="bg-card rounded-2xl border border-border p-4 flex-1 min-w-[140px] shadow-sm">
      <View className="mb-2">{icon}</View>
      <Text className="text-2xl font-bold text-foreground">{value}</Text>
      <Text className="text-xs text-muted-foreground mt-1">{label}</Text>
    </View>
  );
}
