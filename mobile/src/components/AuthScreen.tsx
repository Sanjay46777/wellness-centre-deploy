import { useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Link, type RelativePathString } from 'expo-router';
import { fetch } from 'expo/fetch';
import { Eye, EyeOff, AlertCircle } from 'lucide-react-native';

import { supabase } from '@/client/supabase';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

type Role = 'student' | 'head_counsellor' | 'admin';

type ExtraField = {
  name: string;
  label: string;
  placeholder?: string;
  secure?: boolean;
  required?: boolean;
  autoCapitalize?: 'none' | 'words';
};

type DemoData = {
  email: string;
  password: string;
  full_name?: string;
  student_id?: string;
  phone?: string;
  label: string;
};

type AuthScreenProps = {
  role: Role;
  mode: 'login' | 'register';
  title: string;
  description?: string;
  extraFields?: ExtraField[];
  alternateLink?: { href: string; label: string };
  demoAccount?: { email: string; password: string; label: string };
  demoData?: DemoData;
};

const DASHBOARD_ROUTE: Record<Role, string> = {
  student: '/(app)/student',
  head_counsellor: '/(app)/head',
  admin: '/(app)/admin',
};

function getPasswordStrength(password: string) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

const STRENGTH_LABELS = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
const STRENGTH_COLORS = ['bg-destructive', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-emerald-500'];

const STRENGTH_TEXT_COLORS = [
  'text-destructive',
  'text-orange-500',
  'text-yellow-500',
  'text-lime-500',
  'text-emerald-500',
];

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  visible,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <View className="gap-2">
      <Label className="text-foreground text-sm font-medium">{label}</Label>
      <View className="flex-row items-center gap-2">
        <Input
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          textContentType="password"
          autoComplete="password"
          className="flex-1"
        />
        <Pressable
          onPress={onToggle}
          className="rounded-xl bg-muted p-3 active:bg-muted/80"
          hitSlop={12}
        >
          {visible ? (
            <EyeOff size={18} className="text-muted-foreground" />
          ) : (
            <Eye size={18} className="text-muted-foreground" />
          )}
        </Pressable>
      </View>
    </View>
  );
}

