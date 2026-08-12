import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconProps = {
  color?: string;
  size?: number;
};

export const SearchIcon: React.FC<IconProps> = ({
  color = '#9CA3AF',
  size = 20,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={2} />
    <Path
      d="M20 20L16.5 16.5"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

export const BellIcon: React.FC<IconProps> = ({
  color = '#0A1629',
  size = 20,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 17H9C7.895 17 7 16.105 7 15V11C7 8.243 8.243 7 11 7H13C15.757 7 17 8.243 17 11V15C17 16.105 16.105 17 15 17Z"
      stroke={color}
      strokeWidth={1.8}
    />
    <Path
      d="M12 4V7M9.5 19H14.5"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

export const HomeIcon: React.FC<IconProps & { filled?: boolean }> = ({
  color = '#2563EB',
  size = 22,
  filled,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 10.5L12 4L20 10.5V19C20 19.552 19.552 20 19 20H5C4.448 20 4 19.552 4 19V10.5Z"
      stroke={color}
      strokeWidth={1.8}
      fill={filled ? color : 'none'}
    />
    <Path
      d="M9.5 20V14H14.5V20"
      stroke={filled ? '#FFFFFF' : color}
      strokeWidth={1.8}
    />
  </Svg>
);

export const GridIcon: React.FC<IconProps> = ({
  color = '#9CA3AF',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="4" width="6" height="6" rx="1.5" stroke={color} strokeWidth={1.8} />
    <Rect x="14" y="4" width="6" height="6" rx="1.5" stroke={color} strokeWidth={1.8} />
    <Rect x="4" y="14" width="6" height="6" rx="1.5" stroke={color} strokeWidth={1.8} />
    <Rect x="14" y="14" width="6" height="6" rx="1.5" stroke={color} strokeWidth={1.8} />
  </Svg>
);

export const DocumentIcon: React.FC<IconProps> = ({
  color = '#FFFFFF',
  size = 24,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 4H14L18 8V18C18 19.105 17.105 20 16 20H8C6.895 20 6 19.105 6 18V6C6 4.895 6.895 4 8 4Z"
      stroke={color}
      strokeWidth={1.8}
    />
    <Path d="M14 4V8H18" stroke={color} strokeWidth={1.8} />
    <Path d="M9 13H15M9 16H13" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const WalletIcon: React.FC<IconProps> = ({
  color = '#9CA3AF',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 8H18C19.105 8 20 8.895 20 10V16C20 17.105 19.105 18 18 18H6C4.895 18 4 17.105 4 16V8Z"
      stroke={color}
      strokeWidth={1.8}
    />
    <Path d="M4 8V7C4 5.895 4.895 5 6 5H16" stroke={color} strokeWidth={1.8} />
    <Circle cx="16.5" cy="13" r="1" fill={color} />
  </Svg>
);

export const UserIcon: React.FC<IconProps> = ({
  color = '#9CA3AF',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={1.8} />
    <Path
      d="M5 20C5.958 16.837 8.725 15 12 15C15.275 15 18.042 16.837 19 20"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

export const ShieldIcon: React.FC<IconProps> = ({
  color = '#2563EB',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3L19 6.5V11.5C19 16.2 15.8 19.5 12 21C8.2 19.5 5 16.2 5 11.5V6.5L12 3Z"
      stroke={color}
      strokeWidth={1.8}
    />
    <Path d="M9.5 12L11.5 14L15 10" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const CardIcon: React.FC<IconProps> = ({
  color = '#10B981',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="6" width="18" height="12" rx="2" stroke={color} strokeWidth={1.8} />
    <Path d="M3 10H21" stroke={color} strokeWidth={1.8} />
    <Path d="M7 15H10" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const BillIcon: React.FC<IconProps> = ({
  color = '#F59E0B',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 4H14L18 8V18C18 19.105 17.105 20 16 20H8C6.895 20 6 19.105 6 18V6C6 4.895 6.895 4 8 4Z"
      stroke={color}
      strokeWidth={1.8}
    />
    <Path d="M9 13H15M9 16H12" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const BankIcon: React.FC<IconProps> = ({
  color = '#EF4444',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 10H20L12 4L4 10Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    <Path d="M6 10V17M10 10V17M14 10V17M18 10V17" stroke={color} strokeWidth={1.8} />
    <Path d="M4 17H20V19H4V17Z" stroke={color} strokeWidth={1.8} />
  </Svg>
);

export const BadgeIcon: React.FC<IconProps> = ({
  color = '#2563EB',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="9" r="5" stroke={color} strokeWidth={1.8} />
    <Path d="M8 14L6 20L12 17L18 20L16 14" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
  </Svg>
);

export const UmbrellaIcon: React.FC<IconProps> = ({
  color = '#10B981',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 4C8.5 4 5.5 6.5 5 10H19C18.5 6.5 15.5 4 12 4Z"
      stroke={color}
      strokeWidth={1.8}
    />
    <Path d="M12 10V20" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const BookIcon: React.FC<IconProps> = ({
  color = '#8B5CF6',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 4H14C15.105 4 16 4.895 16 6V20L10.5 17L5 20V4Z"
      stroke={color}
      strokeWidth={1.8}
    />
    <Path
      d="M16 6H18C19.105 6 20 6.895 20 8V20L16 18V6Z"
      stroke={color}
      strokeWidth={1.8}
    />
  </Svg>
);

export const BoltIcon: React.FC<IconProps> = ({
  color = '#F59E0B',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M13 3L5 14H11L10 21L19 10H13L13 3Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({
  color = '#FFFFFF',
  size = 16,
}) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path
      d="M6 4L10 8L6 12"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BackIcon: React.FC<IconProps> = ({
  color = '#0A1629',
  size = 20,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 6L9 12L15 18"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const GearIcon: React.FC<IconProps> = ({
  color = '#F59E0B',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.8} />
    <Path
      d="M12 3V5M12 19V21M3 12H5M19 12H21M5.6 5.6L7 7M17 17L18.4 18.4M5.6 18.4L7 17M17 7L18.4 5.6"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

export const HealthIcon: React.FC<IconProps> = ({
  color = '#EC4899',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21C12 21 5 16 5 10.5C5 7.462 7.462 5 10.5 5C11.8 5 13 5.5 12 7C11 5.5 12.2 5 13.5 5C16.538 5 19 7.462 19 10.5C19 16 12 21 12 21Z"
      stroke={color}
      strokeWidth={1.8}
    />
  </Svg>
);

export const TransportIcon: React.FC<IconProps> = ({
  color = '#F97316',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="6" width="16" height="10" rx="2" stroke={color} strokeWidth={1.8} />
    <Circle cx="8" cy="16" r="1.5" fill={color} />
    <Circle cx="16" cy="16" r="1.5" fill={color} />
    <Path d="M4 11H20" stroke={color} strokeWidth={1.8} />
  </Svg>
);

export const WaterIcon: React.FC<IconProps> = ({
  color = '#3B82F6',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21C12 21 6 15.5 6 10.5C6 7.462 8.686 5 12 5C15.314 5 18 7.462 18 10.5C18 15.5 12 21 12 21Z"
      stroke={color}
      strokeWidth={1.8}
    />
  </Svg>
);

export const HouseIcon: React.FC<IconProps> = ({
  color = '#8B5CF6',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 11L12 5L20 11V18C20 19.105 19.105 20 18 20H6C4.895 20 4 19.105 4 18V11Z"
      stroke={color}
      strokeWidth={1.8}
    />
  </Svg>
);

export const PlusIcon: React.FC<IconProps> = ({
  color = '#2563EB',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5V19M5 12H19" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export const CalendarIcon: React.FC<IconProps> = ({
  color = '#2563EB',
  size = 20,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="5" width="16" height="16" rx="2" stroke={color} strokeWidth={1.8} />
    <Path d="M4 9H20M8 3V6M16 3V6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const ShareIcon: React.FC<IconProps> = ({
  color = '#0A1629',
  size = 20,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="18" cy="5" r="3" stroke={color} strokeWidth={1.8} />
    <Circle cx="6" cy="12" r="3" stroke={color} strokeWidth={1.8} />
    <Circle cx="18" cy="19" r="3" stroke={color} strokeWidth={1.8} />
    <Path d="M8.5 10.5L15.5 6.5M8.5 13.5L15.5 17.5" stroke={color} strokeWidth={1.8} />
  </Svg>
);

export const DownloadIcon: React.FC<IconProps> = ({
  color = '#2563EB',
  size = 20,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 4V15M12 15L8 11M12 15L16 11" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M5 19H19" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({
  color = '#10B981',
  size = 48,
}) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Circle cx="24" cy="24" r="20" stroke={color} strokeWidth={2.5} />
    <Path d="M16 24L22 30L33 18" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const CheckFilledIcon: React.FC<IconProps> = ({
  color = '#10B981',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill={color} />
    <Path d="M8 12L11 15L16 9" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const LockSmallIcon: React.FC<IconProps> = ({
  color = '#FFFFFF',
  size = 14,
}) => (
  <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <Path
      d="M3.5 6V4.5C3.5 2.843 4.843 1.5 6.5 1.5C8.157 1.5 9.5 2.843 9.5 4.5V6M2.5 6H10.5C11.052 6 11.5 6.448 11.5 7V11.5C11.5 12.052 11.052 12.5 10.5 12.5H2.5C1.948 12.5 1.5 12.052 1.5 11.5V7C1.5 6.448 1.948 6 2.5 6Z"
      stroke={color}
      strokeWidth={1.2}
    />
  </Svg>
);

export const UpiIcon: React.FC<IconProps> = ({
  color = '#9CA3AF',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="4" width="6" height="6" rx="1" stroke={color} strokeWidth={1.8} />
    <Rect x="14" y="4" width="6" height="6" rx="1" stroke={color} strokeWidth={1.8} />
    <Rect x="4" y="14" width="6" height="6" rx="1" stroke={color} strokeWidth={1.8} />
    <Rect x="14" y="14" width="6" height="6" rx="1" stroke={color} strokeWidth={1.8} />
  </Svg>
);

export const RadioSelectedIcon: React.FC<IconProps> = ({
  color = '#2563EB',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
    <Circle cx="11" cy="11" r="10" stroke={color} strokeWidth={2} />
    <Circle cx="11" cy="11" r="5" fill={color} />
  </Svg>
);

export const RadioUnselectedIcon: React.FC<IconProps> = ({
  color = '#D1D5DB',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
    <Circle cx="11" cy="11" r="10" stroke={color} strokeWidth={2} />
  </Svg>
);

export const ChevronRightSmallIcon: React.FC<IconProps> = ({
  color = '#9CA3AF',
  size = 18,
}) => (
  <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <Path d="M7 5L11 9L7 13" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const GlobeIcon: React.FC<IconProps> = ({
  color = '#2563EB',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} />
    <Path d="M3 12H21M12 3C9.5 6 9.5 18 12 21M12 3C14.5 6 14.5 18 12 21" stroke={color} strokeWidth={1.8} />
  </Svg>
);

export const SettingsIcon: React.FC<IconProps> = ({
  color = '#2563EB',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.8} />
    <Path
      d="M12 2V4M12 20V22M4 12H2M22 12H20M5.6 5.6L7 7M17 17L18.4 18.4M5.6 18.4L7 17M17 7L18.4 5.6"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

export const HelpIcon: React.FC<IconProps> = ({
  color = '#2563EB',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} />
    <Path d="M9.5 9.5C9.5 8.12 10.62 7 12 7C13.38 7 14.5 8.12 14.5 9.5C14.5 10.88 12 11.5 12 13" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    <Circle cx="12" cy="16.5" r="0.75" fill={color} />
  </Svg>
);

export const InfoIcon: React.FC<IconProps> = ({
  color = '#2563EB',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} />
    <Path d="M12 11V16M12 8V8.01" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export const MapPinIcon: React.FC<IconProps> = ({
  color = '#2563EB',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21C12 21 6 15.5 6 10.5C6 7.462 8.686 5 12 5C15.314 5 18 7.462 18 10.5C18 15.5 12 21 12 21Z"
      stroke={color}
      strokeWidth={1.8}
    />
    <Circle cx="12" cy="10.5" r="2.5" stroke={color} strokeWidth={1.8} />
  </Svg>
);

export const FileDocIcon: React.FC<IconProps> = ({
  color = '#2563EB',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 4H14L18 8V18C18 19.105 17.105 20 16 20H8C6.895 20 6 19.105 6 18V6C6 4.895 6.895 4 8 4Z"
      stroke={color}
      strokeWidth={1.8}
    />
    <Path d="M14 4V8H18M9 13H15M9 16H13" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const EyeIcon: React.FC<IconProps> = ({
  color = '#6B7280',
  size = 18,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"
      stroke={color}
      strokeWidth={1.8}
    />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.8} />
  </Svg>
);

export const TrashIcon: React.FC<IconProps> = ({
  color = '#EF4444',
  size = 18,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 7H20M9 7V5H15V7M7 7L8 19H16L17 7" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const EditIcon: React.FC<IconProps> = ({
  color = '#6B7280',
  size = 18,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 20H8L18 10L14 6L4 16V20Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    <Path d="M14 6L18 10" stroke={color} strokeWidth={1.8} />
  </Svg>
);

export const PlusCircleIcon: React.FC<IconProps> = ({
  color = '#2563EB',
  size = 20,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} />
    <Path d="M12 8V16M8 12H16" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const PhoneIcon: React.FC<IconProps> = ({
  color = '#EF4444',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6.5 4H9L10.5 8.5L8.5 10C9.5 12.5 11.5 14.5 14 15.5L15.5 13.5L20 15V17.5C20 18.88 18.88 20 17.5 20C9.83 20 4 14.17 4 6.5C4 5.12 5.12 4 6.5 4Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
  </Svg>
);

export const SendIcon: React.FC<IconProps> = ({
  color = '#FFFFFF',
  size = 20,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 12L20 4L13 20L11 13L4 12Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
  </Svg>
);

export const PaperclipIcon: React.FC<IconProps> = ({
  color = '#2563EB',
  size = 20,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 12V8C8 5.79 9.79 4 12 4C14.21 4 16 5.79 16 8V14C16 16.21 14.21 18 12 18C9.79 18 8 16.21 8 14V10"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

export const CameraIcon: React.FC<IconProps> = ({
  color = '#2563EB',
  size = 20,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 8H8L9.5 5.5H14.5L16 8H20V18H4V8Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="13" r="3" stroke={color} strokeWidth={1.8} />
  </Svg>
);

export const CloudUploadIcon: React.FC<IconProps> = ({
  color = '#2563EB',
  size = 32,
}) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Path
      d="M8 20H24M16 8V18M11 13L16 8L21 13"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6 24H26C27.1 24 28 23.1 28 22V14C28 12.9 27.1 12 26 12H24.5C23.8 8.6 20.8 6 17 6C13.7 6 10.9 8 9.8 11H6C4.9 11 4 11.9 4 13V22C4 23.1 4.9 24 6 24Z"
      stroke={color}
      strokeWidth={1.8}
    />
  </Svg>
);

export const FingerprintIcon: React.FC<IconProps> = ({
  color = '#2563EB',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C9.5 2 7.5 3.5 7 5.5M17 5.5C16.5 3.5 14.5 2 12 2M12 22V18M8 20C5 18 3 15 3 12C3 9 4 6.5 6 5M18 5C20 6.5 21 9 21 12C21 15 19 18 16 20"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.5} />
  </Svg>
);

export const ClockIcon: React.FC<IconProps> = ({
  color = '#2563EB',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} />
    <Path d="M12 7V12L15 14" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const WarningIcon: React.FC<IconProps> = ({
  color = '#EF4444',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 4L21 20H3L12 4Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Path d="M12 10V14M12 17V17.01" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export const RefreshIcon: React.FC<IconProps> = ({
  color = '#2563EB',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 12C4 7.58 7.58 4 12 4C14.5 4 16.7 5.2 18 7M20 12C20 16.42 16.42 20 12 20C9.5 20 7.3 18.8 6 17"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    <Path d="M18 4V7H15M6 20V17H9" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const ChatBubbleIcon: React.FC<IconProps> = ({
  color = '#2563EB',
  size = 20,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 6H19C20.1 6 21 6.9 21 8V15C21 16.1 20.1 17 19 17H10L5 20V8C5 6.9 5.9 6 5 6Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
  </Svg>
);

export const MailTicketIcon: React.FC<IconProps> = ({
  color = '#EF4444',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 7H20C21.1 7 22 7.9 22 9V17C22 18.1 21.1 19 20 19H4C2.9 19 2 18.1 2 17V9C2 7.9 2.9 7 4 7Z"
      stroke={color}
      strokeWidth={1.8}
    />
    <Path d="M2 9L12 14L22 9" stroke={color} strokeWidth={1.8} />
  </Svg>
);

export const InfoCircleIcon: React.FC<IconProps> = ({
  color = '#2563EB',
  size = 20,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} />
    <Path d="M12 11V16M12 8V8.01" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export const LockIcon: React.FC<IconProps> = ({
  color = '#2563EB',
  size = 22,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 11V8C7 5.79 8.79 4 11 4H13C15.21 4 17 5.79 17 8V11M6 11H18C19.1 11 20 11.9 20 13V19C20 20.1 19.1 21 18 21H6C4.9 21 4 20.1 4 19V13C4 11.9 4.9 11 6 11Z"
      stroke={color}
      strokeWidth={1.8}
    />
  </Svg>
);
