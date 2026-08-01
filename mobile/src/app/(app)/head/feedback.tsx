import { useCallback, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, MessageSquare, User, EyeOff } from 'lucide-react-native';
import { supabase } from '@/client/supabase';
import { Text } from '@/components/ui/text';
import { StarRating } from '@/components/StarRating';
import type { Feedback, Counsellor } from '@/types';

export default function HeadFeedbackScreen() {
  const router = useRouter();
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [{ data: c }, { data: f }] = await Promise.all([
      supabase.from('counsellors').select('*').order('name'),
      supabase
        .from('feedback')
        .select('*, profiles:user_id(full_name, student_id, email, phone)')
        .order('submitted_at', { ascending: false }),
    ]);
    setCounsellors((c as Counsellor[]) ?? []);
    setFeedback((f as Feedback[]) ?? []);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const byCounsellor = counsellors.map((c) => ({
    counsellor: c,
    items: feedback.filter((f) => f.counsellor_id === c.id),
  }));

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Loading feedback...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" className="flex-1 bg-background">
      <View className="px-6 py-12 max-w-4xl self-center w-full gap-6">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} className="p-2 rounded-full bg-muted active:opacity-70">
            <ArrowLeft size={20} className="text-foreground" />
          </Pressable>
          <View>
            <Text className="text-sm text-muted-foreground uppercase tracking-wide">Head Admin</Text>
            <Text className="text-2xl font-playfair-display font-bold text-foreground">All Feedback</Text>
          </View>
        </View>

        {byCounsellor.map(({ counsellor, items }) => (
          <View key={counsellor.id} className="gap-4">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                <User size={20} className="text-primary" />
              </View>
              <View>
                <Text className="text-lg font-semibold text-foreground">{counsellor.name}</Text>
                <Text className="text-sm text-muted-foreground">{items.length} submissions</Text>
              </View>
            </View>

            {items.length === 0 ? (
              <Text className="text-sm text-muted-foreground italic">No feedback yet.</Text>
            ) : (
              <View className="gap-4">
                {items.map((f) => (
                  <View key={f.id} className="bg-card rounded-2xl border border-border p-5 gap-3 shadow-sm">
                    <View className="flex-row justify-between items-start">
                      <View className="flex-row items-center gap-2">
                        <MessageSquare size={16} className="text-muted-foreground" />
                        <Text className="text-sm text-muted-foreground">
                          {new Date(f.submitted_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>
                      {f.is_anonymous ? (
                        <View className="flex-row items-center gap-1 bg-muted rounded-full px-2 py-1">
                          <EyeOff size={12} className="text-muted-foreground" />
                          <Text className="text-xs text-muted-foreground">Anonymous</Text>
                        </View>
                      ) : (
                        <View className="bg-accent/10 rounded-full px-2 py-1">
                          <Text className="text-xs text-accent font-medium">Identified</Text>
                        </View>
                      )}
                    </View>

                    <View className="flex-row flex-wrap gap-2">
                      <View className="bg-muted rounded-full px-3 py-1">
                        <Text className="text-xs text-foreground">Overall: {f.q10_overall ?? '-'}/10</Text>
                      </View>
                      <View className="bg-muted rounded-full px-3 py-1">
                        <Text className="text-xs text-foreground">Recommend: {f.recommendation ?? '-'}</Text>
                      </View>
                    </View>

                    {f.comments ? (
                      <View className="bg-muted/50 rounded-xl p-3">
                        <Text className="text-foreground italic leading-5">"{f.comments}"</Text>
                      </View>
                    ) : (
                      <Text className="text-sm text-muted-foreground italic">No written comment.</Text>
                    )}

                    {!f.is_anonymous && f.profiles ? (
                      <View className="bg-secondary/10 rounded-xl p-3 gap-1">
                        <Text className="text-sm font-semibold text-foreground">Student details</Text>
                        <Text className="text-sm text-foreground">
                          Name: {f.profiles.full_name || 'Not provided'}
                        </Text>
                        <Text className="text-sm text-foreground">ID: {f.profiles.student_id || '-'}</Text>
                        <Text className="text-sm text-foreground">Email: {f.profiles.email || f.respondent_email || '-'}</Text>
                        <Text className="text-sm text-foreground">Phone: {f.profiles.phone || '-'}</Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
