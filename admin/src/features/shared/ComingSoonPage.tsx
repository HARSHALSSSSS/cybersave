import { useLocation } from 'react-router';
import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';

function titleFromPath(pathname: string) {
  const segment = pathname.split('/').filter(Boolean).pop() ?? 'page';
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function ComingSoonPage() {
  const location = useLocation();
  const title = titleFromPath(location.pathname);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[70vh] items-center justify-center"
    >
      <Card className="w-full max-w-md border-gray-200 text-center">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB]">
            <Construction className="h-8 w-8" strokeWidth={1.75} />
          </div>
          <div className="space-y-1">
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500">
              This module is coming soon. Our team is working hard to bring it to life.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
