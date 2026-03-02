"use client";

import { useState, useEffect, useMemo } from "react";
import {
  fetchUsers,
  deleteUser,
  toggleUserStatus,
  User,
  createUser,
  updateUser,
  inviteUser,
} from "app/utils/user";
import { fetchRoles, type Role } from "app/utils/roles";
import {
  Card,
  CardContent,
  Button,
  Icon,
  Badge,
  Input,
  StatsCard,
  ToggleSwitch,
  Label,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  useSnackbar,
  Snackbar,
} from "ui";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Upload,
  Shield,
  Clock,
  Mail,
  UserPlus,
} from "ui/utils/icons";
import { MomentUtils, useDebounce } from "app";
import { STATUS, USER_ROLES } from "app/constants";
import { UI_MESSAGES } from "app/constants";

const getRoleBadge = (role: string) => {
  switch (role) {
    case USER_ROLES.ADMINISTRATOR:
      return (
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800"
        >
          <Icon icon={Shield} className="h-3 w-3 mr-1" />
          {role}
        </Badge>
      );
    case USER_ROLES.EXECUTIVE:
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
        >
          {role}
        </Badge>
      );
    case USER_ROLES.SUPERVISOR:
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700"
        >
          {role}
        </Badge>
      );
       case USER_ROLES.MONITOR:
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700"
          >
            {role}
          </Badge>
        );
    default:
      return null;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case STATUS.ACTIVE:
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
        >
          {status}
        </Badge>
      );
    case STATUS.PENDING:
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
        >
          {status}
        </Badge>
      );
    case STATUS.INACTIVE:
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700"
        >
          {status}
        </Badge>
      );
    default:
      return null;
  }
};

type FilterType = "all" | "active" | "Administrator"  | "pending";

// Initial form states
const initialState = {
  name: false,
  email: false,
  role: false,
};

