import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, TextInput, Pressable, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import { ArrowLeft, CheckCircle2, Send, Sparkles } from 'lucide-react-native';
import { supabase } from '@/client/supabase';
import { useSession } from '@/ctx';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { StarRating } from '@/components/StarRating';
import { FEEDBACK_QUESTIONS, type Counsellor } from '@/types';
import { cn } from '@/lib/utils';
import { StatusBar } from 'expo-status-bar';

export default function FeedbackScreen() {
  const { cid } = useLocalSearchParams<{ cid?: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(cid ?? null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState('');
  const [email, setEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useSession();

  useEffect(() => {
    if (session?.user.email && !email) {
      setEmail(session.user.email);
      setIsAnonymous(false);
    }
  }, [session?.user.email]);

  const loadCounsellors = useCallback(async () => {
    const { data, error } = await supabase.from('counsellors').select('*').eq('is_active', true).order('name');
    if (!error) setCounsellors(data ?? []);
  }, []);

  useEffect(() => {
    loadCounsellors();
  }, [loadCounsellors]);

  const handleSubmit = async () => {
    setError(null);
    if (!selectedId) {
      setError('Please select a counsellor.');
      return;
    }
    if (Object.keys(ratings).length < FEEDBACK_QUESTIONS.length) {
      setError('Please rate all questions.');
      return;
    }

    setSubmitting(true);
    const payload = {
      counsellor_id: selectedId,
      ...ratings,
      comments: comments.trim() || null,
      is_anonymous: isAnonymous,
      respondent_email: isAnonymous ? null : email.trim() || session?.user.email || null,
      user_id: isAnonymous ? null : session?.user.id || null,
    };
    const { error: submitError } = await supabase.from('feedback').insert(payload);
    setSubmitting(false);
    if (submitError) {
      setError(submitError.message);
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <StatusBar style="auto" />
        <CheckCircle2 size={64} className="text-accent mb-4" />
        <Text className="text-2xl font-playfair-display font-bold text-foreground text-center mb-2">
          Thank you for sharing.
        </Text>
        <Text className="text-muted-foreground text-center max-w-md leading-6 mb-6">
          Healing is a journey, not a destination. You are stronger than you think. Every small step counts. Take care of yourself today.
        </Text>
        <Button onPress={() => router.replace('/')}>
          <Text>Back to Home</Text>
        </Button>
      </View>
    );
  }

  const maxContentWidth = Math.min(width - 32, 720);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" className="flex-1 bg-background">
      <StatusBar style="auto" />
      <View className="items-center px-4 py-8">
        <View style={{ width: maxContentWidth }}>
          <View className="flex-row items-center gap-3 mb-6">
            <Pressable onPress={() => router.replace('/')} className="p-2 rounded-full bg-muted active:opacity-70">
              <ArrowLeft size={20} className="text-foreground" />
            </Pressable>
            <View>
              <Text className="text-sm text-muted-foreground uppercase tracking-wide">Wellness Centre</Text>
              <Text className="text-2xl font-playfair-display font-bold text-foreground">Session Feedback</Text>
            </View>
          </View>

          {error && (
            <View className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-4">
              <Text className="text-destructive text-sm">{error}</Text>
            </View>
          )}

          {/* Counsellor selection */}
          <View className="bg-card rounded-2xl border border-border p-5 gap-4 shadow-sm mb-6">
            <Label className="text-foreground font-semibold">Select Counsellor / Psychologist</Label>
            <View className="gap-2">
              {counsellors.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => setSelectedId(c.id)}
                  className={cn(
                    'flex-row items-center p-3 rounded-xl border gap-3 active:opacity-70',
                    selectedId === c.id ? 'border-primary bg-primary/5' : 'border-border bg-muted'
                  )}
                >
                  <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                    <Text className="text-primary font-bold">{c.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-foreground">{c.name}</Text>
                    <Text className="text-xs text-muted-foreground">{c.designation}</Text>
                  </View>
                  {selectedId === c.id && <Sparkles size={18} className="text-primary" />}
                </Pressable>
              ))}
            </View>
          </View>

          {/* Email */}
          <View className="bg-card rounded-2xl border border-border p-5 gap-3 shadow-sm mb-6">
            <Label className="text-foreground font-semibold">Your Email (optional)</Label>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="student@institution.edu"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-background"
            />
            <View className="flex-row items-start gap-3 mt-1">
              <Checkbox checked={isAnonymous} onCheckedChange={setIsAnonymous} />
              <Text className="text-sm text-muted-foreground flex-1">
                Submit anonymously. Your identity will be hidden from the counsellor.
              </Text>
            </View>
          </View>

          {/* Ratings */}
          <View className="bg-card rounded-2xl border border-border p-5 gap-5 shadow-sm mb-6">
            <Text className="text-lg font-semibold text-foreground">Please rate your session</Text>
            {FEEDBACK_QUESTIONS.map((q) => (
              <View key={q.key} className="gap-2">
                <Text className="text-sm font-medium text-foreground">{q.label}</Text>
                <StarRating value={ratings[q.key] ?? 0} onChange={(v) => setRatings((prev) => ({ ...prev, [q.key]: v }))} />
              </View>
            ))}
          </View>

          {/* Comments */}
          <View className="bg-card rounded-2xl border border-border p-5 gap-3 shadow-sm mb-8">
            <Label className="text-foreground font-semibold">Additional Feedback</Label>
            <Textarea
              value={comments}
              onChangeText={setComments}
              placeholder="Your feedback helps us improve our services."
              multiline
              numberOfLines={5}
              className="bg-background min-h-[120px]"
            />
          </View>

          <Button
            disabled={submitting}
            onPress={handleSubmit}
            size="lg"
            className="flex-row items-center justify-center gap-2 rounded-full"
          >
            <Send size={18} className="text-primary-foreground" />
            <Text>{submitting ? 'Submitting...' : 'Submit Feedback'}</Text>
          </Button>

          <Text className="text-xs text-muted-foreground text-center mt-6 pb-8">
            Emergency Helpline available 24×7 · Your feedback is confidential.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
