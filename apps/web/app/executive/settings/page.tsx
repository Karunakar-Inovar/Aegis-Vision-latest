"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Icon,
  Input,
  Label,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ToggleSwitch,
} from "ui";
import { User, Bell, Settings, Sun } from "ui/utils/icons";
import { getCurrentUser } from "app/utils/auth";

// ─── Component ─────────────────────────────────────────────────────────────

export default function ExecutiveSettingsPage() {
  const currentUser = getCurrentUser();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [dashboardTimeRange, setDashboardTimeRange] = useState("30D");

  const [emailCriticalIncidents, setEmailCriticalIncidents] = useState(true);
  const [dailyHealthSummary, setDailyHealthSummary] = useState(false);
  const [weeklyReportDelivery, setWeeklyReportDelivery] = useState(true);

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.name ?? "");
      setEmail(currentUser.email ?? "");
      setPhoneNumber((currentUser as { phoneNumber?: string })?.phoneNumber ?? "");
    }
  }, [currentUser]);

  const handleSaveProfile = () => {
    // Local state only - no API
    console.log("Profile saved:", { fullName, email, phoneNumber });
  };

  const handleSavePreferences = () => {
    // Local state only - no API
    console.log("Preferences saved:", {
      language,
      timezone,
      dateFormat,
      dashboardTimeRange,
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FB" }}>
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-base text-gray-500">
            Manage your account and preferences
          </p>
        </div>

        {/* Tabs — Personal Settings only */}
        <Tabs defaultValue="personal" variant="underline" className="w-full">
          <TabsList>
            <TabsTrigger value="personal">Personal Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mt-6 space-y-6">
            {/* SECTION 1 — Profile Information */}
            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon icon={User} className="h-5 w-5 text-gray-500" />
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Profile Information
                  </CardTitle>
                </div>
                <CardDescription className="text-gray-500">
                  Update your personal details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveProfile();
                  }}
                  className="space-y-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-medium">
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        value={fullName}
                        onChangeText={setFullName}
                        className="rounded-lg border border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@company.com"
                        value={email}
                        onChangeText={setEmail}
                        className="rounded-lg border border-gray-300"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+919876543210"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      className="rounded-lg border border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Role</Label>
                    <div>
                      <span className="inline-flex rounded border border-gray-300 bg-gray-50 px-2 py-1 text-sm font-medium text-gray-600">
                        Executive
                      </span>
                    </div>
                  </div>
                  <Button type="submit" className="w-full sm:w-auto">
                    Save Profile
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* SECTION 2 — Preferences */}
            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon icon={Settings} className="h-5 w-5 text-gray-500" />
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Preferences
                  </CardTitle>
                </div>
                <CardDescription className="text-gray-500">
                  Configure your display and dashboard preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSavePreferences();
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="rounded-lg border border-gray-300">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="te">Telugu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Timezone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger className="rounded-lg border border-gray-300">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">
                          IST — Asia/Kolkata
                        </SelectItem>
                        <SelectItem value="America/New_York">
                          EST — America/New York
                        </SelectItem>
                        <SelectItem value="Europe/London">
                          GMT — Europe/London
                        </SelectItem>
                        <SelectItem value="Asia/Singapore">
                          SGT — Asia/Singapore
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Date Format</Label>
                    <Select value={dateFormat} onValueChange={setDateFormat}>
                      <SelectTrigger className="rounded-lg border border-gray-300">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Default Dashboard Time Range
                    </Label>
                    <Select
                      value={dashboardTimeRange}
                      onValueChange={setDashboardTimeRange}
                    >
                      <SelectTrigger className="rounded-lg border border-gray-300">
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7D">7D</SelectItem>
                        <SelectItem value="30D">30D</SelectItem>
                        <SelectItem value="90D">90D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full sm:w-auto">
                    Save Preferences
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* SECTION 3 — Notifications */}
            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon icon={Bell} className="h-5 w-5 text-gray-500" />
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Notifications
                  </CardTitle>
                </div>
                <CardDescription className="text-gray-500">
                  Choose how you want to receive alerts and reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Email notifications for critical incidents
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={emailCriticalIncidents}
                    onCheckedChange={setEmailCriticalIncidents}
                    size="md"
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Daily health summary email
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={dailyHealthSummary}
                    onCheckedChange={setDailyHealthSummary}
                    size="md"
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Weekly report auto-delivery
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={weeklyReportDelivery}
                    onCheckedChange={setWeeklyReportDelivery}
                    size="md"
                  />
                </div>
                <p className="text-sm text-gray-400">
                  Notification emails are sent to karunakar@aegisvision.com
                </p>
              </CardContent>
            </Card>

            {/* SECTION 4 — Appearance */}
            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon icon={Sun} className="h-5 w-5 text-gray-500" />
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Appearance
                  </CardTitle>
                </div>
                <CardDescription className="text-gray-500">
                  Customize how the app looks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Dark Mode
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                    size="md"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  Theme preference syncs across all devices
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
