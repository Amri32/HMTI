"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

// Adapted from shadcn/base-nova; add style variants only when another surface needs them.
function Tabs(props: TabsPrimitive.Root.Props) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />;
}

function TabsList({ className = "", children, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List className={`home-tabs-list ${className}`} {...props}>
      {children}
      <TabsPrimitive.Indicator className="home-tabs-indicator" />
    </TabsPrimitive.List>
  );
}

function TabsTrigger({ className = "", ...props }: TabsPrimitive.Tab.Props) {
  return <TabsPrimitive.Tab className={`home-tabs-trigger ${className}`} {...props} />;
}

function TabsContent({ className = "", ...props }: TabsPrimitive.Panel.Props) {
  return <TabsPrimitive.Panel className={`home-tabs-panel ${className}`} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
