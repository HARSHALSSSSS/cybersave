import { Lock } from 'lucide-react';

export function SecurityNotice({ className }: { className?: string }) {
  return (
    <p className={`flex items-start gap-2 text-xs leading-5 text-[#9CA3AF] ${className ?? ''}`}>
      <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      Your data is secured using 256-bit encryption. The information gathered here is solely used
      for verification and certification as mandated by government authorities.
    </p>
  );
}

export function SecurityNoticeFull({ className }: { className?: string }) {
  return (
    <p className={`flex items-start gap-2 text-xs leading-5 text-[#9CA3AF] ${className ?? ''}`}>
      <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      Your files and transaction data are stored safely using government mandated 256-bit AES
      encryption. Access is highly restricted for civil registry verification purposes only.
    </p>
  );
}
