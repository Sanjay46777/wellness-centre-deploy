import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MessageSquare } from 'lucide-react-native';
import { supabase } from '@/client/supabase';
import { useSession } from '@/ctx';
import { Text } from '@/components/ui/text';
import { FEEDBACK_QUESTIONS, type Feedback } from '@/types';

export default function StudentFeedbackHistoryScreen() {
  const router = useRouter();
  const { session } = useSession();
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeedback = useCallback(async () => {
    if (!session?.user.id) return;
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', session.user.id)
      .order('submitted_at', { ascending: false });
    if (!error) {
      setFeedbackList((data ?? []) as Feedback[]);
    }
    setLoading(false);
  }, [session?.user.id]);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" className="flex-1 bg-background">
      <View className="px-6 py-12 max-w-3xl self-center w-full gap-6">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} className="p-2 rounded-full bg-muted active:opacity-70">
            <ArrowLeft size={20} className="text-foreground" />
          </Pressable>
          <View>
            <Text className="text-sm text-muted-foreground uppercase tracking-wide">Wellness Centre</Text>
            <Text className="text-2xl font-playfair-display font-bold text-foreground">My Feedback History</Text>
          </View>
        </View>

        {feedbackList.length === 0 ? (
          <View className="bg-card rounded-2xl border border-border p-8 items-center gap-4">
            <MessageSquare size={40} className="text-muted-foreground" />
            <Text className="text-muted-foreground text-center">
              You haven't submitted any feedback yet. Your anonymous submissions are not shown here.
            </Text>
          </View>
        ) : (
          <View className="gap-4">
            {feedbackList.map((item) => (
              <View key={item.id} className="bg-card rounded-2xl border border-border p-5 gap-3 shadow-sm">
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted-foreground">
                    {new Date(item.submitted_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                  <Text className="text-sm font-semibold text-primary">
                    Recommend: {item.recommendation}
                  </Text>
                </View>
                <View className="flex-row flex-wrap gap-2">
                  {FEEDBACK_QUESTIONS.map((q) => {
                    const value = item[q.key as keyof Feedback] as number | null;
                    return value ? (
                      <View key={q.key} className="bg-muted rounded-full px-3 py-1">
                        <Text className="text-xs text-foreground">
                          {q.label}: {value}
                        </Text>
                      </View>
                    ) : null;
                  })}
                </View>
                {item.comments ? (
                  <Text className="text-sm text-muted-foreground italic">"{item.comments}"</Text>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
