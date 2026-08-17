import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createScheme,
  deleteScheme,
  listAdminSchemes,
  updateScheme,
  type SchemePayload,
} from '../services/schemes.api';

export const schemesQueryKey = ['admin-schemes'] as const;

export function useAdminSchemes() {
  return useQuery({
    queryKey: schemesQueryKey,
    queryFn: listAdminSchemes,
  });
}

export function useCreateScheme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SchemePayload) => createScheme(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schemesQueryKey });
      toast.success('Scheme published on web and mobile');
    },
    onError: () => toast.error('Failed to create scheme'),
  });
}

export function useUpdateScheme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<SchemePayload> }) =>
      updateScheme(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schemesQueryKey });
      toast.success('Scheme updated');
    },
    onError: () => toast.error('Failed to update scheme'),
  });
}

export function useDeleteScheme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteScheme(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schemesQueryKey });
      toast.success('Scheme removed');
    },
    onError: () => toast.error('Failed to delete scheme'),
  });
}
