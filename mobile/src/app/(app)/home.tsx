import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter, Link, type RelativePathString } from 'expo-router';
import { supabase } from '@/client/supabase';
import { useSession } from '@/ctx';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Heart, LogOut, User, BarChart3, Users, Shield, MessageSquare, List } from 'lucide-react-native';
import type { Profile, UserRole } from '@/types';

const ROLE_LABEL: Record<UserRole, string> = {
  client: 'Client',
  student: 'Student',
  counsellor: 'Counsellor',
  head_counsellor: 'Head Admin',
  admin: 'Admin',
};

export default function HomeScreen() {
  const { session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!session?.user.id) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
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

  const role = profile?.role ?? 'client';

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
              <Text className="text-lg font-semibold text-foreground">{session?.user.email}</Text>
              <Text className="text-sm text-muted-foreground">{ROLE_LABEL[role] ?? role}</Text>
            </View>
          </View>
          <Text className="text-muted-foreground leading-6">
            Welcome to your institutional feedback portal. Access dashboards and tools based on your role.
          </Text>
        </View>

        <View className="gap-4">
          {(role === 'student' || role === 'client') && (
            <>
              <Link href="/feedback" asChild>
                <ActionCard
                  icon={<MessageSquare size={24} className="text-primary" />}
                  title="Submit Feedback"
                  description="Share feedback about a counselling session."
                />
              </Link>
              <ActionCard
                icon={<BarChart3 size={24} className="text-secondary" />}
                title="My Feedback History"
                description="View your past feedback submissions."
                onPress={() => router.push('/(app)/student/feedback' as RelativePathString)}
              />
            </>
          )}

          {(role === 'head_counsellor' || role === 'admin') && (
            <>
              <ActionCard
                icon={<BarChart3 size={24} className="text-primary" />}
                title="Head Admin Dashboard"
                description="View all counsellors, rankings, and institutional analytics."
                onPress={() => router.push('/(app)/head')}
              />
              <ActionCard
                icon={<List size={24} className="text-secondary" />}
                title="All Feedback"
                description="Read every feedback comment with student details."
                onPress={() => router.push('/(app)/head/feedback' as RelativePathString)}
              />
            </>
          )}

          {role === 'admin' && (
            <ActionCard
              icon={<Shield size={24} className="text-accent" />}
              title="Admin Panel"
              description="Manage counsellor accounts, roles, and exports."
              onPress={() => router.push('/(app)/admin')}
            />
          )}
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
