import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 overflow-hidden relative group",
// enhanced transitions
{
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 hover:shadow-lg active:scale-95 transform-gpu",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-105 hover:shadow-lg active:scale-95",
      outline: "border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground hover:scale-105 hover:shadow-md active:scale-95",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105 hover:shadow-md active:scale-95",
      ghost: "text-foreground hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95",
      link: "text-primary underline-offset-4 hover:underline hover:scale-105 active:scale-95",
      google: "bg-card text-card-foreground border border-border hover:bg-muted shadow-sm hover:shadow-md hover:scale-105 active:scale-95",
      premium: "bg-gradient-primary text-primary-foreground hover:scale-105 hover:shadow-glow active:scale-95 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700"
    },
    size: {
      default: "h-10 px-4 py-2 min-w-0",
      sm: "h-9 rounded-md px-3 min-w-0",
      lg: "h-11 rounded-md px-8 min-w-0",
      icon: "h-10 w-10",
      xl: "h-12 rounded-lg px-10 min-w-0"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({
    variant,
    size
  }), className)} ref={ref} {...props}>
        <span className="truncate overflow-hidden text-ellipsis my-0 mx-[6px] px-[14px] py-0">{children}</span>
      </Comp>;
});
Button.displayName = "Button";
export { Button, buttonVariants };