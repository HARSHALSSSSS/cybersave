import React from 'react';
import { ServiceIconKey } from '@constants/index';
import {
  BadgeIcon,
  BankIcon,
  BillIcon,
  BoltIcon,
  BookIcon,
  CalendarIcon,
  CardIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentIcon,
  DownloadIcon,
  EditIcon,
  EyeIcon,
  FileDocIcon,
  GridIcon,
  HealthIcon,
  HelpIcon,
  HomeIcon,
  HouseIcon,
  MapPinIcon,
  PhoneIcon,
  PlusIcon,
  RefreshIcon,
  ShareIcon,
  ShieldIcon,
  UmbrellaIcon,
  UserIcon,
  WalletIcon,
  WaterIcon,
} from '@components/icons';

type ServiceIconProps = {
  name: ServiceIconKey | string;
  color?: string;
  size?: number;
};

export const ServiceIcon: React.FC<ServiceIconProps> = ({
  name,
  color = '#2563EB',
  size = 24,
}) => {
  switch (name) {
    case 'shield':
      return <ShieldIcon color={color} size={size} />;
    case 'card':
      return <CardIcon color={color} size={size} />;
    case 'badge':
      return <BadgeIcon color={color} size={size} />;
    case 'bill':
      return <BillIcon color={color} size={size} />;
    case 'bank':
      return <BankIcon color={color} size={size} />;
    case 'umbrella':
      return <UmbrellaIcon color={color} size={size} />;
    case 'book':
      return <BookIcon color={color} size={size} />;
    case 'leaf':
      return <BoltIcon color={color} size={size} />;
    case 'health':
      return <HealthIcon color={color} size={size} />;
    case 'building':
      return <HouseIcon color={color} size={size} />;
    case 'users':
      return <UserIcon color={color} size={size} />;
    case 'briefcase':
      return <DocumentIcon color={color} size={size} />;
    case 'tax':
      return <FileDocIcon color={color} size={size} />;
    case 'home':
      return <HomeIcon color={color} size={size} />;
    case 'phone':
      return <PhoneIcon color={color} size={size} />;
    case 'user':
      return <UserIcon color={color} size={size} />;
    case 'download':
      return <DownloadIcon color={color} size={size} />;
    case 'clock':
      return <ClockIcon color={color} size={size} />;
    case 'calendar':
      return <CalendarIcon color={color} size={size} />;
    case 'link':
      return <ShareIcon color={color} size={size} />;
    case 'edit':
      return <EditIcon color={color} size={size} />;
    case 'copy':
      return <FileDocIcon color={color} size={size} />;
    case 'eye':
      return <EyeIcon color={color} size={size} />;
    case 'check':
      return <CheckCircleIcon color={color} size={size} />;
    case 'folder':
      return <FileDocIcon color={color} size={size} />;
    case 'heart':
      return <HealthIcon color={color} size={size} />;
    case 'map':
      return <MapPinIcon color={color} size={size} />;
    case 'bolt':
      return <BoltIcon color={color} size={size} />;
    case 'water':
      return <WaterIcon color={color} size={size} />;
    case 'wallet':
      return <WalletIcon color={color} size={size} />;
    case 'document':
      return <DocumentIcon color={color} size={size} />;
    case 'plus':
      return <PlusIcon color={color} size={size} />;
    case 'refresh':
      return <RefreshIcon color={color} size={size} />;
    default:
      return <GridIcon color={color} size={size} />;
  }
};

export const ServiceHelpButton: React.FC<{ onPress?: () => void }> = ({
  onPress,
}) => (
  <HelpIcon color="#0A1629" size={20} />
);
