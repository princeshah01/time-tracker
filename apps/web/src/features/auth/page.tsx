import { Link } from "react-router-dom";
import { Button } from "@workspace/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { StackedLogo } from "@/shared/components/stacked-logo";
import { Loader } from "lucide-react";

const AuthPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-105 border border-border rounded-md p-8 space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-start gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <StackedLogo size={16} />
            <span className="text-[14px] font-bold text-foreground tracking-[0.08em] uppercase">
              TimeTracker
            </span>
          </Link>
          <p className="text-[13px] text-muted-foreground">
            Manage work logs, approvals, billing, and project profitability
          </p>
        </div>

        {/* Microsoft */}
        <Button variant="outline" className="w-full h-9 gap-2 text-[13px]">
          {false ? (
            <Loader className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              width="48px"
              height="48px"
            >
              <path
                fill="#ff5722"
                d="M6 6H22V22H6z"
                transform="rotate(-180 14 14)"
              />
              <path
                fill="#4caf50"
                d="M26 6H42V22H26z"
                transform="rotate(-180 34 14)"
              />
              <path
                fill="#ffc107"
                d="M26 26H42V42H26z"
                transform="rotate(-180 34 34)"
              />
              <path
                fill="#03a9f4"
                d="M6 26H22V42H6z"
                transform="rotate(-180 14 34)"
              />
            </svg>
          )}
          Continue with Microsoft
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        {/* Email auth */}
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2 h-9 p-0.5">
            <TabsTrigger value="login" className="text-[12px]">
              Sign in
            </TabsTrigger>
            <TabsTrigger value="signup" className="text-[12px]">
              Sign up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            <div>Sign In Form</div>
          </TabsContent>

          <TabsContent value="signup" className="mt-4">
            <div>Sign Up Form</div>
          </TabsContent>
        </Tabs>

        <p className="text-left text-[11px] text-muted-foreground pt-2">
          © {new Date().getFullYear()} TimeTracker. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export { AuthPage };
