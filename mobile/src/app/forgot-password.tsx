import { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Link } from 'expo-router';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { supabase } from '@/client/supabase';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setError(null);
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    const redirectTo = process.env.EXPO_PUBLIC_APP_URL
      ? `${process.env.EXPO_PUBLIC_APP_URL}/reset-password`
      : undefined;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    setLoading(false);
    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="flex-grow justify-center px-6 py-12"
      >
        <View className="max-w-md w-full self-center gap-6">
          <View className="w-14 h-14 rounded-2xl bg-primary/10 items-center justify-center self-center">
            <Mail size={28} className="text-primary" />
          </View>

          <View className="gap-2 text-center">
            <Text className="text-3xl font-playfair-display font-bold text-foreground text-center">
              Reset Password
            </Text>
            <Text className="text-muted-foreground text-center leading-6">
              Enter your email and we'll send you a link to reset your password.
            </Text>
          </View>

          {sent ? (
            <View className="bg-accent/10 border border-accent/20 rounded-2xl p-6 gap-4 items-center">
              <CheckCircle2 size={40} className="text-accent" />
              <Text className="text-foreground text-center font-semibold">Check your inbox</Text>
              <Text className="text-muted-foreground text-center text-sm">
                If an account exists for {email}, a password reset email has been sent.
              </Text>
            </View>
          ) : (
            <>
              <View className="gap-2">
                <Text className="text-sm font-medium text-foreground">Email</Text>
                <Input
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@institution.edu"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {error ? (
                <View className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <Text className="text-sm text-destructive">{error}</Text>
                </View>
              ) : null}

              <Button onPress={handleSend} disabled={loading} className="rounded-xl">
                <Text className="text-primary-foreground font-semibold">Send Reset Email</Text>
              </Button>
            </>
          )}

          <Link href="/role-select">
            <View className="flex-row items-center justify-center gap-2">
              <ArrowLeft size={16} className="text-muted-foreground" />
              <Text className="text-muted-foreground text-sm text-center">Back to role selection</Text>
            </View>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
