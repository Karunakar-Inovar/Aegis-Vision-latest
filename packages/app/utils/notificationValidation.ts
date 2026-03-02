/**
 * Notification Channel IDs
 */
export enum NotificationChannelId {
  EMAIL = 1,
  SMS = 2,
  WHATSAPP = 3,
  WEBHOOK = 4,
  PLC = 5,
}

/**
 * Notification Channel Names
 */
export const NotificationChannelNames = {
  [NotificationChannelId.EMAIL]: "Email",
  [NotificationChannelId.SMS]: "SMS",
  [NotificationChannelId.WHATSAPP]: "WhatsApp",
  [NotificationChannelId.WEBHOOK]: "Webhook",
  [NotificationChannelId.PLC]: "PLC",
} as const;

/**
 * Validation regex patterns for each notification channel
 */
const ValidationPatterns = {
  [NotificationChannelId.EMAIL]: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  [NotificationChannelId.SMS]: /^[+]?[0-9]{10,15}$/,
  [NotificationChannelId.WHATSAPP]: /^[+]?[0-9]{10,15}$/,
  [NotificationChannelId.WEBHOOK]: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  [NotificationChannelId.PLC]: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?::[0-9]{1,5})?$/,
};

/**
 * Placeholder text for each notification channel
 */
export const getRecipientPlaceholder = (channelId: number): string => {
  switch (channelId) {
    case NotificationChannelId.EMAIL:
      return "e.g., user@example.com, admin@example.com";
    case NotificationChannelId.SMS:
      return "e.g., +1234567890, +9876543210";
    case NotificationChannelId.WHATSAPP:
      return "e.g., +1234567890, +9876543210";
    case NotificationChannelId.WEBHOOK:
      return "e.g., https://example.com/webhook";
    case NotificationChannelId.PLC:
      return "e.g., 192.168.1.1:502, 10.0.0.5";
    default:
      return "Please select a notification channel first";
  }
};

/**
 * Helper text for each notification channel
 */
export const getRecipientHelperText = (channelId: number): string => {
  switch (channelId) {
    case NotificationChannelId.EMAIL:
      return "Comma-separated email addresses (e.g., user@example.com)";
    case NotificationChannelId.SMS:
      return "Comma-separated phone numbers with country code (e.g., +1234567890)";
    case NotificationChannelId.WHATSAPP:
      return "Comma-separated WhatsApp numbers with country code (e.g., +1234567890)";
    case NotificationChannelId.WEBHOOK:
      return "Comma-separated webhook URLs (e.g., https://example.com/webhook)";
    case NotificationChannelId.PLC:
      return "Comma-separated PLC addresses in format IP:PORT (e.g., 192.168.1.1:502)";
    default:
      return "Select a notification channel to see format requirements";
  }
};

/**
 * Error messages for each notification channel
 */
const ErrorMessages = {
  [NotificationChannelId.EMAIL]: "Invalid email format",
  [NotificationChannelId.SMS]: "Invalid phone number format. Use format: +1234567890",
  [NotificationChannelId.WHATSAPP]: "Invalid WhatsApp number format. Use format: +1234567890",
  [NotificationChannelId.WEBHOOK]: "Invalid webhook URL format. Use format: https://example.com/webhook",
  [NotificationChannelId.PLC]: "Invalid PLC address format. Use format: 192.168.1.1 or 192.168.1.1:502",
};

/**
 * Validates recipients based on the notification channel
 * @param recipients - Comma-separated list of recipients
 * @param channelId - The notification channel ID (or string representation)
 * @returns Error message if validation fails, empty string if valid
 */
export const validateRecipients = (
  recipients: string,
  channelId: string | number,
): string => {
  if (!recipients.trim()) {
    return "Recipients are required";
  }

  const recipientsList = recipients
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);

  if (recipientsList.length === 0) {
    return "At least one recipient is required";
  }

  // Convert channelId to number
  const channelIdNum = typeof channelId === "string" ? parseInt(channelId) : channelId;

  // Get validation pattern for the channel
  const pattern = ValidationPatterns[channelIdNum as NotificationChannelId];
  
  if (!pattern) {
    // Unknown channel, no validation
    return "";
  }

  // Validate each recipient
  const invalidRecipients = recipientsList.filter((recipient) => {
    // For phone numbers (SMS/WhatsApp), remove spaces and dashes before validation
    if (channelIdNum === NotificationChannelId.SMS || channelIdNum === NotificationChannelId.WHATSAPP) {
      const cleanedRecipient = recipient.replace(/[\s-]/g, "");
      return !pattern.test(cleanedRecipient);
    }
    return !pattern.test(recipient);
  });

  if (invalidRecipients.length > 0) {
    const errorMessage = ErrorMessages[channelIdNum as NotificationChannelId] || "Invalid recipient format";
    return `${errorMessage}: ${invalidRecipients.join(", ")}`;
  }

  return "";
};

/**
 * Checks if a recipient is valid for a given channel
 * @param recipient - Single recipient to validate
 * @param channelId - The notification channel ID
 * @returns True if valid, false otherwise
 */
export const isValidRecipient = (
  recipient: string,
  channelId: number,
): boolean => {
  const pattern = ValidationPatterns[channelId as NotificationChannelId];
  
  if (!pattern) {
    return true; // Unknown channel, assume valid
  }

  // For phone numbers, clean before validation
  if (channelId === NotificationChannelId.SMS || channelId === NotificationChannelId.WHATSAPP) {
    const cleanedRecipient = recipient.replace(/[\s-]/g, "");
    return pattern.test(cleanedRecipient);
  }

  return pattern.test(recipient);
};
