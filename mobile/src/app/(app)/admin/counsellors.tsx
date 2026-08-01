import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/client/supabase';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Plus, Save, User, Pencil, Trash2 } from 'lucide-react-native';
import type { Counsellor } from '@/types';

export default function ManageCounsellorsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', designation: '', specialization: '', email: '' });
  const [editing, setEditing] = useState<Counsellor | null>(null);
  const [editForm, setEditForm] = useState({ name: '', designation: '', specialization: '', email: '', is_active: true });
  const [deleting, setDeleting] = useState<Counsellor | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from('counsellors').select('*').order('name');
    setCounsellors((data as Counsellor[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (c: Counsellor) => {
    await supabase.from('counsellors').update({ is_active: !c.is_active }).eq('id', c.id);
    setCounsellors((prev) => prev.map((x) => (x.id === c.id ? { ...x, is_active: !x.is_active } : x)));
  };

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const { data } = await supabase
      .from('counsellors')
      .insert({
        name: form.name.trim(),
        designation: form.designation.trim() || null,
        specialization: form.specialization.trim() || null,
        email: form.email.trim() || null,
      })
      .select()
      .single();
    setSaving(false);
    if (data) {
      setCounsellors((prev) => [...prev, data as Counsellor]);
      setForm({ name: '', designation: '', specialization: '', email: '' });
    }
  };

  const openEdit = (c: Counsellor) => {
    setEditing(c);
    setEditForm({
      name: c.name,
      designation: c.designation ?? '',
      specialization: c.specialization ?? '',
      email: c.email ?? '',
      is_active: c.is_active,
    });
    setError(null);
  };

  const handleEdit = async () => {
    if (!editing || !editForm.name.trim()) return;
    setSaving(true);
    setError(null);
    const { data, error: updateError } = await supabase
      .from('counsellors')
      .update({
        name: editForm.name.trim(),
        designation: editForm.designation.trim() || null,
        specialization: editForm.specialization.trim() || null,
        email: editForm.email.trim() || null,
        is_active: editForm.is_active,
      })
      .eq('id', editing.id)
      .select()
      .single();
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    if (data) {
      setCounsellors((prev) => prev.map((x) => (x.id === editing.id ? (data as Counsellor) : x)));
      setEditing(null);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    const { error: deleteError } = await supabase.from('counsellors').delete().eq('id', deleting.id);
    setSaving(false);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setCounsellors((prev) => prev.filter((x) => x.id !== deleting.id));
    setDeleting(null);
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" className="flex-1 bg-background">
      <View className="px-4 py-8 items-center">
        <View style={{ width: Math.min(width - 32, 800) }}>
          <View className="flex-row items-center gap-3 mb-6">
            <Pressable onPress={() => router.back()} className="p-2 rounded-full bg-muted active:opacity-70">
              <ArrowLeft size={20} className="text-foreground" />
            </Pressable>
            <View>
              <Text className="text-sm text-muted-foreground uppercase tracking-wide">Administration</Text>
              <Text className="text-2xl font-playfair-display font-bold text-foreground">Manage Counsellors</Text>
            </View>
          </View>

          <View className="bg-card rounded-2xl border border-border p-5 gap-4 shadow-sm mb-6">
            <Text className="text-lg font-semibold text-foreground">Add Counsellor</Text>
            <View className="gap-2">
              <Label>Name</Label>
              <Input value={form.name} onChangeText={(t) => setForm((f) => ({ ...f, name: t }))} placeholder="Dr. Name" className="bg-background" />
            </View>
            <View className="gap-2">
              <Label>Designation</Label>
              <Input value={form.designation} onChangeText={(t) => setForm((f) => ({ ...f, designation: t }))} placeholder="Senior Counsellor / Team A" className="bg-background" />
            </View>
            <View className="gap-2">
              <Label>Specialization</Label>
              <Input value={form.specialization} onChangeText={(t) => setForm((f) => ({ ...f, specialization: t }))} placeholder="Anxiety, Stress Management" className="bg-background" />
            </View>
            <View className="gap-2">
              <Label>Email</Label>
              <Input value={form.email} onChangeText={(t) => setForm((f) => ({ ...f, email: t }))} placeholder="counsellor@institution.edu" className="bg-background" />
            </View>
            <Button disabled={saving} onPress={handleAdd} className="flex-row items-center gap-2 rounded-full">
              <Plus size={18} className="text-primary-foreground" />
              <Text>{saving ? 'Saving...' : 'Add Counsellor'}</Text>
            </Button>
          </View>

          <View className="bg-card rounded-2xl border border-border p-5 gap-3 shadow-sm">
            <Text className="text-lg font-semibold text-foreground mb-2">Counsellor Directory</Text>
            {loading ? (
              <Text className="text-muted-foreground">Loading...</Text>
            ) : (
              counsellors.map((c) => (
                <View key={c.id} className="flex-row items-center gap-3 p-3 rounded-xl bg-muted">
                  <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                    <User size={18} className="text-primary" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground">{c.name}</Text>
                    <Text className="text-xs text-muted-foreground">{c.designation}</Text>
                    {c.email ? <Text className="text-xs text-muted-foreground">{c.email}</Text> : null}
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Checkbox checked={c.is_active} onCheckedChange={() => toggleActive(c)} />
                    <Text className="text-xs text-muted-foreground">Active</Text>
                  </View>
                  <Pressable onPress={() => openEdit(c)} className="p-2 rounded-full bg-background active:opacity-70">
                    <Pencil size={16} className="text-foreground" />
                  </Pressable>
                  <Pressable onPress={() => setDeleting(c)} className="p-2 rounded-full bg-destructive/10 active:opacity-70">
                    <Trash2 size={16} className="text-destructive" />
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </View>
      </View>

      <Dialog open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Counsellor</DialogTitle>
            <DialogDescription>Update {editing?.name ?? ''}'s details.</DialogDescription>
          </DialogHeader>
          <View className="gap-3">
            <View className="gap-2">
              <Label>Name</Label>
              <Input value={editForm.name} onChangeText={(t) => setEditForm((f) => ({ ...f, name: t }))} />
            </View>
            <View className="gap-2">
              <Label>Designation</Label>
              <Input value={editForm.designation} onChangeText={(t) => setEditForm((f) => ({ ...f, designation: t }))} />
            </View>
            <View className="gap-2">
              <Label>Specialization</Label>
              <Input value={editForm.specialization} onChangeText={(t) => setEditForm((f) => ({ ...f, specialization: t }))} />
            </View>
            <View className="gap-2">
              <Label>Email</Label>
              <Input value={editForm.email} onChangeText={(t) => setEditForm((f) => ({ ...f, email: t }))} />
            </View>
            <View className="flex-row items-center gap-2">
              <Checkbox checked={editForm.is_active} onCheckedChange={(checked) => setEditForm((f) => ({ ...f, is_active: !!checked }))} />
              <Text className="text-sm text-foreground">Active</Text>
            </View>
            {error ? <Text className="text-destructive text-sm">{error}</Text> : null}
          </View>
          <DialogFooter>
            <Button onPress={handleEdit} disabled={saving} className="flex-row items-center gap-2 rounded-full">
              <Save size={16} className="text-primary-foreground" />
              <Text className="text-primary-foreground">{saving ? 'Saving...' : 'Save Changes'}</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => { if (!open) setDeleting(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name ?? ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the counsellor and all their feedback records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onPress={() => setDeleting(null)}>
              <Text>Cancel</Text>
            </AlertDialogCancel>
            <AlertDialogAction onPress={handleDelete} className="bg-destructive">
              <Text className="text-destructive-foreground">{saving ? 'Deleting...' : 'Delete'}</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ScrollView>
  );
}
