import {
  Globe,
  Users,
  Camera,
  Film,
  Award,
  Star,
  Calendar,
  Heart,
  MapPin,
  Briefcase,
  Trophy,
  Image,
  type LucideIcon,
} from "lucide-react";

/** Icons available for stat items (key is stored on the Stat). */
export const STAT_ICONS: Record<string, LucideIcon> = {
  globe: Globe,
  users: Users,
  camera: Camera,
  film: Film,
  award: Award,
  star: Star,
  calendar: Calendar,
  heart: Heart,
  mapPin: MapPin,
  briefcase: Briefcase,
  trophy: Trophy,
  image: Image,
};

export const STAT_ICON_KEYS = Object.keys(STAT_ICONS);

export function StatIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = STAT_ICONS[name] ?? Globe;
  return <Icon className={className} />;
}
