import { View, ScrollView } from 'react-native';
import { Link, type RelativePathString } from 'expo-router';
import { GraduationCap, Shield, Lock } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';

type RoleCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  loginHref: string;
  registerHref?: string;
};

function RoleCard({ icon, title, description, loginHref, registerHref }: RoleCardProps) {
  return (
    <View className="bg-card rounded-2xl border border-border p-5 gap-3 shadow-sm">
      <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center">
        {icon}
      </View>
      <View className="gap-1">
        <Text className="text-xl font-playfair-display font-semibold text-foreground">{title}</Text>
        <Text className="text-sm text-muted-foreground leading-5">{description}</Text>
      </View>
      <View className="flex-row gap-3 pt-2">
        <Link href={loginHref as RelativePathString} asChild>
          <Button className="flex-1 rounded-xl">
            <Text className="text-primary-foreground font-semibold text-sm">Login</Text>
          </Button>
        </Link>
        {registerHref ? (
          <Link href={registerHref as RelativePathString} asChild>
            <Button variant="outline" className="flex-1 rounded-xl">
              <Text className="text-foreground font-semibold text-sm">Register</Text>
            </Button>
          </Link>
        ) : null}
      </View>
    </View>
  );
}

export default function RoleSelectScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" className="flex-1 bg-background">
      <StatusBar style="auto" />
      <View className="px-6 py-12 max-w-2xl self-center w-full gap-8">
        <View className="gap-3">
          <Text className="text-3xl md:text-4xl font-playfair-display font-bold text-foreground text-center">
            Welcome to Wellness Centre
          </Text>
          <Text className="text-base text-muted-foreground text-center leading-6">
            Choose your portal to continue. Students and Head Admins can register directly; Admin accounts are managed by the institution.
          </Text>
        </View>

        <View className="gap-4">
          <RoleCard
            icon={<GraduationCap size={24} className="text-primary" />}
            title="Student"
            description="Submit feedback, track your wellness, and access self-care tools."
            loginHref="/student-login"
            registerHref="/student-register"
          />
          <RoleCard
            icon={<Shield size={24} className="text-destructive" />}
            title="Head Admin"
            description="Oversee all feedback, analytics, and institutional reports."
            loginHref="/head-login"
            registerHref="/head-register"
          />
          <RoleCard
            icon={<Lock size={24} className="text-emerald-500" />}
            title="Admin"
            description="System administration and user management."
            loginHref="/admin-login"
          />
        </View>
      </View>
    </ScrollView>
  );
}
