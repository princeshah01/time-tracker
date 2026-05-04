import { useEffect, useRef } from "react";
import { useAuth } from "@/shared/hooks";
import { PageLoader } from "@/shared/components/loaders";

import {
  clearUser,
  setAuthLoading,
  setUser,
  useAppDispatch,
} from "@/app/store";
import { userService } from "@/features/user/user.service";

export function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;

    async function bootstrapAuth() {
      dispatch(setAuthLoading());

      try {
        const response = await userService.getProfile();

        if (!response.success || !response.data) {
          dispatch(clearUser());
          return;
        }

        dispatch(setUser(response.data));
      } catch {
        dispatch(clearUser());
      }
    }

    void bootstrapAuth();
  }, [dispatch]);

  return null;
}
