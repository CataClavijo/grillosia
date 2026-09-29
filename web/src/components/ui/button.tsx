import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Botones del sistema de diseno GrillosIA.
 *
 * Tres alturas y nada mas, para que un boton mida lo mismo en todas las
 * paginas: sm 36 px (acciones secundarias dentro de un bloque), md 44 px (el
 * normal, y el minimo tactil) y lg 52 px (la accion principal de una
 * pantalla). Radio de 6 px. Sin sombras.
 *
 *  - default: terracota, la accion principal. Una por pantalla.
 *  - outline: borde fino, para la accion secundaria.
 *  - ghost:   sin borde, para acciones terciarias y de icono.
 *  - link:    texto subrayado.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-transparent font-semibold whitespace-nowrap transition-[background-color,border-color,color,transform] duration-150 ease-[var(--ease-natural)] outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:bg-disabled disabled:text-disabled-foreground disabled:border-transparent aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        outline:
          "border-border-strong bg-transparent text-foreground hover:border-foreground/40 hover:bg-surface-2 aria-expanded:bg-surface-2",
        secondary:
          "bg-surface-2 text-foreground hover:bg-accent aria-expanded:bg-accent",
        ghost:
          "text-foreground/85 hover:bg-surface-2 hover:text-foreground aria-expanded:bg-surface-2",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/15",
        link: "h-auto px-0 text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary",
      },
      size: {
        default: "h-11 px-5 text-[15px]",
        sm: "h-9 px-3.5 text-sm",
        lg: "h-[52px] px-6 text-base",
        xs: "h-7 px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        icon: "size-11",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-9",
        "icon-lg": "size-[52px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
