import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Counsellor } from '@/types';
import { counsellorApi, getErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Pencil, Trash, Plus, Search } from 'lucide-react';

const TEAMS = ['Team A', 'Team B', 'Other'] as const;

const counsellorSchema = z.object({
  name: z.string().min(1),
  designation: z.string().optional(),
  team: z.enum(TEAMS).optional(),
  specialization: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
});

type CounsellorFormData = z.infer<typeof counsellorSchema>;

export function ManageCounsellors() {
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Counsellor | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<CounsellorFormData>({
    resolver: zodResolver(counsellorSchema) as any,
    defaultValues: { team: 'Team A' },
  });

  const load = () => {
    setLoading(true);
    counsellorApi
      .getAll()
      .then((res) => {
        setCounsellors(res.counsellors);
        setError(null);
      })
      .catch(() => setError('Unable to load counsellors.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (editing) {
      reset({
        name: editing.name,
        designation: editing.designation || '',
        team: (editing.team as any) || 'Team A',
        specialization: editing.specialization || '',
        email: editing.email || '',
        is_active: editing.is_active,
      });
    } else {
      reset({ name: '', designation: '', team: 'Team A', specialization: '', email: '', is_active: true });
    }
  }, [editing, reset, dialogOpen]);

  const onSubmit = async (data: CounsellorFormData) => {
    try {
      if (editing) {
        await counsellorApi.update(editing.id, data);
        toast({ title: 'Updated', description: 'Counsellor details updated' });
      } else {
        await counsellorApi.create(data);
        toast({ title: 'Created', description: 'New counsellor added' });
      }
      setDialogOpen(false);
      setEditing(null);
      load();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: getErrorMessage(err, 'Save failed') });
    }
  };

  const filteredCounsellors = useMemo(() => {
    return counsellors.filter((c) => {
      const matchesTeam = teamFilter === 'all' || c.team === teamFilter;
      const matchesSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.designation || '').toLowerCase().includes(search.toLowerCase());
      return matchesTeam && matchesSearch;
    });
  }, [counsellors, teamFilter, search]);

  const handleDelete = async (id: number) => {
    try {
      await counsellorApi.delete(id);
      toast({ title: 'Deleted', description: 'Counsellor removed' });
      load();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: getErrorMessage(err, 'Delete failed') });
    }
  };

  return (
    <div className="container-tight section-padding py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-playfair-display text-3xl font-bold md:text-4xl">Manage Counsellors</h1>
            <p className="mt-2 text-muted-foreground">Add, edit, or remove counsellors</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing(null)}>
                <Plus className="mr-2 h-4 w-4" /> Add Counsellor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit Counsellor' : 'Add Counsellor'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input {...register('name')} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Designation</Label>
                  <Input {...register('designation')} />
                </div>
                <div className="space-y-2">
                  <Label>Team</Label>
                  <Controller
                    name="team"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Team A">Team A</SelectItem>
                          <SelectItem value="Team B">Team B</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Specialization</Label>
                  <Input {...register('specialization')} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" {...register('email')} />
                </div>
                <div className="flex items-center gap-2">
                  <Controller
                    name="is_active"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="is_active"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="is_active">Active (visible to students for feedback)</Label>
                </div>
                <Button type="submit" className="w-full">{editing ? 'Save Changes' : 'Create'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search counsellors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={teamFilter} onValueChange={setTeamFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            <SelectItem value="Team A">Team A</SelectItem>
            <SelectItem value="Team B">Team B</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="mt-6">
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            </div>
          ) : error ? (
            <p className="py-8 text-center text-destructive">{error}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCounsellors.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.designation || '—'}</TableCell>
                    <TableCell>{c.team || '—'}</TableCell>
                    <TableCell>{c.specialization || '—'}</TableCell>
                    <TableCell>{c.email || '—'}</TableCell>
                    <TableCell>{c.is_active ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Link to={`/counsellor/${c.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete counsellor?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(c.id)} className="bg-destructive text-destructive-foreground">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
