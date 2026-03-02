"use client";

import { StakeholderLayout, Snackbar, useSnackbar } from "ui";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, logout, normalizeUserRole } from "app/utils/auth";
import { UI_MESSAGES, USER_ROLES } from "app/constants";

export default function StakeholderLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const snackbar = useSnackbar();

  useEffect(() => {
    const expectedRole = normalizeUserRole(USER_ROLES.STAKEHOLDER);
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      router.push("/");
      return;
    }
    if (normalizeUserRole(currentUser.role) !== expectedRole) {
      router.push("/");
      return;
    }
    setUser(currentUser);
    setLoading(false);
  }, [router]);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      snackbar.success(result.message || UI_MESSAGES.auth.logoutSuccess);
    } else {
      snackbar.error(result.message || UI_MESSAGES.auth.logoutFailed);
    }
    router.push("/");
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <StakeholderLayout
      currentPath={pathname}
      userName={user.name}
      userEmail={user.email}
      onLogout={handleLogout}
      logoutLabel={UI_MESSAGES.auth.logoutAction}
      userMenuTitle={UI_MESSAGES.auth.userMenuTitle}
    >
      {children}
      <Snackbar
        visible={snackbar.state.visible}
        message={snackbar.state.message}
        variant={snackbar.state.variant}
        onClose={snackbar.hide}
      />
    </StakeholderLayout>
  );
}

