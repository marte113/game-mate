//components/ui/Input.tsx
//
import * as React from "react";

import { cn } from "@/utils/classname"; // Assuming cn utility exists for class merging

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      // Combine base DaisyUI/Tailwind input styles with incoming className
      className={cn(
        "input input-bordered w-full", // DaisyUI base input style + full width
        // Add focus, disabled, error states if needed via props or className targeting
        // Example focus style (adjust as needed for your design system)
        // "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
        // Example disabled style
        // "disabled:opacity-50 disabled:cursor-not-allowed",
        className // Allow overriding/extending styles
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };