import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-md border border-transparent text-sm font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/60 active:translate-y-px disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 gap-1.5 px-4",
        sm: "h-8 gap-1 px-3 text-xs",
        lg: "h-12 gap-2 px-5 text-base",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type BaseProps = VariantProps<typeof buttonVariants> & {
  className?: string;
  asChild?: boolean;
};

type ButtonOwnProps = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>;

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonOwnProps) {
  const classes = cn(buttonVariants({ variant, size, className }));

  if (asChild) {
    const child = React.Children.only(
      (props as { children: React.ReactNode }).children,
    ) as React.ReactElement<{ className?: string }>;
    return React.cloneElement(child, {
      className: cn(classes, child.props.className),
    });
  }

  return (
    <button
      type={(props as React.ButtonHTMLAttributes<HTMLButtonElement>).type ?? "button"}
      data-slot="button"
      className={classes}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    />
  );
}

export { Button, buttonVariants };
export type { ButtonOwnProps as ButtonProps };
