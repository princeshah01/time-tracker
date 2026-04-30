import { Loader } from "lucide-react";

export const PageLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader className="animate-spin text-secondary-foreground" size={18} />
    </div>
  );
};
