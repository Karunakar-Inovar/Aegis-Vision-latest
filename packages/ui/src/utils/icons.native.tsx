import * as React from "react";
import type { LucideIcon, LucideProps } from "lucide-react-native";
import { Camera as CameraIcon, CameraOff as CameraOffIcon } from "lucide-react-native";

/**
 * Native icon exports using lucide-react-native
 *
 * This mirrors the web icons module but uses React Native–safe
 * components so they can be rendered inside the design system
 * on iOS/Android.
 */

// Logo/Vision theme
export { Eye, EyeOff } from "lucide-react-native";

// Camera management
export const Camera = CameraIcon;
export const CameraOff = CameraOffIcon;

// Notifications/Alerts
export {
  Bell,
  BellOff,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
} from "lucide-react-native";

// Configuration
export { Settings, Settings2, Cog } from "lucide-react-native";

// User management
export {
  Users,
  User,
  UserPlus,
  UserMinus,
  UserCheck,
} from "lucide-react-native";

// Analytics/Reports
export {
  BarChart,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
} from "lucide-react-native";

// Success/Status
export { Check, CheckCircle2, X, XCircle } from "lucide-react-native";

// Navigation
export {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
} from "lucide-react-native";

// Search/Filter
export { Search, Filter } from "lucide-react-native";

// Actions
export {
  Download,
  Upload,
  UploadCloud,
  Edit,
  Pencil,
  Trash2,
  Copy,
  Save,
} from "lucide-react-native";

// Video controls
export { Play, Pause, Square } from "lucide-react-native";

// Display
export { Maximize2, Minimize2, Sun, Moon } from "lucide-react-native";

// Pipeline
export { GitBranch } from "lucide-react-native";

// Security/Compliance
export { Shield, Lock, Unlock, Key } from "lucide-react-native";

// Time
export {
  Clock,
  Calendar as CalendarIcon,
  History,
  Timer,
} from "lucide-react-native";

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
  LayoutDashboard,
} from "lucide-react-native";

// Status/Connection
export {
  Wifi,
  WifiOff,
  Signal,
  Activity,
  Radio,
} from "lucide-react-native";

// Data/Storage
export {
  Database,
  Server,
  Cloud,
  CloudUpload,
  CloudDownload,
  Archive,
  FolderOpen,
  FolderPlus,
} from "lucide-react-native";

// Network/Connection
export {
  Network,
  Link,
  Globe,
} from "lucide-react-native";

// Feedback
export {
  ThumbsUp,
  ThumbsDown,
  Star,
  Heart,
} from "lucide-react-native";

// Loading/Progress
export {
  Loader2,
  RefreshCw,
  RotateCw,
  RotateCcw,
} from "lucide-react-native";

// Alerts/Incidents
export {
  AlertOctagon,
  Bug,
  Flame,
  Skull,
  Ban,
} from "lucide-react-native";

// Media/Evidence
export {
  Film,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Headphones,
  Music,
} from "lucide-react-native";

// Lists/Tables
export {
  List,
  Grid,
  Columns,
  Rows,
  LayoutGrid,
  LayoutList,
} from "lucide-react-native";

// Forms/Input
export {
  Type,
  Hash,
  AtSign,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react-native";

// Hardware/Industrial
export {
  Cpu,
  HardDrive,
  Usb,
  Zap,
  Brain,
} from "lucide-react-native";

// Actions/Operations
export {
  Power,
  PowerOff,
  RefreshCcw,
  Repeat,
  Undo,
  Redo,
} from "lucide-react-native";

// View/Display modes
export {
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
} from "lucide-react-native";

// Organization/Structure
export {
  Building,
  Building2,
  MapPin,
  Map,
} from "lucide-react-native";

// Security/Access
export {
  Fingerprint,
  Scan,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
} from "lucide-react-native";

// Export/Import
export {
  FileText,
} from "lucide-react-native";

// Help/Info
export {
  HelpCircle,
  Info as InfoIcon,
  BookOpen,
  Book,
  ExternalLink,
} from "lucide-react-native";

// Custom icons for native:
// For now, alias WebcamIcon to Camera so it renders consistently
// with the web implementation while remaining React Native–safe.
export const WebcamIcon: LucideIcon = Camera;

// Gift icon - using a similar approach, we can create a custom SVG or use an existing icon
// For now, using a placeholder that works in React Native
export { Gift } from "lucide-react-native";

// Re-export Icon component type for type safety
export type { LucideIcon, LucideProps } from "lucide-react-native";


