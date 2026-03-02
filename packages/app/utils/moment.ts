/**
 * Moment.js Utility Functions
 * Common date/time formatting and manipulation functions
 */
import moment from 'moment';

/**
 * Format date to readable string
 * @param date - Date string or Date object
 * @param format - Moment format string (default: 'MMM DD, YYYY')
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date, format: string = 'MMM DD, YYYY'): string => {
  if (!date) return '';
  return moment(date).format(format);
};

/**
 * Format date with time
 * @param date - Date string or Date object
 * @param format - Moment format string (default: 'MMM DD, YYYY hh:mm A')
 * @returns Formatted date-time string
 */
export const formatDateTime = (date: string | Date, format: string = 'MMM DD, YYYY hh:mm A'): string => {
  if (!date) return '';
  return moment(date).format(format);
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export const formatRelativeTime = (date: string | Date): string => {
  if (!date) return '';
  return moment(date).fromNow();
};

/**
 * Format date to calendar time (e.g., "Today at 2:30 PM", "Yesterday at 3:45 PM")
 * @param date - Date string or Date object
 * @returns Calendar time string
 */
export const formatCalendarTime = (date: string | Date): string => {
  if (!date) return '';
  return moment(date).calendar();
};

/**
 * Get time ago from now (e.g., "2 hours ago", "3 days ago")
 * @param date - Date string or Date object
 * @returns Time ago string
 */
export const timeAgo = (date: string | Date): string => {
  if (!date) return '';
  return moment(date).fromNow();
};

/**
 * Get time until a future date (e.g., "in 2 hours", "in 3 days")
 * @param date - Date string or Date object
 * @returns Time until string
 */
export const timeUntil = (date: string | Date): string => {
  if (!date) return '';
  return moment(date).toNow();
};

/**
 * Check if date is today
 * @param date - Date string or Date object
 * @returns True if date is today
 */
export const isToday = (date: string | Date): boolean => {
  if (!date) return false;
  return moment(date).isSame(moment(), 'day');
};

/**
 * Check if date is yesterday
 * @param date - Date string or Date object
 * @returns True if date is yesterday
 */
export const isYesterday = (date: string | Date): boolean => {
  if (!date) return false;
  return moment(date).isSame(moment().subtract(1, 'day'), 'day');
};

/**
 * Check if two dates are the same day
 * @param date1 - First date string or Date object
 * @param date2 - Second date string or Date object (default: today)
 * @returns True if both dates are on the same day
 */
export const isSameDay = (date1: string | Date, date2: string | Date = new Date()): boolean => {
  if (!date1 || !date2) return false;
  return moment(date1).isSame(moment(date2), 'day');
};

/**
 * Check if date is in the past
 * @param date - Date string or Date object
 * @returns True if date is in the past
 */
export const isPast = (date: string | Date): boolean => {
  if (!date) return false;
  return moment(date).isBefore(moment());
};

/**
 * Check if date is in the future
 * @param date - Date string or Date object
 * @returns True if date is in the future
 */
export const isFuture = (date: string | Date): boolean => {
  if (!date) return false;
  return moment(date).isAfter(moment());
};

/**
 * Get difference between two dates
 * @param date1 - First date
 * @param date2 - Second date
 * @param unit - Unit of time (default: 'days')
 * @returns Difference in specified unit
 */
export const dateDifference = (
  date1: string | Date,
  date2: string | Date,
  unit: moment.unitOfTime.Diff = 'days'
): number => {
  if (!date1 || !date2) return 0;
  return moment(date1).diff(moment(date2), unit);
};

/**
 * Add time to a date
 * @param date - Date string or Date object
 * @param amount - Amount to add
 * @param unit - Unit of time (default: 'days')
 * @returns New date string
 */
export const addTime = (
  date: string | Date,
  amount: number,
  unit: moment.unitOfTime.DurationConstructor = 'days'
): string => {
  if (!date) return '';
  return moment(date).add(amount, unit).toISOString();
};

/**
 * Subtract time from a date
 * @param date - Date string or Date object
 * @param amount - Amount to subtract
 * @param unit - Unit of time (default: 'days')
 * @returns New date string
 */
export const subtractTime = (
  date: string | Date,
  amount: number,
  unit: moment.unitOfTime.DurationConstructor = 'days'
): string => {
  if (!date) return '';
  return moment(date).subtract(amount, unit).toISOString();
};

/**
 * Get start of day
 * @param date - Date string or Date object
 * @returns Start of day as ISO string
 */
export const startOfDay = (date: string | Date = new Date()): string => {
  return moment(date).startOf('day').toISOString();
};

/**
 * Get end of day
 * @param date - Date string or Date object
 * @returns End of day as ISO string
 */
export const endOfDay = (date: string | Date = new Date()): string => {
  return moment(date).endOf('day').toISOString();
};

/**
 * Get start of month
 * @param date - Date string or Date object
 * @returns Start of month as ISO string
 */
export const startOfMonth = (date: string | Date = new Date()): string => {
  return moment(date).startOf('month').toISOString();
};

/**
 * Get end of month
 * @param date - Date string or Date object
 * @returns End of month as ISO string
 */
export const endOfMonth = (date: string | Date = new Date()): string => {
  return moment(date).endOf('month').toISOString();
};

/**
 * Get start of week
 * @param date - Date string or Date object
 * @returns Start of week as ISO string
 */
export const startOfWeek = (date: string | Date = new Date()): string => {
  return moment(date).startOf('week').toISOString();
};

/**
 * Get end of week
 * @param date - Date string or Date object
 * @returns End of week as ISO string
 */
export const endOfWeek = (date: string | Date = new Date()): string => {
  return moment(date).endOf('week').toISOString();
};

/**
 * Check if a date is between two dates
 * @param date - Date to check
 * @param startDate - Start date
 * @param endDate - End date
 * @returns True if date is between start and end dates
 */
export const isBetween = (
  date: string | Date,
  startDate: string | Date,
  endDate: string | Date
): boolean => {
  if (!date || !startDate || !endDate) return false;
  return moment(date).isBetween(startDate, endDate);
};

/**
 * Check if two dates are the same
 * @param date1 - First date
 * @param date2 - Second date
 * @param granularity - Granularity to compare (default: 'day')
 * @returns True if dates are the same
 */
export const isSameDate = (
  date1: string | Date,
  date2: string | Date,
  granularity: moment.unitOfTime.StartOf = 'day'
): boolean => {
  if (!date1 || !date2) return false;
  return moment(date1).isSame(date2, granularity);
};

/**
 * Get current timestamp
 * @returns Current timestamp in ISO format
 */
export const now = (): string => {
  return moment().toISOString();
};

/**
 * Get current date (without time)
 * @returns Current date in YYYY-MM-DD format
 */
export const today = (): string => {
  return moment().format('YYYY-MM-DD');
};

/**
 * Parse date string
 * @param dateString - Date string to parse
 * @param format - Expected format (optional)
 * @returns Moment object
 */
export const parseDate = (dateString: string, format?: string): moment.Moment => {
  return format ? moment(dateString, format) : moment(dateString);
};

/**
 * Validate if string is a valid date
 * @param dateString - Date string to validate
 * @param format - Expected format (optional)
 * @returns True if valid date
 */
export const isValidDate = (dateString: string, format?: string): boolean => {
  return format ? moment(dateString, format, true).isValid() : moment(dateString).isValid();
};

/**
 * Get duration between two dates in human readable format
 * @param startDate - Start date
 * @param endDate - End date (default: now)
 * @returns Human readable duration
 */
export const getDuration = (startDate: string | Date, endDate: string | Date = new Date()): string => {
  if (!startDate) return '';
  const duration = moment.duration(moment(endDate).diff(moment(startDate)));
  return duration.humanize();
};

/**
 * Format date for API (ISO 8601)
 * @param date - Date to format
 * @returns ISO 8601 formatted date string
 */
export const formatForAPI = (date: string | Date): string => {
  if (!date) return '';
  return moment(date).toISOString();
};

/**
 * Format date for display in specific timezone
 * @param date - Date to format
 * @param timezone - Timezone (e.g., 'America/New_York')
 * @param format - Moment format string
 * @returns Formatted date string in timezone
 */
export const formatInTimezone = (
  date: string | Date,
  timezone: string,
  format: string = 'MMM DD, YYYY hh:mm A'
): string => {
  if (!date) return '';
  return moment(date).tz(timezone).format(format);
};

/**
 * Get relative time from now
 * @param date - Date string or Date object
 * @returns Relative time string (e.g., "3 hours ago")
 */
export const fromNow = (date: string | Date): string => {
  return moment(date).fromNow();
}

export const formatTime = (date: string | Date, format: string = 'hh:mm A'): string => {
  if (!date) return '';
  return moment(date).format(format);
}