"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { fetchIncidentTypes, fetchSeverityLevels, createIncident } from "app/utils/incident";
import { getCurrentUser } from "app/utils/auth";
import { ROUTES, UI_MESSAGES } from "app/constants";
import {
  Card,
  CardContent,
  CardFooter,
  Button,
  Icon,
  Input,
  Field,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Alert,
} from "ui";
import {
  ArrowLeft,
  Upload,
  CheckCircle,
} from "ui/src/utils/icons";
import { cn } from "ui/src/utils/cn";
import { getCurrentAlert } from "app/utils/alert";
import { fileToBase64 } from "app/utils/helper";

export default function CreateIncidentPage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    incidentType: "",
    severity: "",
    title: "",
    location: "",
    description: "",
    attachments: [] as File[],
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showThankYou, setShowThankYou] = React.useState(false);
  const [touched, setTouched] = React.useState({
    incidentType: false,
    severity: false,
    title: false,
    location: false,
    description: false,
  });
  const [errorMessage, setErrorMessage] = React.useState("");
  const [incidentTypeOptions, setIncidentTypeOptions] = React.useState<
    { value: string; label: string }[]
  >([]);
  const [severityOptions, setSeverityOptions] = React.useState<
    { value: string; label: string }[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch incident types and severity levels on mount
  React.useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsLoading(true);
        const [incidentTypesRes, severityLevelsRes] = await Promise.all([
          fetchIncidentTypes(),
          fetchSeverityLevels(),
        ]);

        // Transform API response to dropdown options
        const incidentTypes = incidentTypesRes.data.map((type) => ({
          value: type.IncidentTypeId.toString(),
          label: type.IncidentTypeName,
        }));

        const severityLevels = severityLevelsRes.data.map((level) => ({
          value: level.SeverityLevelId.toString(),
          label: level.SeverityLevelName,
        }));

        setIncidentTypeOptions(incidentTypes);
        setSeverityOptions(severityLevels);
      } catch (error) {
        setErrorMessage(UI_MESSAGES.incidents.loadFormOptionsFailed);
        // Set fallback options if API fails
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  // Validation
  const incidentTypeError =
    touched.incidentType && !formData.incidentType
      ? UI_MESSAGES.incidents.typeRequired
      : "";

  const severityError =
    touched.severity && !formData.severity
      ? UI_MESSAGES.incidents.severityRequired
      : "";

  const titleError =
    touched.title && !formData.title
      ? UI_MESSAGES.incidents.titleRequired
      : touched.title && formData.title.length < 3
        ? UI_MESSAGES.incidents.titleTooShort
        : "";

  const locationError =
    touched.location && !formData.location
      ? UI_MESSAGES.incidents.locationRequired
      : "";

  const descriptionError =
    touched.description && !formData.description
      ? UI_MESSAGES.incidents.descriptionRequired
      : touched.description && formData.description.length < 10
        ? UI_MESSAGES.incidents.descriptionTooShort
        : "";

  const isValid = 
    formData.incidentType &&
    formData.severity &&
    formData.title &&
    formData.location &&
    formData.description &&
    !incidentTypeError &&
    !severityError &&
    !titleError &&
    !locationError &&
    !descriptionError;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMessage("");
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setFormData((prev) => ({
        ...prev,
        attachments: Array.from(files),
      }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {
      incidentType: true,
      severity: true,
      title: true,
      location: true,
      description: true,
    };
    setTouched(allTouched);

    setErrorMessage("");

    // Re-validate after marking as touched
    const hasErrors = 
      !formData.incidentType ||
      !formData.severity ||
      !formData.title ||
      formData.title.length < 3 ||
      !formData.location ||
      !formData.description ||
      formData.description.length < 10;

    if (hasErrors) {
      setErrorMessage(UI_MESSAGES.incidents.requiredFields);
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user
      const alert = getCurrentAlert();
      if (!alert) {
        setErrorMessage(UI_MESSAGES.auth.userNotAuthenticated);
        setIsSubmitting(false);
        return;
      }

      const currentUser = getCurrentUser();

      // Prepare incident data according to API requirements
      const incidentData = {
        incidentTypeId: Number(formData.incidentType),
        incidentStatusId: 1, // Default to "Open" or first status
        severityLevelId: Number(formData.severity),
        incidentTitle: formData.title,
        incidentDescription: formData.description,
        location: formData.location,
        frameId: alert.FrameId, // Default value - can be updated if you have frame data
        createdBy: `${currentUser?.id}`,
        confidencePercentage: (Number(alert.ConfidenceValue) * 100),
        // give base64 or url of image
        incidentImageUrl: formData.attachments.length  > 0 && formData.attachments[0] ? await fileToBase64(formData.attachments[0]) : undefined,
      };

      // Call API to create incident
      await createIncident(incidentData);
            
      // Show thank you screen
      setShowThankYou(true);
      setIsSubmitting(false);
      
      // Redirect to alerts page after 3 seconds
      setTimeout(() => {
        router.push(ROUTES.MONITOR.ALERT);
      }, 3000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : UI_MESSAGES.incidents.createFailed
      );
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(ROUTES.MONITOR.ALERT);
  };

  // Show thank you screen
  if (showThankYou) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-full max-w-[70%] text-center space-y-6">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Icon icon={CheckCircle} className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Thank You!</h1>
              <p className="text-lg text-muted-foreground">
                Your incident report has been submitted successfully.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to Production Alert Management...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header and Form - Centered and aligned */}
      <div className="flex flex-col items-center">
        <div className="w-full max-w-[70%] space-y-4">
          {/* Back - Above title */}
          <Button
            variant="ghost"
            size="sm"
            onPress={() => router.push(ROUTES.MONITOR.ALERT)}
            className="flex-row items-center -ml-2"
          >
            <Icon icon={ArrowLeft} className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Title and Subtitle */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create Production Incident Report</h1>
            <p className="text-muted-foreground mt-1">
              Document quality issues and production incidents
            </p>
          </div>
        </div>
      </div>

      {/* Incident Details Form - Centered and 30% smaller */}
      <div className="flex justify-center">
        <Card className="w-full max-w-[70%]" style={{ overflow: 'visible' }}>
        <form onSubmit={handleSubmit} style={{ overflow: 'visible' }}>
          <CardContent className="space-y-6" style={{ overflow: 'visible' }}>
            {/* Error Message */}
            {errorMessage ? (
              <Alert variant="destructive">
                <p className="text-sm">{errorMessage}</p>
              </Alert>
            ) : null}

            {/* Incident Type */}
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label>Incident Type</Label>
                <span className="text-destructive">*</span>
              </div>
              <Select
                value={formData.incidentType}
                onValueChange={(value) => {
                  handleInputChange("incidentType", value);
                  handleBlur("incidentType");
                }}
                disabled={isLoading}
              >
                <SelectTrigger className={incidentTypeError ? "border-destructive" : ""}>
                  <SelectValue placeholder={isLoading ? "Loading..." : "Select type"} />
                </SelectTrigger>
                <SelectContent>
                  {incidentTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {incidentTypeError ? (
                <p className="text-sm text-destructive" role="alert">
                  {incidentTypeError}
                </p>
              ) : null}
            </div>

            {/* Severity Level */}
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label>Severity Level</Label>
                <span className="text-destructive">*</span>
              </div>
              <Select
                value={formData.severity}
                onValueChange={(value) => {
                  handleInputChange("severity", value);
                  handleBlur("severity");
                }}
                disabled={isLoading}
              >
                <SelectTrigger className={severityError ? "border-destructive" : ""}>
                  <SelectValue placeholder={isLoading ? "Loading..." : "Select severity"} />
                </SelectTrigger>
                <SelectContent>
                  {severityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {severityError ? (
                <p className="text-sm text-destructive" role="alert">
                  {severityError}
                </p>
              ) : null}
            </div>

            {/* Incident Title */}
            <Field label="Incident Title" errorMessage={titleError || undefined} required>
              <Input
                placeholder="Brief summary of the incident"
                value={formData.title}
                onChangeText={(value) => handleInputChange("title", value)}
                onBlur={() => handleBlur("title")}
                className={titleError ? "border-destructive" : ""}
              />
            </Field>

            {/* Location */}
            <Field label="Location" errorMessage={locationError || undefined} required>
              <Input
                placeholder="Camera name and physical location"
                value={formData.location}
                onChangeText={(value) => handleInputChange("location", value)}
                onBlur={() => handleBlur("location")}
                className={locationError ? "border-destructive" : ""}
              />
            </Field>

            {/* Detailed Description */}
            <Field 
              label="Detailed Description" 
              errorMessage={descriptionError || undefined} 
              description="Include timeline, involved parties, and response actions"
              required
            >
              <Textarea
                placeholder="Provide a detailed description of what happened, actions taken, and any relevant context..."
                value={formData.description}
                onChangeText={(value) => handleInputChange("description", value)}
                onBlur={() => handleBlur("description")}
                rows={6}
                className={cn("min-h-[150px]", descriptionError ? "border-destructive" : "")}
              />
            </Field>

            {/* Attachments */}
            <Field label="Attachments">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col items-center gap-3">
                  <Icon icon={Upload} className="h-8 w-8 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Attach screenshots, photos, or video clips
                    </p>
                    {formData.attachments.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {formData.attachments.length} file(s) selected
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"                    
                    variant="outline"
                    size="sm"
                    onPress={(e) => {
                      e?.preventDefault?.();
                      fileInputRef.current?.click();
                    }}
                    className="mt-2"
                  >
                    Add Screenshot
                  </Button>
                </div>
              </div>
              <input
                type="file"
                id="attachments"
                ref={fileInputRef}
                // multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </Field>
          </CardContent>
          <CardFooter className="sticky bottom-0 z-10 flex flex-col gap-3 border-t bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onPress={handleCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "Submitting..." : "Submit Incident Report"}
          </Button>
          </CardFooter>
        </form>
      </Card>
      </div>
    </div>
  );
}

