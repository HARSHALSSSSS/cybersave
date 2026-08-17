import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import {
  homeBannersApi,
  homeBannersQueryKeys,
  type HomeBanner,
} from '@/services/api';

function bannerHref(banner: HomeBanner) {
  if (banner.mainServiceSlug && banner.subServiceSlug) {
    return `/services/${banner.mainServiceSlug}/${banner.subServiceSlug}`;
  }
  return '/services';
}

export function HomeBannerStrip({ placement = 'home' }: { placement?: string }) {
  const { data: banners = [] } = useQuery({
    queryKey: homeBannersQueryKeys.list(placement),
    queryFn: () => homeBannersApi.getHomeBanners(placement),
    staleTime: 1000 * 60 * 5,
  });

  if (banners.length === 0) return null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {banners.map(banner => (
        <Link
          key={banner.id}
          to={bannerHref(banner)}
          className="group relative min-h-[180px] min-w-[280px] max-w-[360px] shrink-0 overflow-hidden rounded-3xl p-6 text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl sm:min-w-[320px]"
          style={{
            background: banner.gradientMiddle
              ? `linear-gradient(135deg, ${banner.gradientStart} 0%, ${banner.gradientMiddle} 52%, ${banner.gradientEnd} 100%)`
              : `linear-gradient(135deg, ${banner.gradientStart} 0%, ${banner.gradientEnd} 100%)`,
          }}
        >
          {banner.tag ? (
            <span className="inline-flex rounded-full bg-white/18 px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase">
              {banner.tag}
            </span>
          ) : null}
          <h3 className="mt-3 text-xl font-bold leading-snug">{banner.title}</h3>
          {banner.description ? (
            <p className="mt-2 text-sm leading-6 text-white/85">{banner.description}</p>
          ) : null}
          <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold">
            {banner.ctaLabel}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </Link>
      ))}
    </div>
  );
}
