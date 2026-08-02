import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FEEDBACK_QUESTIONS, type Counsellor } from '@/types';
import { StarRating } from './StarRating';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { feedbackApi, getErrorMessage } from '@/lib/api';

const feedbackSchema = z.object({
  counsellor_id: z.number().int().min(1, 'Select a counsellor'),
  q1_comfort: z.number().min(1).max(5),
  q2_understood: z.number().min(1).max(5),
  q3_time: z.number().min(1).max(5),
  q4_quality: z.number().min(1).max(5),
  q5_respected: z.number().min(1).max(5),
  q6_supported: z.number().min(1).max(5),
  q7_hopeful: z.number().min(1).max(5),
  q8_safe: z.number().min(1).max(5),
  q9_communication: z.number().min(1).max(5),
  q10_overall: z.number().min(1).max(5),
  recommendation: z.enum(['Yes', 'No', 'Maybe']),
  comments: z.string().optional(),
  is_anonymous: z.boolean().default(true),
  respondent_email: z.string().email().optional().or(z.literal('')),
});

export type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
  counsellors: Counsellor[];
  preselectedCounsellorId?: number;
  onSuccess?: () => void;
}

export function FeedbackForm({ counsellors, preselectedCounsellorId, onSuccess }: FeedbackFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema) as any,
    defaultValues: {
      counsellor_id: preselectedCounsellorId || 0,
      recommendation: 'Yes',
      is_anonymous: true,
    },
  });

  const selectedCounsellorId = watch('counsellor_id');
  const isAnonymous = watch('is_anonymous');

  const onSubmit = async (data: FeedbackFormData) => {
    setSubmitting(true);
    try {
      await feedbackApi.submit(data);
      toast({ title: 'Thank you', description: 'Your feedback has been submitted.' });
      reset();
      onSuccess?.();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Submission failed',
        description: getErrorMessage(err, 'Something went wrong.'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-2">
        <Label>Select Counsellor</Label>
        <Select
          value={selectedCounsellorId ? String(selectedCounsellorId) : ''}
          onValueChange={(v) => setValue('counsellor_id', Number(v), { shouldValidate: true })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a counsellor" />
          </SelectTrigger>
          <SelectContent>
            {counsellors.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name} {c.designation ? `— ${c.designation}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.counsellor_id && <p className="text-sm text-destructive">{errors.counsellor_id.message}</p>}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {FEEDBACK_QUESTIONS.map((q) => {
          const key = q.key as keyof FeedbackFormData;
          const value = watch(key as any) || 0;
          return (
            <StarRating
              key={q.key}
              label={q.label}
              value={Number(value)}
              onChange={(v) => setValue(key as any, v, { shouldValidate: true })}
              error={(errors as any)[q.key]?.message}
            />
          );
        })}
      </div>

      <div className="space-y-2">
        <Label>Would you recommend this counsellor?</Label>
        <Select
          value={watch('recommendation')}
          onValueChange={(v) => setValue('recommendation', v as 'Yes' | 'No' | 'Maybe', { shouldValidate: true })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Yes">Yes</SelectItem>
            <SelectItem value="No">No</SelectItem>
            <SelectItem value="Maybe">Maybe</SelectItem>
          </SelectContent>
        </Select>
        {errors.recommendation && <p className="text-sm text-destructive">{errors.recommendation.message}</p>}
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="is_anonymous"
            checked={isAnonymous}
            onCheckedChange={(checked) => setValue('is_anonymous', !!checked, { shouldValidate: true })}
          />
          <div>
            <Label htmlFor="is_anonymous" className="font-medium">Submit anonymously</Label>
            <p className="text-sm text-muted-foreground">Your identity will be hidden from the counsellor.</p>
          </div>
        </div>
        {!isAnonymous && (
          <div className="space-y-2">
            <Label htmlFor="respondent_email">Email (optional)</Label>
            <Input
              id="respondent_email"
              type="email"
              placeholder="student@institution.edu"
              {...register('respondent_email')}
            />
            {errors.respondent_email && (
              <p className="text-sm text-destructive">{errors.respondent_email.message}</p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Comments</Label>
        <Textarea placeholder="Share your experience (optional)" {...register('comments')} />
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Feedback'}
      </Button>
    </form>
  );
}
