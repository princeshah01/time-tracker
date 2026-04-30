import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  clearUser,
  setAuthLoading,
  setUser,
} from "@/app/store/slices/user-slice";

export function useAuth() {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.user);

  const { data, isPending, isSuccess, isError, refetch } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      // Simulate an API call to fetch the current user's authentication status
      return null;
    },
    retry: false,
    staleTime: Infinity,
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