const initialUserForm = {
  name: "",
  email: "",
  role: "",
};

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery);
  const [users, setUsers] = useState<User[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const snackbar = useSnackbar();

  // Modal states - unified
  const [modal, setModal] = useState<
    "add" | "edit" | "delete" | "invite" | null
  >(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Unified form state for both Add and Edit
  const [form, setForm] = useState(initialUserForm);
  const [touched, setTouched] = useState(initialState);

  // Unified options state
  const [options, setOptions] = useState({
    roles: [] as { value: string; label: string }[],
  });

  // Unified loading state
  const [loading, setLoading] = useState({
    users: true,
    options: true,
  });

  // Unified validation using useMemo
  const errors = useMemo(
    () => ({
      name:
      touched.name && !form.name
          ? UI_MESSAGES.users.nameRequired
          : touched.name && form.name.length < 2
          ? UI_MESSAGES.users.nameTooShort
          : "",
          email:
          touched.email && !form.email
          ? UI_MESSAGES.users.emailRequired
          : touched.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email)
            ? UI_MESSAGES.users.emailInvalid
            : "",
      role: touched.role && !form.role ? UI_MESSAGES.users.roleRequired : "",
    }),
    [form, touched, modal],
  );

  const isFormValid = useMemo(() => {
    if (modal === "add") {
      return (
        Object.values(errors).every((err) => !err) &&
        form.name &&
        form.email &&
        form.role
      );
    } else if (modal === "edit") {
      return (
        Object.values(errors).every((err) => !err) &&
        form.name &&
        form.email &&
        form.role
      );
    }
    return false;
  }, [errors, form, modal]);

  // Load users
  const loadUsers = async () => {
    try {
      setLoading((l) => ({ ...l, users: true }));
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      setUsers([]);
    } finally {
      setLoading((l) => ({ ...l, users: false }));
    }
  };

  // Fetch users from API on mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Load all options (roles) in parallel
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading((l) => ({ ...l, options: true }));
        const roles = await fetchRoles();

        setOptions({
          roles: roles.map((r) => ({ value: r.id, label: r.name })),
        });
      } catch (error) {
        snackbar.error(UI_MESSAGES.users.loadRolesFailed);
      } finally {
        setLoading((l) => ({ ...l, options: false }));
      }
    };

    loadOptions();
  }, []);

  // Calculate stats
  const totalUsers = users.length;
  const administratorUsers = users.filter(
    (u) => u.rolename === USER_ROLES.ADMINISTRATOR,
  ).length;

  // Calculate active users (lastActiveAt is today)
  const activeUsers = useMemo(() => {
    const today = new Date();
    return users.filter((u) => {
      const isActive = MomentUtils.isSameDay(
        u.lastActiveAt || u.createdAt,
        today,
      );
      return isActive;
    }).length;
  }, [users]);

  // Filter users based on search and active filter
  const filteredUsers = users.filter((user) => {
    // Search filter
    const matchesSearch =
      user.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      user.rolename.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

    // Quick filter
    let matchesFilter = true;
    if (activeFilter === USER_ROLES.ADMINISTRATOR) {
      matchesFilter = user.rolename === USER_ROLES.ADMINISTRATOR;
    }
    return matchesSearch && matchesFilter;
  });

  // Unified modal opener
  const openModal = (
    type: "add" | "edit" | "delete" | "invite",
    user?: User,
  ) => {
    setModal(type);
    setSelectedUser(user || null);

    if (type === "edit" && user) {
      // Find the role ID from options
      const roleOption = options.roles.find((r) => r.label === user.rolename);
      setForm({
        name: user.name || "",
        email: user.email || "",
        role: roleOption?.value || "",
      });
    } else if (type === "add") {
      setForm(initialUserForm);
    }

    setTouched(initialState);
  };

  // Unified Add/Edit handler
  const handleSubmitUser = async () => {
    setTouched({ name: true, email: true, role: true });

    if (!isFormValid) {
      snackbar.error(UI_MESSAGES.users.validationErrors);
      return;
    }
    if (submitting) return;
    setSubmitting(true);

    try {
      if (modal === "edit" && selectedUser) {
        const updatedUser = await updateUser(selectedUser.userid, {
          name: form.name,
          email: form.email,
          roleId: Number(form.role),
        });

        // Update user in local state without full reload
        setUsers((prev) =>
          prev.map((u) =>
            u.userid === selectedUser.userid
              ? {
                  ...u,
                  name: form.name,
                  email: form.email,
                  rolename:
                    options.roles.find((r) => r.value === form.role)?.label ||
                    u.rolename,
                }
              : u,
          ),
        );

        snackbar.success(UI_MESSAGES.users.updateSuccess(form.name));
      } else if (modal === "add") {
        const newUser = await createUser({
          name: form.name,
          email: form.email,
          roleId: Number(form.role),
        });

        // Add new user to local state without full reload
        loadUsers();
        setUsers([]);

        snackbar.success(UI_MESSAGES.users.createSuccess(form.name));
      }
      setModal(null);
      setForm(initialUserForm);
      setTouched(initialState);
    } catch (error) {
      snackbar.error(
        error instanceof Error ? error.message : UI_MESSAGES.users.createFailed(`${modal}`),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (user: User) => {
    openModal("delete", user);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.userid);
      snackbar.success(UI_MESSAGES.users.deleteSuccess(selectedUser.name));
      setUsers((prev) => prev.filter((u) => u.userid !== selectedUser.userid));
      setModal(null);
      setSelectedUser(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      snackbar.error(UI_MESSAGES.users.deleteFailed);
      setModal(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              User Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage users and their permissions
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              className="flex-1 sm:flex-initial"
              onPress={() => openModal("add")}
            >
              <Icon icon={UserPlus} className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </div>
        </div>

        {/* Bulk Upload Promo Card */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-4 text-[#060b13]">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg border bg-background">
              <Icon icon={Upload} className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Bulk User Upload
                </h3>
                <Badge variant="outline" className="text-xs">
                  Coming Soon
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Import users at scale via CSV files
              </p>
            </div>
          </div>
          <Button variant="outline" className="h-9 px-4 w-full sm:w-auto">
            Request Access
          </Button>
        </div>

        {/* Stats Cards - Quick Filters */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => setActiveFilter("all")}
            className="text-left transition-transform active:scale-95 cursor-pointer"
          >
            <StatsCard
              label="Total Users"
              value={totalUsers}
              color={activeFilter === "all" ? "blue" : "default"}
              className={
                activeFilter === "all"
                  ? "ring-2 ring-primary ring-offset-2"
                  : ""
              }
            />{" "}
          </button>
          <button
            onClick={() =>
              setActiveFilter(activeFilter === "active" ? "all" : "active")
            }
            className="text-left transition-transform active:scale-95 cursor-pointer"
          >
            <StatsCard
              label="Today Active"
              value={activeUsers}
              color="green"
              className={
                activeFilter === "active"
                  ? "ring-2 ring-green-500 ring-offset-2"
                  : ""
              }
            />
          </button>
          <button
            onClick={() =>
              setActiveFilter(activeFilter === USER_ROLES.ADMINISTRATOR ? "all" : USER_ROLES.ADMINISTRATOR)
            }
            className="text-left transition-transform active:scale-95 cursor-pointer"
          >
            <StatsCard
              label="Administrators"
              value={administratorUsers}
              color="purple"
              className={
                activeFilter === USER_ROLES.ADMINISTRATOR
                  ? "ring-2 ring-purple-500 ring-offset-2"
                  : ""
              }
            />
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-md">
          <Icon
            icon={Search}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="pl-10 w-full"
          />
        </div>

        {/* User Cards */}
        <div className="space-y-4">
          {loading.users && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Loading users...
              </CardContent>
            </Card>
          )}
          {!loading.users && filteredUsers.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No users found matching your search
              </CardContent>
            </Card>
          )}
          {filteredUsers.map((user) => (
            <Card key={user.userid} className="overflow-hidden">
              {/* @ts-ignore */}
              <CardContent className="p-4 sm:p-6">
                {/* @ts-ignore */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Left side - User info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-primary">
                        {user.avatar || user?.name?.slice(0, 1)}
                      </span>
                    </div>

                    {/* User Details */}
                    <div className="flex-1 space-y-3 min-w-0">
                      {/* Name and Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-foreground">
                          {user.name}
                        </h3>
                        {getRoleBadge(user.rolename)}
                        {getStatusBadge(user.status)}
                      </div>

                      {/* Email and Last Active - Single Row for Desktop/Tablet */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon
                            icon={Mail}
                            className="h-4 w-4 text-muted-foreground flex-shrink-0"
                          />
                          <span className="text-sm text-muted-foreground truncate">
                            {user.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon
                            icon={Clock}
                            className="h-4 w-4 text-muted-foreground flex-shrink-0"
                          />
                          <span className="text-sm text-muted-foreground">
                            Last active:{" "}
                            {MomentUtils.formatDateTime(
                              user.lastActiveAt || user.createdAt,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Action buttons */}
                  <div className="flex items-center gap-3 flex-shrink-0 flex-wrap sm:flex-nowrap">
                    <div className="h-6 w-px bg-border" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onPress={() => openModal("edit", user)}
                    >
                      <Icon
                        icon={Pencil}
                        className="h-4 w-4 text-muted-foreground"
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onPress={() => handleDelete(user)}
                    >
                      <Icon icon={Trash2} className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add User Modal */}
        <Dialog
          open={modal === "add"}
          onOpenChange={(open) => !open && setModal(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite User</DialogTitle>
              <DialogDescription>
                Send an invitation to join the platform
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Name */}
              <div className="space-y-2">
                <Label>
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="user-name"
                  placeholder="e.g., John Doe"
                  value={form.name}
                  onChangeText={(text) => setForm({ ...form, name: text })}
                  onBlur={() => setTouched({ ...touched, name: true })}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label>
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="user-email"
                  placeholder="e.g., john.doe@company.com"
                  value={form.email}
                  onChangeText={(text) => setForm({ ...form, email: text })}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label>
                  Role <span className="text-red-500">*</span>
                </Label>
                {loading.options ? (
                  <div className="h-10 rounded-lg border border-input bg-muted animate-pulse" />
                ) : (
                  <Select
                    value={form.role}
                    onValueChange={(value) => {
                      setForm({ ...form, role: value });
                      setTouched({ ...touched, role: true });
                    }}
                  >
                    <SelectTrigger
                      className={errors.role ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.roles.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.role && (
                  <p className="text-xs text-red-500">{errors.role}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onPress={() => setModal(null)}>
                Cancel
              </Button>
              <Button
                onPress={handleSubmitUser}
                disabled={!isFormValid || submitting}
              >
                {submitting ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Modal */}
        <Dialog
          open={modal === "edit"}
          onOpenChange={(open) => !open && setModal(null)}
        >
          <DialogContent
            key={`edit-modal-${selectedUser?.userid || "new"}`}
            className="sm:max-w-md"
          >
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and role
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Name */}
              <div className="space-y-2">
                <Label>
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-user-name"
                  placeholder="e.g., John Doe"
                  value={form.name}
                  onChangeText={(text) => setForm({ ...form, name: text })}
                  onBlur={() => setTouched({ ...touched, name: true })}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label>
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-user-email"
                  placeholder="e.g., john.doe@company.com"
                  value={form.email}
                  onChangeText={(text) => setForm({ ...form, email: text })}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label>
                  Role <span className="text-red-500">*</span>
                </Label>
                {loading.options ? (
                  <div className="h-10 rounded-lg border border-input bg-muted animate-pulse" />
                ) : (
                  <Select
                    value={form.role}
                    onValueChange={(value) => {
                      setForm({ ...form, role: value });
                      setTouched({ ...touched, role: true });
                    }}
                  >
                    <SelectTrigger
                      className={errors.role ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.roles.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.role && (
                  <p className="text-xs text-red-500">{errors.role}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onPress={() => setModal(null)}>
                Cancel
              </Button>
              <Button
                onPress={handleSubmitUser}
                disabled={!isFormValid || submitting}
              >
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={modal === "delete"}
          onOpenChange={(open) => !open && setModal(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedUser?.name}"? This
                action cannot be undone. All user data and access permissions
                will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
              <Button variant="outline" onPress={() => setModal(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onPress={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Icon icon={Trash2} className="h-4 w-4 mr-2" />
                Delete User
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
      <Snackbar
        visible={snackbar.state.visible}
        message={snackbar.state.message}
        variant={snackbar.state.variant}
        onClose={snackbar.hide}
      />
    </div>
  );
}
