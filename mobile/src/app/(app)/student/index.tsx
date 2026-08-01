import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter, Link, type RelativePathString } from 'expo-router';
import { Heart, LogOut, User, MessageSquare, BarChart3, ArrowRight } from 'lucide-react-native';
import { supabase } from '@/client/supabase';
import { useSession } from '@/ctx';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import type { Profile } from '@/types';

export default function StudentHomeScreen() {
  const { session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!session?.user.id) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    if (data) setProfile(data as Profile);
    setLoading(false);
  }, [session?.user.id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" className="flex-1 bg-background">
      <View className="px-6 py-12 gap-6 max-w-3xl self-center w-full">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-xl bg-primary items-center justify-center">
              <Heart size={24} className="text-primary-foreground" fill="#fff" />
            </View>
            <View>
              <Text className="text-sm text-muted-foreground uppercase tracking-wide">IIT Madras</Text>
              <Text className="text-2xl font-playfair-display font-bold text-foreground">Wellness Centre</Text>
            </View>
          </View>
          <Button variant="ghost" size="icon" onPress={handleLogout}>
            <LogOut size={20} className="text-muted-foreground" />
          </Button>
        </View>

        <View className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-10 h-10 rounded-full bg-secondary/20 items-center justify-center">
              <User size={20} className="text-secondary" />
            </View>
            <View>
              <Text className="text-lg font-semibold text-foreground">{profile?.full_name || session?.user.email}</Text>
              <Text className="text-sm text-muted-foreground capitalize">{(profile?.role || 'student').replace('_', ' ')}</Text>
            </View>
          </View>
          <Text className="text-muted-foreground leading-6">
            Welcome to your personal wellness portal. You can share feedback, track your emotional wellbeing, and explore self-care resources.
          </Text>
        </View>

        <Link href="/feedback" asChild>
          <Button size="lg" className="w-full rounded-full flex-row items-center justify-center gap-2">
            <Text className="text-primary-foreground font-semibold text-base">Start Feedback</Text>
            <ArrowRight size={20} className="text-primary-foreground" />
          </Button>
        </Link>

        <View className="gap-4">
          <Link href="/feedback" asChild>
            <ActionCard
              icon={<MessageSquare size={24} className="text-primary" />}
              title="Submit Feedback"
              description="Share anonymous feedback about a counselling session."
            />
          </Link>

          <ActionCard
            icon={<BarChart3 size={24} className="text-secondary" />}
            title="My Feedback History"
            description="View your past feedback submissions and trends."
            onPress={() => router.push('/(app)/student/feedback' as RelativePathString)}
          />
        </View>
      </View>
    </ScrollView>
  );
}

function ActionCard({
  icon,
  title,
  description,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress?: () => void;
}) {
  const body = (
    <View className="bg-card rounded-2xl border border-border p-5 flex-row items-center gap-4 active:opacity-70 shadow-sm">
      <View className="w-12 h-12 rounded-xl bg-muted items-center justify-center">{icon}</View>
      <View className="flex-1">
        <Text className="text-lg font-semibold text-foreground">{title}</Text>
        <Text className="text-sm text-muted-foreground">{description}</Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="active:opacity-70">
        {body}
      </Pressable>
    );
  }

  return body;
}
