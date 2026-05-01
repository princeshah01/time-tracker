import { Button } from "@workspace/ui/components/button";
import { Loader } from "lucide-react";
import { authClient } from "@/auth-client";

function MicrosoftAuthButton() {

  const isLoading = false;
  async function handleSignInWithMicrosoft() {
    await authClient.signIn.social({
      provider: "microsoft",
      callbackURL:"http://localhost:5173/dashboard",
    })
  }

  return (
    <Button onClick={handleSignInWithMicrosoft} disabled={isLoading}  variant="outline" className="h-9 w-full gap-2 text-[13px]">
     {isLoading ? <Loader className="size-12 animate-spin"/>  : ( <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width="18"
        height="18"
        aria-hidden="true"
      >
        <path fill="#ff5722" d="M6 6H22V22H6z" transform="rotate(-180 14 14)" />
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
      </svg>)}
      Continue with Microsoft
    </Button>
  );
}

export { MicrosoftAuthButton };
