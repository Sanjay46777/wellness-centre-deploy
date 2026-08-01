import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, XCircle, User } from 'lucide-react-native';

import { supabase } from '@/client/supabase';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import type { Profile } from '@/types';

export default function AdminApprovalsScreen() {
  const router = useRouter();
  const [pending, setPending] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [processing, setProcessing] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'head_counsellor')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    setPending((data as Profile[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (!selected) return;
    setProcessing(true);
    await supabase.from('profiles').update({ status }).eq('id', selected.id);
    setProcessing(false);
    setAction(null);
    setSelected(null);
    load();
  };

  const openDialog = (profile: Profile, type: 'approve' | 'reject') => {
    setSelected(profile);
    setAction(type);
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" className="flex-1 bg-background">
      <View className="px-6 py-12 gap-6 max-w-3xl self-center w-full">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} className="p-2 rounded-full bg-muted active:opacity-70">
            <ArrowLeft size={20} className="text-foreground" />
          </Pressable>
          <View>
            <Text className="text-sm text-muted-foreground uppercase tracking-wide">Administration</Text>
            <Text className="text-2xl font-playfair-display font-bold text-foreground">Head Admin Approvals</Text>
          </View>
        </View>

        {loading ? (
          <Text className="text-muted-foreground">Loading pending requests...</Text>
        ) : pending.length === 0 ? (
          <View className="bg-card rounded-2xl border border-border p-8 items-center gap-3 shadow-sm">
            <CheckCircle2 size={48} className="text-emerald-500" />
            <Text className="text-lg font-semibold text-foreground">No pending requests</Text>
            <Text className="text-sm text-muted-foreground text-center">
              All head admin registrations have been reviewed.
            </Text>
          </View>
        ) : (
          <View className="gap-4">
            {pending.map((p) => (
              <View
                key={p.id}
                className="bg-card rounded-2xl border border-border p-5 gap-4 shadow-sm"
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
                    <User size={24} className="text-primary" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-foreground">
                      {p.full_name || 'Unnamed'}
                    </Text>
                    <Text className="text-sm text-muted-foreground">{p.email}</Text>
                    {p.phone ? <Text className="text-sm text-muted-foreground">{p.phone}</Text> : null}
                  </View>
                </View>

                <View className="flex-row gap-3">
                  <Button
                    onPress={() => openDialog(p, 'approve')}
                    className="flex-1 rounded-xl bg-emerald-600"
                  >
                    <View className="flex-row items-center gap-2">
                      <CheckCircle2 size={18} className="text-white" />
                      <Text className="text-white font-semibold">Approve</Text>
                    </View>
                  </Button>
                  <Button
                    variant="outline"
                    onPress={() => openDialog(p, 'reject')}
                    className="flex-1 rounded-xl border-destructive"
                  >
                    <View className="flex-row items-center gap-2">
                      <XCircle size={18} className="text-destructive" />
                      <Text className="text-destructive font-semibold">Reject</Text>
                    </View>
                  </Button>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <AlertDialog open={!!action} onOpenChange={() => setAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === 'approve' ? 'Approve Head Admin' : 'Reject Head Admin'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === 'approve'
                ? `Are you sure you want to approve ${selected?.full_name || selected?.email}? They will be able to sign in.`
                : `Are you sure you want to reject ${selected?.full_name || selected?.email}? They will not be able to sign in.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>Cancel</Text>
            </AlertDialogCancel>
            <AlertDialogAction
              onPress={() => handleAction(action === 'approve' ? 'approved' : 'rejected')}
              disabled={processing}
            >
              <Text className={action === 'approve' ? 'text-emerald-600' : 'text-destructive'}>
                {action === 'approve' ? 'Approve' : 'Reject'}
              </Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ScrollView>
  );
}
