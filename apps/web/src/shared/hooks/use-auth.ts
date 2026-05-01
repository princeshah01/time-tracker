import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  clearUser,
  setAuthLoading,
  setUser,
} from "@/app/store/slices/user-slice";
import { getMe } from "@/features/auth/service/auth-service";

export function useAuth() {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.user);

  const { data, isPending, isSuccess, isError, refetch } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    retry: false,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (isPending) {
      dispatch(setAuthLoading());
      return;
    }

    if (isSuccess) {
      if (data) {
        dispatch(setUser(data));
      } else {
        dispatch(clearUser());
      }
      return;
    }

    if (isError) {
      dispatch(clearUser());
    }
  }, [dispatch, data, isError, isPending, isSuccess]);

  return {
    ...authState,
    permissions: authState.permissions,
    refetchAuth: refetch,
  };
}
