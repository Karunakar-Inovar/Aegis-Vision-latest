"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchOrganization } from "app/utils/organization";
import { ROUTES } from "app/constants";

export default function setupLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const checkOrganization = async () => {
    try {
      setLoading(true);
      const org = await fetchOrganization();
      if (org) {
        router.push(ROUTES.ADMIN.DASHBOARD);
        return;
      } else{
        setLoading(false);
      }
    } catch (error) {
      router.push("/");
    }
  };

  // Log notifications and unreadCount in real time
  useEffect(() => {
    checkOrganization();
  }, []);


    if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  return children;
}
