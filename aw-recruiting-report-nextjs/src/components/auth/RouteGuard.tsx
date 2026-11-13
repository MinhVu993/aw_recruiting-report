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

    // 1. Role 'user': Chỉ được phép truy cập /resign và /template-print/resign
    if (isUserOnly) {
      const isResignRoute = path === "/resign" || path.startsWith("/template-print/resign");
      if (!isResignRoute) {
        router.replace("/resign");
      }
      return;
    }

    // 2. Role 'review' (hoặc bất kỳ role nào không phải 'admin'): Không được vào /deptcontrol và /intern
    if (!isAdmin) {
      if (
        path === "/deptcontrol" ||
        path.startsWith("/deptcontrol/") ||
        path === "/intern" ||
        path.startsWith("/intern/")
      ) {
        router.replace("/");
      }
    }
  }, [pathname, isLoading, isUserOnly, isAdmin, router]);

  return <>{children}</>;
};
