import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { useRouter, type RelativePathString } from 'expo-router';
import { supabase } from '@/client/supabase';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { ExportToolbar } from '@/components/ExportToolbar';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { BarChart, PieChart, LineChart } from '@/components/charts';
import { StarRating } from '@/components/StarRating';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Users, AlertTriangle, ChevronRight, List } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { isInRange, averageRating, recommendationBreakdown, monthlyTrend, questionAveragesForChart } from '@/lib/analytics';
import type { Feedback, Counsellor, DateRange } from '@/types';

export default function HeadDashboard() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange>('month');
  const [customStart, setCustomStart] = useState<Date | undefined>(undefined);
  const [customEnd, setCustomEnd] = useState<Date | undefined>(undefined);
  const [teamFilter, setTeamFilter] = useState<string>('All');

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

  const byCounsellor = useMemo(() => {
    const map = new Map<string, Feedback[]>();
    for (const c of counsellors) map.set(c.id, []);
    for (const f of filtered) {
      const list = map.get(f.counsellor_id) ?? [];
      list.push(f);
      map.set(f.counsellor_id, list);
    }
    return map;
  }, [filtered, counsellors]);

  const ranked = useMemo(() => {
    return counsellors
      .map((c) => {
        const items = byCounsellor.get(c.id) ?? [];
        const avg = averageRating(items);
        const rec = recommendationBreakdown(items);
        return { ...c, items, avg, yesPct: rec.yesPct, count: items.length };
      })
      .sort((a, b) => b.avg - a.avg);
  }, [counsellors, byCounsellor]);

  const teamOptions = useMemo(() => {
    const teams = [...new Set(counsellors.map((c) => c.designation).filter((d): d is string => !!d))];
    return ['All', ...teams.sort()];
  }, [counsellors]);

  const rankedByTeam = useMemo(() => {
    if (teamFilter === 'All') return ranked;
    return ranked.filter((c) => c.designation === teamFilter);
  }, [ranked, teamFilter]);

  const flagged = rankedByTeam.filter((c) => c.avg > 0 && c.avg < 3.2);
  const avg = averageRating(filtered);
  const rec = recommendationBreakdown(filtered);
  const perQ = questionAveragesForChart(filtered);
  const trend = monthlyTrend(filtered);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Loading dashboard...</Text>
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
              <Text className="text-sm text-muted-foreground uppercase tracking-wide">Head Admin</Text>
              <Text className="text-2xl font-playfair-display font-bold text-foreground">Institution Overview</Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-4 mb-6">
            <ActionCard icon={<List size={24} className="text-primary" />} title="All Feedback" onPress={() => router.push('/(app)/head/feedback' as RelativePathString)} />
            <ActionCard icon={<Users size={24} className="text-secondary" />} title="Counsellor Leaderboard" onPress={() => {}} />
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

          {/* Institution metrics */}
          <View className="flex-row flex-wrap gap-4 mb-6">
            <MetricCard icon={<Users size={20} className="text-primary" />} value={String(filtered.length)} label="Total Feedback" />
            <MetricCard icon={<StarRating value={Math.round(avg)} readOnly size={18} />} value={avg.toFixed(2)} label="Centre Avg Rating" />
            <MetricCard icon={<ArrowUpRight size={20} className="text-accent" />} value={`${rec.yesPct}%`} label="Recommend Yes" />
            <MetricCard icon={<AlertTriangle size={20} className="text-destructive" />} value={String(flagged.length)} label="Flagged Counsellors" />
          </View>

          {/* Rankings */}
          <View className="bg-card rounded-2xl border border-border p-5 shadow-sm mb-6">
            <View className="flex-row items-center justify-between gap-4 mb-4">
              <Text className="text-lg font-semibold text-foreground">Counsellor Leaderboard</Text>
            </View>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {teamOptions.map((team) => {
                const active = teamFilter === team;
                return (
                  <Pressable
                    key={team}
                    onPress={() => setTeamFilter(team)}
                    className={cn(
                      'px-4 py-2 rounded-full border',
                      active ? 'bg-primary border-primary' : 'bg-background border-border'
                    )}
                  >
                    <Text className={active ? 'text-primary-foreground' : 'text-foreground'}>{team}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View className="gap-3">
              {rankedByTeam.map((c, idx) => (
                <Pressable
                  key={c.id}
                  onPress={() => router.push(`/(app)/head/counsellor/${c.id}`)}
                  className="flex-row items-center gap-3 p-3 rounded-xl bg-muted active:opacity-70"
                >
                  <Text className="text-lg font-bold text-muted-foreground w-8">#{idx + 1}</Text>
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground">{c.name}</Text>
                    <Text className="text-xs text-muted-foreground">{c.count} feedback · {c.yesPct}% yes</Text>
                  </View>
                  <View className="items-end">
                    <Text className="font-bold text-foreground">{c.avg.toFixed(2)}</Text>
                    <StarRating value={Math.round(c.avg)} readOnly size={14} />
                  </View>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </Pressable>
              ))}
            </View>
          </View>

          {/* Charts */}
          <View className="gap-6 mb-6">
            <View>
              <Text className="text-lg font-semibold text-foreground mb-3">Centre-Wide Ratings by Question</Text>
              <BarChart data={perQ} />
            </View>
            <View className="flex-row flex-wrap gap-6">
              <View className="flex-1 min-w-[280px]">
                <Text className="text-lg font-semibold text-foreground mb-3">Recommendation Distribution</Text>
                <PieChart
                  data={[
                    { label: 'Yes', value: rec.counts.Yes, color: '#10B981' },
                    { label: 'No', value: rec.counts.No, color: '#EF4444' },
                    { label: 'Maybe', value: rec.counts.Maybe, color: '#F59E0B' },
                  ]}
                />
              </View>
              <View className="flex-[2] min-w-[280px]">
                <Text className="text-lg font-semibold text-foreground mb-3">Monthly Trend</Text>
                <LineChart data={trend.map((t) => ({ label: t.month, value: Number(t.avg.toFixed(2)) }))} />
              </View>
            </View>
          </View>

          {/* Flagged */}
          {flagged.length > 0 && (
            <View className="bg-destructive/10 border border-destructive/20 rounded-2xl p-5 mb-6">
              <Text className="text-lg font-semibold text-destructive mb-2">Flagged Counsellors</Text>
              <Text className="text-sm text-destructive/80 mb-3">Average rating below 3.2 — consider check-in or support.</Text>
              <View className="gap-2">
                {flagged.map((c) => (
                  <Pressable key={c.id} onPress={() => router.push(`/(app)/head/counsellor/${c.id}`)}>
                    <Text className="text-foreground">{c.name} — avg {c.avg.toFixed(2)}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
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
