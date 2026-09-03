"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex items-center text-muted-foreground",
  {
    variants: {
      variant: {
        default: "w-full justify-start gap-2 bg-transparent p-0 flex-wrap",
        pill: "w-fit justify-center p-1 bg-[#efe9de]/60 dark:bg-[#181715] border border-[#e6dfd8] dark:border-[#2e2b27] rounded-xl gap-1",
        line: "w-full justify-start gap-1 bg-transparent p-0 rounded-none border-b border-border/40 pb-2 flex-wrap",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap text-[#6c6a64] dark:text-[#a19e95] transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        
        "data-active:bg-white data-active:text-[#141413] data-active:shadow-xs data-active:font-semibold dark:data-active:bg-[#252320] dark:data-active:text-[#faf9f5] dark:data-active:border dark:data-active:border-[#2e2b27]",
        
        "hover:text-[#141413] dark:hover:text-[#faf9f5] hover:bg-black/5 dark:hover:bg-white/5",
        
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      keepMounted
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
