// components/ui/loader.tsx

import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  text?: string;
}

/**
 * A reusable full-page loader component.
 */
export function Loader({ className, text }: LoaderProps) {
  return (
    <div className={cn("min-h-screen bg-white flex items-center justify-center", className)}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#41B47D] mx-auto mb-4"></div>
        {text && <p className="text-gray-600">{text}</p>}
      </div>
    </div>
  );
}