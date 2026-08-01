import { View, ScrollView, Pressable, useColorScheme } from 'react-native';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { Heart, MessageCircle, Shield, Users, LayoutDashboard } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { StatusBar } from 'expo-status-bar';
import { useSession } from '@/ctx';

function HeroBackground() {
  const scheme = useColorScheme();
  const color = scheme === 'dark' ? '#4C1D95' : '#6B46C1';
  return (
    <View className="absolute inset-0 overflow-hidden pointer-events-none">
      <View className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-20" style={{ backgroundColor: color }} />
      <View className="absolute top-40 right-0 w-64 h-64 rounded-full opacity-15" style={{ backgroundColor: '#38BDF8' }} />
      <View className="absolute bottom-20 left-10 w-48 h-48 rounded-full opacity-15" style={{ backgroundColor: '#10B981' }} />
    </View>
  );
}

export default function LandingScreen() {
  const { session } = useSession();
  const isSignedIn = !!session;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" className="flex-1 bg-background">
      <StatusBar style="auto" />
      <View className="flex-1 min-h-screen">
        <HeroBackground />

        {/* Masthead */}
        <View className="px-6 pt-12 pb-6 border-b border-border items-center gap-5">
          <Image
            source={{ uri: 'https://miaoda-conversation-file.s3cdn.medo.dev/user-d6tmsvucogzk/app-dcgdau70ia69/20260730/image_1785410277867.png' }}
            contentFit="contain"
            className="h-20 w-20"
            accessibilityLabel="IIT Madras logo"
          />
          <View className="rounded-2xl p-4" style={{ backgroundColor: 'white' }}>
            <Image
              source={{ uri: 'https://miaoda-conversation-file.s3cdn.medo.dev/user-d6tmsvucogzk/app-dcgdau70ia69/20260730/image_1785409870628.png' }}
              contentFit="contain"
              className="h-20 w-72"
              accessibilityLabel="Wellness Centre logo"
            />
          </View>
          <Text className="text-2xl font-playfair-display font-bold text-foreground tracking-wide text-center">WELLNESS CENTRE</Text>
        </View>

        {/* Hero */}
        <View className="px-6 py-16 gap-6 max-w-3xl">
          <Text className="text-4xl md:text-5xl font-playfair-display font-bold text-foreground leading-tight">
            Every feeling matters.
          </Text>
          <Text className="text-lg md:text-xl text-muted-foreground leading-8 max-w-2xl">
            A safe, anonymous, and institutional feedback platform for the Wellness Centre. Help us listen better and support every student with compassion.
          </Text>
          <View className="flex-row flex-wrap gap-4 pt-4">
            {isSignedIn ? (
              <Link href="/(app)/home" asChild>
                <Button size="lg" className="flex-row items-center gap-2 rounded-full px-6">
                  <LayoutDashboard size={18} className="text-primary-foreground" />
                  <Text className="text-primary-foreground font-semibold">Go to Dashboard</Text>
                </Button>
              </Link>
            ) : (
              <Link href="/role-select" asChild>
                <Button size="lg" className="rounded-full px-6">
                  <Text className="text-primary-foreground font-semibold">Login / Register</Text>
                </Button>
              </Link>
            )}
          </View>
        </View>

        {/* Feature cards */}
        <View className="px-6 pb-20 gap-4">
          <View className="grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard
              icon={<Shield size={24} className="text-primary" />}
              title="Anonymous & Secure"
              description="Feedback is stored securely. Counsellors only see comments meant for them."
            />
            <FeatureCard
              icon={<MessageCircle size={24} className="text-secondary" />}
              title="IITM-style Form"
              description="Familiar institutional feedback form with counsellor selection and star ratings."
            />
            <FeatureCard
              icon={<Users size={24} className="text-accent" />}
              title="Role-based Dashboards"
              description="Counsellors, Head Counsellors, and Admins each see exactly what they need."
            />
            <FeatureCard
              icon={<Heart size={24} className="text-destructive" />}
              title="Wellness Insights"
              description="Export PPT, PDF, or Excel reports to continuously improve care."
            />
          </View>
        </View>

        {/* Footer */}
        <View className="mt-auto px-6 py-8 border-t border-border bg-muted">
          <Text className="text-sm text-muted-foreground text-center">
            Wellness Centre Feedback Platform
          </Text>
          <Text className="text-xs text-muted-foreground text-center mt-2">
            Emergency Helpline · Privacy Policy · Terms of Support
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <View className="bg-card rounded-2xl border border-border p-5 gap-3 shadow-sm">
      <View className="w-10 h-10 rounded-xl bg-muted items-center justify-center">{icon}</View>
      <Text className="text-lg font-semibold text-foreground">{title}</Text>
      <Text className="text-sm text-muted-foreground leading-5">{description}</Text>
    </View>
  );
}
