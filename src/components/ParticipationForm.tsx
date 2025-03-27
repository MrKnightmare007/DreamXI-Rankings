import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';

const participationSchema = z.object({
  points: z.number().min(0).max(1000),
  captainName: z.string().min(1, 'Captain name is required'),
  viceCaptainName: z.string().min(1, 'Vice-captain name is required'),
  teamScreenshot: z.string().url('Invalid URL format').optional(),
});

export default function ParticipationForm({ matchId }: { matchId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(participationSchema),
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/participations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, matchId }),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      toast.success('Participation recorded successfully!');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to submit participation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Points Scored
        </label>
        <input
          type="number"
          {...register('points', { valueAsNumber: true })}
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        />
        {errors.points && (
          <p className="text-red-500 text-sm mt-1">{errors.points.message as string}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Captain Name
        </label>
        <input
          {...register('captainName')}
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        />
        {errors.captainName && (
          <p className="text-red-500 text-sm mt-1">{errors.captainName.message as string}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Vice-Captain Name
        </label>
        <input
          {...register('viceCaptainName')}
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        />
        {errors.viceCaptainName && (
          <p className="text-red-500 text-sm mt-1">{errors.viceCaptainName.message as string}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Team Screenshot URL (optional)
        </label>
        <input
          {...register('teamScreenshot')}
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        />
        {errors.teamScreenshot && (
          <p className="text-red-500 text-sm mt-1">{errors.teamScreenshot.message as string}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Participation'}
      </button>
    </form>
  );
}