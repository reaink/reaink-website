import type { ComponentType } from 'react';
import { SiGithub, SiX } from '@icons-pack/react-simple-icons';
import {
  AtSign,
  ArrowRight,
  ChevronDown,
  Clock3,
  Eye,
  FilePenLine,
  FileText,
  Film,
  GitFork,
  Leaf,
  Mail,
  MapPin,
  Monitor,
  PenLine,
  ScrollText,
  Server,
  Sparkles,
  Star,
  Terminal,
  Users,
  Workflow,
  Wrench,
} from 'lucide-react';

export type IconComponent = ComponentType<{ className?: string }>;

export const iconMap = {
  atSign: AtSign,
  arrowRight: ArrowRight,
  chevronDown: ChevronDown,
  clock3: Clock3,
  eye: Eye,
  filePenLine: FilePenLine,
  fileText: FileText,
  film: Film,
  github: SiGithub,
  gitFork: GitFork,
  leaf: Leaf,
  mail: Mail,
  mapPin: MapPin,
  monitor: Monitor,
  penLine: PenLine,
  scrollText: ScrollText,
  server: Server,
  sparkles: Sparkles,
  star: Star,
  terminal: Terminal,
  twitter: SiX,
  users: Users,
  workflow: Workflow,
  wrench: Wrench,
} satisfies Record<string, IconComponent>;

export type IconName = keyof typeof iconMap;