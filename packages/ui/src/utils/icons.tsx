import * as React from "react";
import type { LucideIcon, LucideProps } from "lucide-react";

/**
 * Centralized icon exports from lucide-react
 * 
 * This file provides a single import point for all commonly used icons
 * in the Aegis Vision application, ensuring consistency and easier maintenance.
 */

// Logo/Vision theme
export { Eye, EyeOff } from "lucide-react";

// Camera management
export { Camera, CameraOff } from "lucide-react";

// Notifications/Alerts
export { Bell, BellOff, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

// Configuration
export { Settings, Settings2, Cog } from "lucide-react";

// User management
export { Users, User, UserPlus, UserMinus, UserCheck } from "lucide-react";

// Analytics/Reports
export { BarChart, LineChart, PieChart, TrendingUp, TrendingDown } from "lucide-react";

// Success/Status
export { Check, CheckCircle2, X, XCircle } from "lucide-react";

// Navigation
export { 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown
} from "lucide-react";

// Search/Filter
export { Search, Filter } from "lucide-react";

// Actions
export { Download, Upload, UploadCloud, Edit, Pencil, Trash2, Copy, Save } from "lucide-react";

// Video controls
export { Play, Pause, Square } from "lucide-react";

// Display
export { Maximize2, Minimize2, Sun, Moon } from "lucide-react";

// Pipeline
export { GitBranch } from "lucide-react";

// Security/Compliance
export { Shield, Lock, Unlock, Key } from "lucide-react";

// Time
export { Clock, Calendar as CalendarIcon, History, Timer } from "lucide-react";

// General UI
export { 
  Menu, 
  X as Close, 
  Plus, 
  Minus,
  MoreVertical,
  MoreHorizontal,
  Home,
  Folder,
  File,
  Image,
  Video,
  Sparkles,
  LogOut,
  LayoutDashboard
} from "lucide-react";

// Status/Connection
export { 
  Wifi, 
  WifiOff, 
  Signal, 
  Activity,
  Radio
} from "lucide-react";

// Data/Storage
export { 
  Database, 
  Server, 
  Cloud, 
  CloudUpload, 
  CloudDownload,
  Archive,
  FolderOpen,
  FolderPlus
} from "lucide-react";

// Network/Connection
export { 
  Network, 
  Link, 
  Globe
} from "lucide-react";

// Feedback
export {
  ThumbsUp,
  ThumbsDown,
  Star,
  Heart
} from "lucide-react";

// Loading/Progress
export { 
  Loader2, 
  RefreshCw, 
  RotateCw, 
  RotateCcw
} from "lucide-react";

// Alerts/Incidents
export { 
  AlertOctagon, 
  Bug, 
  Flame,
  Skull,
  Ban
} from "lucide-react";

// Media/Evidence
export { 
  Film, 
  Mic, 
  MicOff,
  Volume2,
  VolumeX,
  Headphones,
  Music
} from "lucide-react";

// Lists/Tables
export { 
  List, 
  Grid, 
  Columns, 
  Rows,
  LayoutGrid,
  LayoutList
} from "lucide-react";

// Forms/Input
export { 
  Type, 
  Hash, 
  AtSign, 
  Mail, 
  Phone,
  MessageSquare
} from "lucide-react";

// Hardware/Industrial
export {
  Cpu,
  HardDrive,
  Usb,
  Zap,
  Brain
} from "lucide-react";

// Actions/Operations
export { 
  Power, 
  PowerOff, 
  RefreshCcw, 
  Repeat,
  Undo,
  Redo,
  Rocket
} from "lucide-react";

// Labeling / Tagging
export { Tags, Tag } from "lucide-react";

// View/Display modes
export { 
  Monitor, 
  Smartphone,
  Tablet,
  Laptop
} from "lucide-react";

// Organization/Structure
export { 
  Building, 
  Building2, 
  MapPin, 
  Map
} from "lucide-react";

// Security/Access
export { 
  Fingerprint, 
  Scan, 
  ShieldCheck,
  ShieldAlert,
  ShieldX
} from "lucide-react";

// Export/Import
export { 
  FileText
} from "lucide-react";

// Help/Info
import { Info } from "lucide-react";
export { 
  HelpCircle, 
  BookOpen, 
  Book,
  Bookmark,
  ExternalLink
} from "lucide-react";
export { Info, Info as InfoIcon };

// Custom icons

// Gift icon for "What's New" feature
export const Gift: LucideIcon = (props: LucideProps) => {
  const { color = "currentColor", size = 18, strokeWidth = 1.5, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <line x1="9" y1="5.25" x2="9" y2="16.25" />
      <path d="M3.75,3.5c0-.966,.784-1.75,1.75-1.75,2.589,0,3.5,3.5,3.5,3.5h-3.5c-.966,0-1.75-.784-1.75-1.75Z" />
      <path d="M12.5,5.25h-3.5s.911-3.5,3.5-3.5c.966,0,1.75,.784,1.75,1.75s-.784,1.75-1.75,1.75Z" />
      <path d="M14.25,8.25v6c0,1.105-.895,2-2,2H5.75c-1.105,0-2-.895-2-2v-6" />
      <rect x="1.75" y="5.25" width="14.5" height="3" rx="1" ry="1" />
    </svg>
  );
};

export const WebcamIcon: LucideIcon = (props: LucideProps) => {
  const { color = "currentColor", size = 18, strokeWidth = 1.5, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <circle cx="9" cy="7.5" r="2.25" />
      <path d="M11.552,12.652l1.5,2.457c.305,.5-.054,1.141-.64,1.141H5.587c-.586,0-.945-.641-.64-1.141l1.501-2.456" />
      <circle cx="9" cy="7.5" r="5.75" />
    </svg>
  );
};

// Re-export Icon component type for type safety
export type { LucideIcon, LucideProps } from "lucide-react";
