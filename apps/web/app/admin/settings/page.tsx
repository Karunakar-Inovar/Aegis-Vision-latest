"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Icon,
  Badge,
  Input,
  Label,
  Checkbox,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Snackbar,
  useSnackbar,
} from "ui";
import {
  RefreshCw,
  User,
  Lock,
  Shield,
  Bell,
  Building2,
  Key,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  Trash2,
} from "ui/utils/icons";
import { getCurrentUser } from "app/utils/auth";
import { setItem, STORAGE_KEYS } from "app/utils/storage";
import { updateUser } from "app/utils/updateUser";
import { ROUTES, UI_MESSAGES } from "app/constants";
import { 
  upsertOrganization, 
  fetchOrganization, 
  fetchIndustries, 
  fetchCompanySizes,
  OrganizationIndustry,
  OrganizationSize
} from "app/utils/organization";
import { USER_ROLES } from "app/constants";

// Mock data interfaces
interface ProfileData {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  inApp: boolean;
}

interface OrganizationData {
  organizationId?: number;
  name: string;
  domain: string;
  industryId: number;
  companySizeId: number;
  licenseKey: string;
  logo: string;
}

const PASSWORD_REQUIREMENTS = [
  { label: "At least 8 characters", test: (pwd: string) => pwd.length >= 8 },
  { label: "One uppercase letter", test: (pwd: string) => /[A-Z]/.test(pwd) },
  { label: "One lowercase letter", test: (pwd: string) => /[a-z]/.test(pwd) },
  { label: "One number", test: (pwd: string) => /\d/.test(pwd) },
  { label: "One special character (!@#$%^&*)", test: (pwd: string) => /[!@#$%^&*]/.test(pwd) },
];

export default function SettingsPage() {
  const router = useRouter();
  const snackbar = useSnackbar();
  const [user, setUser] = useState<any>(null);
  const [isReconfigureDialogOpen, setIsReconfigureDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [submitting, setSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);



const currentUser = getCurrentUser();
const [profileData, setProfileData] = useState<ProfileData>(() => {
  return {
    fullName: currentUser?.name,
    email: currentUser?.email,
    phoneNumber: (currentUser as any)?.phoneNumber,
  };
});

const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
  email: true,
  sms: false,
  inApp: true,
});

  // Organization Settings states
  const [orgData, setOrgData] = useState<OrganizationData>({
    organizationId: undefined,
    name: "",
    domain: "",
    industryId: 0,
    companySizeId: 0,
    licenseKey: "",
    logo: "",
  });
  const [industries, setIndustries] = useState<OrganizationIndustry[]>([]);
  const [companySizes, setCompanySizes] = useState<OrganizationSize[]>([]);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(orgData.logo);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isLoadingOrg, setIsLoadingOrg] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
  
    if (currentUser) {
      setUser(currentUser);
      // Load profile data from user
      setProfileData({
        fullName: currentUser.name,
        email: currentUser.email,
        phoneNumber: currentUser.phoneNumber,
      });

      // Load organization data from API
      if (currentUser.role === USER_ROLES.ADMINISTRATOR) {
        loadOrganizationData();
        loadDropdownData();
      }
    }
  }, []);

  const loadOrganizationData = async () => {
    try {
      setIsLoadingOrg(true);
      const org = await fetchOrganization();
      
      // Convert Buffer to base64 string if needed
      let logoString = "";
      if (org.Logo) {
        if (org.Logo.data && Array.isArray(org.Logo.data)) {
          // Convert Buffer array to base64
          const buffer = Buffer.from(org.Logo.data);
          logoString = `data:image/png;base64,${buffer.toString('base64')}`;
        } else if (typeof org.Logo === 'string') {
          logoString = org.Logo;
        }
      }
      
      const orgDataValue = {
        organizationId: org.OrganizationId,
        name: org.OrganizationName || "",
        domain: org.OrganizationDomain || "",
        industryId: org.IndustryId || 0,
        companySizeId: org.CompanySizeId || 0,
        licenseKey: org.LicenseKey || "", // License key not returned from API for security
        logo: logoString,
      };
      setOrgData(orgDataValue);
      setLogoPreview(logoString || undefined);
      
      // Store in local storage
      setItem(STORAGE_KEYS.ORGANIZATION, org);
    } catch (error) {
      console.error("Error loading organization:", error);
      snackbar.error(error instanceof Error ? error.message : UI_MESSAGES.organization.loadFailed);
    } finally {
      setIsLoadingOrg(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      const [industriesData, companySizesData] = await Promise.all([
        fetchIndustries(),
        fetchCompanySizes()
      ]);
      setIndustries(industriesData);
      setCompanySizes(companySizesData);
    } catch (error) {
       setIndustries([]);
      setCompanySizes([]);
    }
  };

  const isAdmin = user?.role === USER_ROLES.ADMINISTRATOR;

  // Profile form
  const profileForm = useForm<ProfileData>({
    defaultValues: profileData,
  });

  // Password form
  const passwordForm = useForm<PasswordData>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Organization form
  const orgForm = useForm<OrganizationData>({
    defaultValues: orgData,
  });

  useEffect(() => {
    profileForm.reset(profileData);
  }, [profileData]);

  useEffect(() => {
    orgForm.reset(orgData);
    setLogoPreview(orgData.logo);
  }, [orgData]);

  const handleReconfigureSystem = () => {
    setIsReconfigureDialogOpen(true);
  };

  const handleConfirmReconfigure = () => {
    setIsReconfigureDialogOpen(false);
    router.push(ROUTES.ADMIN.SETUP);
  };

  const handleSaveProfile = async(values: ProfileData) => {
    try{
       const res = await updateUser({
        fullName: values.fullName,
        email: `${values.email}`,
        phoneNumber: values.phoneNumber,
      });
    setProfileData(values);

      if (res) {
        const updatedUser = { ...currentUser, name: values.fullName, email: values.email, phoneNumber: values.phoneNumber };
        // if you persist user to storage
        setItem(STORAGE_KEYS.AUTH, updatedUser);
        setUser(updatedUser);
      }
    } catch (err: any) {
      profileForm.setError("email", { message: err.message || UI_MESSAGES.profile.updateFailed });
    }
  };

  const handleUpdatePassword = async (values: PasswordData) => {
    passwordForm.clearErrors();

    if (!values.currentPassword) {
      passwordForm.setError("currentPassword", { message: UI_MESSAGES.password.currentRequired });
      return;
    }

    if (!values.newPassword) {
    passwordForm.setError("newPassword", { message: UI_MESSAGES.password.newRequired });
    return;
    }

    const missing = PASSWORD_REQUIREMENTS
      .filter((r) => !r.test(values.newPassword))
      .map((r) => r.label);

    if (missing.length > 0) {
      // show detailed message under the newPassword input
      passwordForm.setError("newPassword", {
        message: UI_MESSAGES.password.mustInclude(missing),
      });
      return;
    }

    if (values.newPassword !== values.confirmPassword) {
      passwordForm.setError("confirmPassword", {
        message: UI_MESSAGES.password.mismatch,
      });
      return;
    }

    setPasswordSubmitting(true);

     try {
     const payload = {
      email: profileData.email,
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    } as any;

    await updateUser(payload);

    snackbar.success(UI_MESSAGES.password.updateSuccess);
    passwordForm.reset();
  } catch (err: any) {
    const msg = err?.message || UI_MESSAGES.password.updateFailed;
    snackbar.error(msg);
    // attach server error to form if helpful
    passwordForm.setError("currentPassword", { message: msg });
  } finally {
    setPasswordSubmitting(false);
  }

  };

  const handleSavePreferences = () => {
    // In real app, save to API
    console.log("Preferences saved:", notificationPrefs);
  };

  const processLogoFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setLogoPreview(base64String);
      orgForm.setValue("logo", base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processLogoFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      processLogoFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(undefined);
    orgForm.setValue("logo", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveOrganization = async (values: OrganizationData) => {
    if (submitting) return;
    
    // Validation
    if (!values.name || values.name.trim().length === 0) {
      snackbar.error(UI_MESSAGES.organization.nameRequired);
      return;
    }
    if (values.name.length > 225) {
      snackbar.error(UI_MESSAGES.organization.nameTooLong);
      return;
    }
    if (values.domain && values.domain.length > 225) {
      snackbar.error(UI_MESSAGES.organization.domainTooLong);
      return;
    }
    if (!values.industryId || values.industryId <= 0) {
      snackbar.error(UI_MESSAGES.organization.industryRequired);
      return;
    }
    if (!values.companySizeId || values.companySizeId <= 0) {
      snackbar.error(UI_MESSAGES.organization.companySizeRequired);
      return;
    }

    setSubmitting(true);
    try {
      const updatedOrg = await upsertOrganization({
        organizationId: values.organizationId,
        organizationName: values.name,
        organizationDomain: values.domain || null,
        industryId: values.industryId,
        companySizeId: values.companySizeId,
        logo: logoPreview || null,
        licenseKey: values.licenseKey || undefined,
      });

      // Update local state
      // Convert Buffer to base64 string if needed
      let updatedLogoString = "";
      if (updatedOrg.Logo) {
        if (updatedOrg.Logo.data && Array.isArray(updatedOrg.Logo.data)) {
          // Convert Buffer array to base64
          const buffer = Buffer.from(updatedOrg.Logo.data);
          updatedLogoString = `data:image/png;base64,${buffer.toString('base64')}`;
        } else if (typeof updatedOrg.Logo === 'string') {
          updatedLogoString = updatedOrg.Logo;
        }
      }
      
      const orgDataValue = {
        organizationId: updatedOrg.OrganizationId,
        name: updatedOrg.OrganizationName,
        domain: updatedOrg.OrganizationDomain || "",
        industryId: updatedOrg.IndustryId,
        companySizeId: updatedOrg.CompanySizeId,
        licenseKey: values.licenseKey,
        logo: updatedLogoString,
      };
      setOrgData(orgDataValue);
      setLogoPreview(updatedLogoString || undefined);
      
      // Update local storage
      setItem(STORAGE_KEYS.ORGANIZATION, updatedOrg);
      
      snackbar.success(UI_MESSAGES.organization.saveSuccess);
    } catch (error) {
      snackbar.error(error instanceof Error ? error.message : UI_MESSAGES.organization.saveFailed);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNotificationToggle = (key: keyof NotificationPreferences) => {
    setNotificationPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <p className="text-muted-foreground mt-2">
          Manage your account and preferences
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} variant="underline" className="w-full">
        <TabsList>
          <TabsTrigger value="personal">Personal Settings</TabsTrigger>
          {isAdmin && <TabsTrigger value="organization">Organization Settings</TabsTrigger>}
        </TabsList>

        {/* Personal Settings Tab */}
        <TabsContent value="personal" className="space-y-6 mt-6">
          {/* System Configuration */}
          <Card className="rounded-2xl border-2 border-dashed border-border bg-muted/20 text-[#060b13]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon icon={RefreshCw} className="h-5 w-5 text-muted-foreground" />
                <CardTitle>System Configuration</CardTitle>
                 <Badge variant="outline" className="bg-muted text-muted-foreground">
                    Coming Soon
                </Badge>
              </div>
              <CardDescription>
                Reconfigure or continue incomplete system setup
                <br />
                Review or update your system settings including cameras, models, users, and notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleReconfigureSystem}
                className="w-full sm:w-auto"
                disabled
              >
                <Icon icon={RefreshCw} className="h-4 w-4 mr-2" />
                Reconfigure System
              </Button>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon icon={User} className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Profile Information</CardTitle>
              </div>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(handleSaveProfile)}
                  className="space-y-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={profileForm.control}
                      name="fullName"
                      rules={{ required: "Full name is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="email"
                      rules={{
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: UI_MESSAGES.email.invalid,
                        },
                        maxLength: { value: 254, message: UI_MESSAGES.email.tooLong },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john@company.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={profileForm.control}
                    name="phoneNumber"
                    rules={{
                      required: "Phone number is required",
                      validate: (raw: string | undefined) => {
                        if (!raw || raw.trim().length === 0) return true; // skip if empty
                        const normalized = raw
                         .trim()
                         .replace(/[\s\-().]/g, '')          
                         .replace(/^\+{2,}/, '+');
        
                    const candidate = normalized.startsWith('+') ? normalized : `+${normalized}`;

                    const E164_REGEX = /^\+[1-9]\d{1,14}$/;

                    return E164_REGEX.test(candidate)
                     || "Please enter a valid international number in E.164 (e.g., +919876543210)";
                  },

                  minLength: {
                        value: 12,
                        message: UI_MESSAGES.profile.phoneTooShort,
                      },
                      maxLength: {
                        value: 20,
                        message: UI_MESSAGES.profile.phoneTooLong,
                      },
                  }}
                  render={({ field }) => (
                  <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                  <Input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+919876543210"
                    {...field}

                     />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full sm:w-auto">
                    Save Profile
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon icon={Lock} className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Change Password</CardTitle>
              </div>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(handleUpdatePassword)}
                  className="space-y-4"
                >
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    rules={{ required: "Current password is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="********"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    rules={{
                      required: "New password is required",
                      minLength: {
                        value: 8,
                        message: UI_MESSAGES.password.minLength,
                      },
                    }}
                    render={({ field }) => {
                      const newPasswordValue = passwordForm.watch("newPassword");
                      return (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="********"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    rules={{ required: "Please confirm your password" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="********"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full sm:w-auto" disabled={passwordSubmitting}>
                    {passwordSubmitting ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon icon={Bell} className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Notification Preferences</CardTitle>
                 <Badge variant="outline" className="bg-muted text-muted-foreground">
                    Coming Soon
                  </Badge>
              </div>
              <CardDescription>Choose how you want to receive alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  disabled
                  id="email-notifications"
                  checked={notificationPrefs.email}
                  onCheckedChange={() => handleNotificationToggle("email")}
                />
                <Label
                  htmlFor="email-notifications"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Email Notifications
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  disabled
                  id="sms-notifications"
                  checked={notificationPrefs.sms}
                  onCheckedChange={() => handleNotificationToggle("sms")}
                />
                <Label
                  htmlFor="sms-notifications"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  SMS Notifications
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  disabled
                  id="inapp-notifications"
                  checked={notificationPrefs.inApp}
                  onCheckedChange={() => handleNotificationToggle("inApp")}
                />
                <Label
                  htmlFor="inapp-notifications"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  In-App Notifications
                </Label>
              </div>
              <div className="flex">
                <Button
                  disabled
                  type="button"
                  onClick={handleSavePreferences}
                  className="w-auto"
                >
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Settings Tab (Admin Only) */}
        {isAdmin && (
          <TabsContent value="organization" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon icon={Building2} className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Organization Details</CardTitle>
                </div>
                <CardDescription>
                  Manage your organization settings and license
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...orgForm}>
                  <form
                    onSubmit={orgForm.handleSubmit(handleSaveOrganization)}
                    className="space-y-4"
                  >
                    <FormField
                      control={orgForm.control}
                      name="name"
                      rules={{ required: "Organization name is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Corporation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={orgForm.control}
                      name="domain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Domain</FormLabel>
                          <FormControl>
                            <Input placeholder="acme.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={orgForm.control}
                        name="industryId"
                        rules={{ required: "Industry is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Industry</FormLabel>
                            {isLoadingOrg ? (
                              <div className="h-10 rounded-md bg-muted animate-pulse" />
                            ) : (
                              <Select
                                onValueChange={(value) => field.onChange(Number(value))}
                                value={field.value ? String(field.value) : undefined}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your industry" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {industries.map((industry) => (
                                    <SelectItem key={industry.OrganizationIndustryId} value={String(industry.OrganizationIndustryId)}>
                                      {industry.OrganizationIndustryName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={orgForm.control}
                        name="companySizeId"
                        rules={{ required: "Company size is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Size</FormLabel>
                            {isLoadingOrg ? (
                              <div className="h-10 rounded-md bg-muted animate-pulse" />
                            ) : (
                              <Select
                                onValueChange={(value) => field.onChange(Number(value))}
                                value={field.value ? String(field.value) : undefined}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select company size" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {companySizes.map((size) => (
                                    <SelectItem key={size.OrganizationSizeId} value={String(size.OrganizationSizeId)}>
                                      {size.OrganizationSize}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Logo Upload */}
                    <FormField
                      control={orgForm.control}
                      name="logo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Logo</FormLabel>
                          <FormControl>
                            <div className="space-y-3">
                              {logoPreview ? (
                                <div className="flex items-center gap-4">
                                  <div className="h-24 w-24 rounded-md border border-border bg-muted flex items-center justify-center overflow-hidden">
                                    <img
                                      src={logoPreview}
                                      alt="Logo preview"
                                      className="h-full w-full object-contain"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => fileInputRef.current?.click()}
                                    >
                                      <Icon icon={UploadCloud} className="mr-2 h-4 w-4" />
                                      Replace
                                    </Button>
                                    <Button type="button" variant="ghost" size="sm" onClick={handleRemoveLogo}>
                                      <Icon icon={Trash2} className="mr-2 h-4 w-4" />
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  onClick={() => fileInputRef.current?.click()}
                                  onDragOver={handleDragOver}
                                  onDragLeave={handleDragLeave}
                                  onDrop={handleDrop}
                                  className={`flex flex-col items-center justify-center rounded-md border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${
                                    isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50"
                                  }`}
                                >
                                  <Icon icon={UploadCloud} className="h-10 w-10 text-muted-foreground mb-3" />
                                  <p className="font-medium">Drag & drop your logo</p>
                                  <p className="text-sm text-muted-foreground">or click to browse files</p>
                                  <span className="mt-2 text-xs text-muted-foreground">PNG, JPG up to 2MB</span>
                                </div>
                              )}
                              <input
                                id="logo-upload"
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleLogoUpload}
                                className="hidden"
                                aria-label="Upload organization logo"
                                title="Upload organization logo"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* License Key Management */}
                    <FormField
                      control={orgForm.control}
                      name="licenseKey"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2 mb-2">
                            <Icon icon={Key} className="h-4 w-4 text-muted-foreground" />
                            <FormLabel>License Key</FormLabel>
                          </div>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Enter your license key"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground mt-1">
                            Update your license key to manage subscription and features
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
                      {submitting ? "Saving..." : "Save Organization Settings"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card className="rounded-2xl border-2 border-dashed border-border bg-muted/20 text-[#060b13]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon icon={Shield} className="h-5 w-5 text-muted-foreground" />
                    <CardTitle>Two-Factor Authentication</CardTitle>
                  </div>
                  <Badge variant="outline" className="bg-muted text-muted-foreground">
                    Coming Soon
                  </Badge>
                </div>
                <CardDescription>
                  Add an extra layer of security to your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Protect your organization with SMS or authenticator app verification codes for enhanced security.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Icon icon={CheckCircle2} className="h-4 w-4 text-green-600" />
                    <span>SMS and authenticator app support</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icon icon={CheckCircle2} className="h-4 w-4 text-green-600" />
                    <span>Backup codes for account recovery</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icon icon={CheckCircle2} className="h-4 w-4 text-green-600" />
                    <span>Device trust management</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icon icon={CheckCircle2} className="h-4 w-4 text-green-600" />
                    <span>Enhanced account protection</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full sm:w-auto">
                  Request Early Access
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Reconfigure System Warning Dialog */}
      <AlertDialog
        open={isReconfigureDialogOpen}
        onOpenChange={setIsReconfigureDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <Icon icon={AlertTriangle} className="h-5 w-5 text-amber-600" />
              <AlertDialogTitle>Reconfigure System</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="mt-4">
              Are you sure you want to reconfigure the system? This will redirect you to the setup wizard where you can review and update your system configuration including cameras, models, users, and notifications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={handleConfirmReconfigure}>Continue to Setup</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Snackbar for notifications */}
      <Snackbar
        visible={snackbar.state.visible}
        message={snackbar.state.message}
        variant={snackbar.state.variant}
        onClose={snackbar.hide}
      />
    </div>
  );
}
