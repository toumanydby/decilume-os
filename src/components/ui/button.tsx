import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variants = {
      primary:
        "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 border border-indigo-500/30",
      secondary:
        "bg-muted hover:bg-accent text-foreground border border-border",
      outline:
        "border border-border hover:bg-accent text-foreground",
      ghost:
        "hover:bg-accent text-muted-foreground hover:text-foreground",
      danger:
        "bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-600/30",
    };

    const sizes = {
      sm: "h-8 px-2.5 text-xs",
      md: "h-9 px-3.5 text-xs sm:text-sm",
      lg: "h-11 px-5 text-sm sm:text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

