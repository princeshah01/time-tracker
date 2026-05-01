import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";

import {
  AuthDivider,
  AuthLayout,
  MicrosoftAuthButton,
  SignInTab,
  SignUpTab,
} from "../_components";

function AuthPage() {
  return (
    <AuthLayout>
      <MicrosoftAuthButton />
      <AuthDivider />

      <Tabs defaultValue="login">
        <TabsList className="grid h-9 w-full grid-cols-2 p-0.5">
          <TabsTrigger value="login" className="text-[12px]">
            Sign in
          </TabsTrigger>
          <TabsTrigger value="signup" className="text-[12px]">
            Sign up
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="mt-4">
          <SignInTab />
        </TabsContent>

        <TabsContent value="signup" className="mt-4">
          <SignUpTab />
        </TabsContent>
      </Tabs>
    </AuthLayout>
  );
}

export default AuthPage;
