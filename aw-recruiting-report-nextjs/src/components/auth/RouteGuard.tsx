"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";

export const RouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, isUserOnly, isAdmin } = useSession();

  useEffect(() => {
    if (isLoading) return;

    const path = pathname ? pathname.replace(/\/+$/, "") : "";

    // Role 'review' (hoặc bất kỳ role nào không phải 'admin'): Không được vào /deptcontrol và /intern
    if (!isAdmin) {
      if (
        path === "/deptcontrol" ||
        path.startsWith("/deptcontrol/") ||
        path === "/intern" ||
        path.startsWith("/intern/")
      ) {
        router.replace("/candidates");
      }
    }
  }, [pathname, isLoading, isUserOnly, isAdmin, router]);

  return <>{children}</>;
};
