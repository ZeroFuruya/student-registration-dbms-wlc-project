"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="group"
      toastOptions={{
        classNames: {
          toast:
            "group w-full sm:w-[350px] border border-border/40 bg-popover/95 text-popover-foreground shadow-lg backdrop-blur-md rounded-xl p-4 flex items-start gap-3 transition-all duration-300 hover:scale-[1.02]",
          title: "font-medium text-sm",
          description: "text-xs text-muted-foreground",
          actionButton:
            "rounded-md border border-border/40 px-3 py-1 text-xs font-medium hover:bg-accent/10 transition-colors",
          cancelButton:
            "rounded-md px-3 py-1 text-xs text-muted-foreground hover:bg-accent/10",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4 text-green-500" />,
        info: <InfoIcon className="size-4 text-blue-500" />,
        warning: <TriangleAlertIcon className="size-4 text-yellow-500" />,
        error: <OctagonXIcon className="size-4 text-red-500" />,
        loading: <Loader2Icon className="size-4 animate-spin text-muted-foreground" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      position="bottom-right"
      richColors
      closeButton
      {...props}
    />
  )
}

export { Toaster }
