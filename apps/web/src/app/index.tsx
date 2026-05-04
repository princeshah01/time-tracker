import { RouterProvider } from "react-router-dom";

import { AppProviders } from "./providers";
import { createAppRouter } from "./routes";

const router = createAppRouter();

const AppRouter = () => {
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
