import type { ReactNode } from "react";
import { AppChrome } from "@/components/layout/app-chrome";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppChrome>{children}</AppChrome>;
}