export default function AuthScreen({
  role,
  mode,
  title,
  description,
  extraFields = [],
  alternateLink,
  demoAccount,
  demoData,
}: AuthScreenProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extraValues, setExtraValues] = useState<Record<string, string>>({});

  const resetError = () => setError(null);

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const strengthIndex = Math.max(0, Math.min(passwordStrength - 1, STRENGTH_LABELS.length - 1));

  const validate = () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!password) {
      setError('Please enter your password.');
      return false;
    }
    if (mode === 'register') {
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return false;
      }
      if (passwordStrength < 3) {
        setError('Password is too weak. Add uppercase, lowercase, number, and symbol.');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return false;
      }
      for (const field of extraFields) {
        if (field.required && !extraValues[field.name]?.trim()) {
          setError(`${field.label} is required.`);
          return false;
        }
      }
    }
    return true;
  };

  const verifyRoleAndRedirect = async () => {
    const session = (await supabase.auth.getSession()).data.session;
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', session?.user.id)
      .single();

    if (!profile) {
      await supabase.auth.signOut();
      setError('Unable to load account. Please try again.');
      return;
    }

    if (profile.role !== role) {
      await supabase.auth.signOut();
      setError(
        `This account is registered as ${String(profile.role).replace('_', ' ')}. Please use the correct login portal.`
      );
      return;
    }

    if (profile.status === 'pending') {
      await supabase.auth.signOut();
      setError('Your account is pending admin approval. Please contact your administrator.');
      return;
    }

    if (profile.status === 'rejected') {
      await supabase.auth.signOut();
      setError('Your account has been rejected. Please contact your administrator.');
      return;
    }

    router.replace(DASHBOARD_ROUTE[role] as RelativePathString);
  };

  const handleRegister = async () => {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) {
      setError('Missing Supabase configuration.');
      return;
    }

    const payload: Record<string, unknown> = {
      email: email.trim().toLowerCase(),
      password,
      role,
    };
    for (const field of extraFields) {
      payload[field.name] = extraValues[field.name]?.trim() || '';
    }

    const res = await fetch(`${supabaseUrl}/functions/v1/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify(payload),
    });

    const result = (await res.json()) as {
      success?: boolean;
      error?: string;
      message?: string;
    };
    if (!res.ok || result.error) {
      throw new Error(result.error || 'Registration failed.');
    }
  };

  const handleLogin = async () => {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signInError) {
      throw signInError;
    }
  };

  const applyDemoAccount = () => {
    if (demoData && mode === 'register') {
      setEmail(demoData.email);
      setPassword(demoData.password);
      setConfirmPassword(demoData.password);
      const updated: Record<string, string> = {};
      if (demoData.full_name) updated.full_name = demoData.full_name;
      if (demoData.student_id) updated.student_id = demoData.student_id;
      if (demoData.phone) updated.phone = demoData.phone;
      setExtraValues(updated);
      setError(null);
      return;
    }
    if (!demoAccount) return;
    setEmail(demoAccount.email);
    setPassword(demoAccount.password);
    if (mode === 'register') {
      setConfirmPassword(demoAccount.password);
    }
    setError(null);
  };

  const handleSubmit = async () => {
    resetError();
    if (!validate()) return;

    setLoading(true);
    try {
      if (mode === 'register') {
        await handleRegister();
        await handleLogin();
        await verifyRoleAndRedirect();
        return;
      }
      await handleLogin();
      await verifyRoleAndRedirect();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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
          <View className="gap-2">
            <Text className="text-3xl font-playfair-display font-bold text-foreground">
              {title}
            </Text>
            {description ? (
              <Text className="text-muted-foreground leading-6">
                {description}
              </Text>
            ) : null}
          </View>

          <View className="bg-card rounded-2xl border border-border p-6 gap-5 shadow-sm shadow-black/5">
            <View className="gap-4">
              <View className="gap-2">
                <Label className="text-foreground text-sm font-medium">Email</Label>
                <Input
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@institution.edu"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                  autoComplete="email"
                />
              </View>

              <PasswordInput
                label="Password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                visible={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
              />

              {mode === 'register' && (
                <View className="gap-2">
                  <View className="flex-row items-center gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <View
                        key={i}
                        className={cn(
                          'h-1.5 flex-1 rounded-full',
                          i < passwordStrength ? STRENGTH_COLORS[strengthIndex] : 'bg-muted'
                        )}
                      />
                    ))}
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs text-muted-foreground">
                      Use at least 8 characters with uppercase, lowercase, number, and symbol.
                    </Text>
                    {passwordStrength > 0 && (
                      <Text className={cn('text-xs font-medium', STRENGTH_TEXT_COLORS[strengthIndex])}>
                        {STRENGTH_LABELS[strengthIndex]}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {mode === 'register' && (
                <PasswordInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="••••••••"
                  visible={showConfirm}
                  onToggle={() => setShowConfirm((v) => !v)}
                />
              )}

              {mode === 'login' && (
                <View className="flex-row justify-end">
                  <Link href="/forgot-password">
                    <Text className="text-primary text-sm font-medium">Forgot password?</Text>
                  </Link>
                </View>
              )}

              {extraFields.map((field) => (
                <View key={field.name} className="gap-2">
                  <Label className="text-foreground text-sm font-medium">
                    {field.label}
                    {field.required ? ' *' : ''}
                  </Label>
                  <Input
                    value={extraValues[field.name] || ''}
                    onChangeText={(text) =>
                      setExtraValues((prev) => ({ ...prev, [field.name]: text }))
                    }
                    placeholder={field.placeholder}
                    secureTextEntry={field.secure}
                    autoCapitalize={field.autoCapitalize ?? 'none'}
                  />
                </View>
              ))}
            </View>

            {error ? (
              <Alert icon={AlertCircle} variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            {(demoAccount || demoData) && (
              <Pressable
                onPress={applyDemoAccount}
                className="border border-dashed border-border rounded-xl p-3 items-center active:bg-muted"
              >
                <Text className="text-sm text-muted-foreground">
                  Try a demo account:{' '}
                  <Text className="text-primary font-medium">
                    {mode === 'register' ? demoData?.label : demoAccount?.label}
                  </Text>
                </Text>
              </Pressable>
            )}

            <Button onPress={handleSubmit} disabled={loading} className="rounded-xl">
              <View className="flex-row items-center gap-2">
                {loading && <ActivityIndicator size="small" className="text-primary-foreground" />}
                <Text className="text-primary-foreground font-semibold">
                  {mode === 'register' ? 'Create Account' : 'Sign In'}
                </Text>
              </View>
            </Button>
          </View>

          {alternateLink ? (
            <View className="flex-row justify-center">
              <Link href={alternateLink.href as RelativePathString}>
                <Text className="text-primary text-sm font-medium">{alternateLink.label}</Text>
              </Link>
            </View>
          ) : null}

          <View className="flex-row justify-center">
            <Link href="/role-select">
              <Text className="text-muted-foreground text-sm">Back to role selection</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
