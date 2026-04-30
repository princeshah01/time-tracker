import { AppProviders } from "./providers";
import { RouterProvider } from "react-router-dom";
import { createAppRouter } from "./routes";
import { useAuth } from "@/shared/hooks";
import { Loader } from "lucide-react";
import { PageLoader } from "@/shared/components/loaders";

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
