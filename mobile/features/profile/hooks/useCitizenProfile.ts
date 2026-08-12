import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import type { RootState } from '@app/store';
import { setCitizen } from '@features/auth/store/authSlice';
import { authApi } from '@services/api';
import { isProfileComplete } from '@utils/profile';
import {
  syncCitizenProfile,
  type SaveProfilePayload,
} from '../utils/profileSync';

export function useCitizenProfile() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const citizen = useSelector((state: RootState) => state.auth.citizen);
  const profileComplete = isProfileComplete(citizen);

  const saveProfile = useCallback(
    async (payload: SaveProfilePayload) => {
      const previous = citizen;
      const updated = await syncCitizenProfile(dispatch, queryClient, payload);
      return {
        updated,
        justCompleted:
          !isProfileComplete(previous) && isProfileComplete(updated),
      };
    },
    [citizen, dispatch, queryClient],
  );

  const refreshProfile = useCallback(async () => {
    const updated = await authApi.getMe();
    dispatch(setCitizen(updated));
    queryClient.setQueryData(['citizen', 'me'], updated);
    return updated;
  }, [dispatch, queryClient]);

  return {
    citizen,
    isProfileComplete: profileComplete,
    saveProfile,
    refreshProfile,
  };
}
