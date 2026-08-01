import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from '@/client/supabase';
import { Text } from '@/components/ui/text';
import { ExportToolbar } from '@/components/ExportToolbar';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { BarChart, PieChart, LineChart } from '@/components/charts';
import { StarRating } from '@/components/StarRating';
import { ArrowLeft, MessageSquare, Award, Calendar } from 'lucide-react-native';
import { isInRange, averageRating, recommendationBreakdown, monthlyTrend, questionAveragesForChart } from '@/lib/analytics';
import type { Feedback, Counsellor, DateRange } from '@/types';

export default function CounsellorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [counsellor, setCounsellor] = useState<Counsellor | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange>('month');
  const [customStart, setCustomStart] = useState<Date | undefined>(undefined);
  const [customEnd, setCustomEnd] = useState<Date | undefined>(undefined);

  const load = useCallback(async () => {
    const [{ data: c }, { data: f }] = await Promise.all([
      supabase.from('counsellors').select('*').eq('id', id).single(),
      supabase.from('feedback').select('*').eq('counsellor_id', id).order('submitted_at', { ascending: false }),
    ]);
    setCounsellor(c as Counsellor);
    setFeedback((f as Feedback[]) ?? []);
    setLoading(false);
  }, [id]);

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
  const comments = filtered.filter((f) => f.comments);

  const qrUrl = useMemo(
    () => Linking.createURL('/feedback', { queryParams: { cid: counsellor?.id } }),
    [counsellor?.id]
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  if (!counsellor) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground">Counsellor not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" className="flex-1 bg-background">
      <View className="px-4 py-8 items-center">
        <View style={{ width: Math.min(width - 32, 900) }}>
          <View className="flex-row items-center gap-3 mb-6">
            <Pressable onPress={() => router.back()} className="p-2 rounded-full bg-muted active:opacity-70">
              <ArrowLeft size={20} className="text-foreground" />
            </Pressable>
            <View>
              <Text className="text-sm text-muted-foreground uppercase tracking-wide">Counsellor Detail</Text>
              <Text className="text-2xl font-playfair-display font-bold text-foreground">{counsellor.name}</Text>
            </View>
          </View>

          <View className="flex-row flex-wrap items-center justify-between gap-4 mb-6">
            <DateRangeFilter
              value={range}
              onChange={setRange}
              customStart={customStart}
              customEnd={customEnd}
              onCustomChange={(s, e) => { setCustomStart(s); setCustomEnd(e); }}
            />
            <ExportToolbar items={filtered} counsellor={counsellor} />
          </View>

          <View className="flex-row flex-wrap gap-4 mb-6">
            <MetricCard icon={<StarRating value={Math.round(avg)} readOnly size={20} />} value={avg.toFixed(2)} label="Average Rating" />
            <MetricCard icon={<MessageSquare size={20} className="text-secondary" />} value={String(filtered.length)} label="Feedback Count" />
            <MetricCard icon={<Award size={20} className="text-accent" />} value={`${rec.yesPct}%`} label="Recommend Yes" />
            <MetricCard icon={<Calendar size={20} className="text-primary" />} value={String(comments.length)} label="Comments" />
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
                <Text className="text-lg font-semibold text-foreground mb-3">Monthly Trend</Text>
                <LineChart data={trend.map((t) => ({ label: t.month, value: Number(t.avg.toFixed(2)) }))} />
              </View>
            </View>
          </View>

          <View className="bg-card rounded-2xl border border-border p-5 shadow-sm items-center mb-6">
            <Text className="text-lg font-semibold text-foreground mb-4">Feedback QR Code</Text>
            <View className="bg-white p-4 rounded-xl" style={{ borderCurve: 'continuous' }}>
              <QRCode value={qrUrl} size={160} />
            </View>
            <Text className="text-xs text-muted-foreground text-center mt-3 px-4">Scan to submit feedback for {counsellor.name}</Text>
            <Text className="text-xs text-muted-foreground text-center mt-1 px-4">{qrUrl}</Text>
          </View>

          <View className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <Text className="text-lg font-semibold text-foreground mb-4">Comments</Text>
            {comments.length === 0 ? (
              <Text className="text-muted-foreground">No comments in selected range.</Text>
            ) : (
              <View className="gap-3">
                {comments.map((f) => (
                  <View key={f.id} className="bg-muted rounded-xl p-4">
                    <StarRating value={f.q10_overall ?? 0} readOnly size={16} />
                    <Text className="text-foreground mt-2 leading-5">"{f.comments}"</Text>
                    <Text className="text-xs text-muted-foreground mt-2">{new Date(f.submitted_at).toLocaleDateString()}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
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
