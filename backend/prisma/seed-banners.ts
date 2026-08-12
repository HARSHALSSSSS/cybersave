import { PrismaClient } from '@prisma/client';

type BannerSeed = {
  tag: string;
  title: string;
  description: string;
  ctaLabel: string;
  gradientStart: string;
  gradientMiddle?: string;
  gradientEnd: string;
  mainServiceSlug: string;
  subServiceSlug: string;
  placement?: string;
  displayOrder: number;
  translations?: Record<string, Record<string, string>>;
};

const DEFAULT_BANNERS: BannerSeed[] = [
  {
    tag: 'NEW SCHEME',
    title: 'PM-Kisan Samman Nidhi',
    description:
      'Eligible farmers get ₹6,000 yearly directly into bank accounts. Apply easily today.',
    ctaLabel: 'Check Eligibility',
    gradientStart: '#1E40AF',
    gradientMiddle: '#2563EB',
    gradientEnd: '#3B82F6',
    mainServiceSlug: 'agriculture-rural',
    subServiceSlug: 'pm-kisan-registration',
    placement: 'home',
    displayOrder: 1,
    translations: {
      hi: {
        tag: 'नई योजना',
        title: 'पीएम-किसान सम्मान निधि',
        description:
          'पात्र किसानों को वर्ष में ₹6,000 सीधे बैंक खाते में। आज ही आवेदन करें।',
        ctaLabel: 'पात्रता जांचें',
      },
    },
  },
  {
    tag: 'HOUSING SCHEME',
    title: 'Pradhan Mantri Awas Yojana',
    description:
      'Affordable pucca housing with basic amenities for eligible rural and urban families.',
    ctaLabel: 'Apply Now',
    gradientStart: '#0F766E',
    gradientMiddle: '#0D9488',
    gradientEnd: '#14B8A6',
    mainServiceSlug: 'social-welfare',
    subServiceSlug: 'pm-awas-yojna',
    placement: 'home',
    displayOrder: 2,
    translations: {
      hi: {
        tag: 'आवास योजना',
        title: 'प्रधानमंत्री आवास योजना',
        description:
          'पात्र ग्रामीण और शहरी परिवारों के लिए किफायती पक्का आवास और बुनियादी सुविधाएं।',
        ctaLabel: 'अभी आवेदन करें',
      },
    },
  },
];

export async function seedHomeBanners(prisma: PrismaClient) {
  console.log('Seeding home banners...');

  for (const seed of DEFAULT_BANNERS) {
    const mainService = await prisma.mainService.findUnique({
      where: { slug: seed.mainServiceSlug },
    });
    if (!mainService) {
      console.warn(`  skip banner "${seed.title}": main service ${seed.mainServiceSlug} not found`);
      continue;
    }

    const subService = await prisma.subService.findUnique({
      where: {
        mainServiceId_slug: {
          mainServiceId: mainService.id,
          slug: seed.subServiceSlug,
        },
      },
    });
    if (!subService) {
      console.warn(`  skip banner "${seed.title}": sub-service ${seed.subServiceSlug} not found`);
      continue;
    }

    const published = await prisma.serviceVersion.findFirst({
      where: {
        subServiceId: subService.id,
        lifecycleStatus: 'PUBLISHED',
      },
    });
    if (!published) {
      console.warn(`  skip banner "${seed.title}": no published version for ${seed.subServiceSlug}`);
      continue;
    }

    const placement = seed.placement ?? 'home';
    const existing = await prisma.homeBanner.findFirst({
      where: { subServiceId: subService.id, placement },
    });

    const data = {
      tag: seed.tag,
      title: seed.title,
      description: seed.description,
      ctaLabel: seed.ctaLabel,
      gradientStart: seed.gradientStart,
      gradientMiddle: seed.gradientMiddle ?? null,
      gradientEnd: seed.gradientEnd,
      mainServiceId: mainService.id,
      subServiceId: subService.id,
      placement,
      displayOrder: seed.displayOrder,
      isActive: true,
      translations: seed.translations ?? {},
    };

    if (existing) {
      await prisma.homeBanner.update({ where: { id: existing.id }, data });
    } else {
      await prisma.homeBanner.create({ data });
    }

    console.log(`  banner: ${seed.title} → ${seed.subServiceSlug}`);
  }

  console.log('Home banners seed complete.');
}
