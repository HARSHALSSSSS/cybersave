import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createHomeBanner,
  deleteHomeBanner,
  listHomeBanners,
  reorderHomeBanners,
  updateHomeBanner,
  type CreateHomeBannerPayload,
  type UpdateHomeBannerPayload,
} from '../services/home-banners.api';

export const homeBannersQueryKey = ['home-banners'] as const;

export function useHomeBanners(placement?: string) {
  return useQuery({
    queryKey: [...homeBannersQueryKey, placement ?? 'all'],
    queryFn: () => listHomeBanners(placement),
  });
}

export function useCreateHomeBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateHomeBannerPayload) => createHomeBanner(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homeBannersQueryKey });
      toast.success('Banner created');
    },
    onError: () => toast.error('Failed to create banner'),
  });
}

export function useUpdateHomeBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateHomeBannerPayload }) =>
      updateHomeBanner(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homeBannersQueryKey });
      toast.success('Banner updated');
    },
    onError: () => toast.error('Failed to update banner'),
  });
}

export function useDeleteHomeBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteHomeBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homeBannersQueryKey });
      toast.success('Banner deleted');
    },
    onError: () => toast.error('Failed to delete banner'),
  });
}

export function useReorderHomeBanners() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) => reorderHomeBanners(orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homeBannersQueryKey });
      toast.success('Banner order updated');
    },
  });
}
