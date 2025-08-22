//components/ui/Textarea.tsx
//
import * as React from "react";

import { cn } from "@/utils/classname"; // Assuming cn utility exists

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      // Combine base DaisyUI/Tailwind textarea styles with incoming className
      className={cn(
        "textarea textarea-bordered w-full", // DaisyUI base textarea style + full width
        // Add focus, disabled, error states if needed
        // "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
        // "disabled:opacity-50 disabled:cursor-not-allowed",
        className // Allow overriding/extending styles
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
