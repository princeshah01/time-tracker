import { RouterProvider } from "react-router-dom";

import { PageLoader } from "@/shared/components/loaders";
import { useAuth } from "@/shared/hooks";
import { AppProviders } from "./providers";
import { createAppRouter } from "./routes";

const router = createAppRouter();

const AppRouter = () => {
  const { isHydrated, isLoading } = useAuth();

  if (!isHydrated || isLoading) {
    return <PageLoader />;
  }

  return <RouterProvider router={router} />;
};

const App = () => {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
};

export { App };
