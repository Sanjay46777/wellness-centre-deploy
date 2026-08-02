import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User } from '@/types';
import { adminApi, getErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export function Approvals() {
  const [registrations, setRegistrations] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    adminApi
      .pendingRegistrations()
      .then((res) => {
        setRegistrations(res.registrations);
        setError(null);
      })
      .catch(() => setError('Unable to load pending registrations.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await adminApi.approve(id);
      toast({ title: 'Approved', description: 'Registration approved' });
      load();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: getErrorMessage(err, 'Action failed') });
    }
  };

  const handleReject = async (id: number) => {
    try {
      await adminApi.reject(id);
      toast({ title: 'Rejected', description: 'Registration rejected' });
      load();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: getErrorMessage(err, 'Action failed') });
    }
  };

  return (
    <div className="container-tight section-padding py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-playfair-display text-3xl font-bold md:text-4xl">Pending Approvals</h1>
        <p className="mt-2 text-muted-foreground">Review head counsellor registrations</p>
      </motion.div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Head Counsellor Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            </div>
          ) : error ? (
            <p className="py-8 text-center text-destructive">{error}</p>
          ) : registrations.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No pending registrations.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.full_name}</TableCell>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>{r.phone || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="warning">Pending</Badge>
                    </TableCell>
                    <TableCell>{new Date(r.created_at || '').toLocaleDateString()}</TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleApprove(r.id)}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Approve
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleReject(r.id)} className="text-destructive hover:text-destructive">
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                      </Button>
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
