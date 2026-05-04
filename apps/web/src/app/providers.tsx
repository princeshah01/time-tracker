import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@workspace/ui/components/sonner";
import { ThemeProvider } from "next-themes";
import { Provider } from "react-redux";

import { store } from "@/app/store";
import { AuthBootstrap } from "./auth-bootstrap";

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" enableSystem attribute="class">
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <AuthBootstrap />
          {children}
          <Toaster />
          <ReactQueryDevtools initialIsOpen={false} />
        </Provider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
