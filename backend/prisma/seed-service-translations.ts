import type { SubServiceSeed } from './seed-services-catalog';

type HiCopy = {
  displayName: string;
  shortDescription: string;
  richDescription: string;
  instructions: string;
};

const HI_BY_SLUG: Record<string, HiCopy> = {
  'pm-kisan-registration': {
    displayName: 'पीएम-किसान सम्मान निधि',
    shortDescription: '₹6,000/वर्ष किसान आय सहायता के लिए पंजीकरण',
    richDescription:
      'पीएम-किसान के तहत पात्र किसान परिवारों को वित्तीय सहायता प्राप्त करने के लिए पंजीकरण करें।',
    instructions: 'भूमि और बैंक विवरण आधार रिकॉर्ड से मेल खाने चाहिए।',
  },
  'pm-awas-yojna': {
    displayName: 'प्रधानमंत्री आवास योजना (PMAY)',
    shortDescription: 'ग्रामीण और शहरी परिवारों के लिए किफायती आवास',
    richDescription:
      'PMAY के अंतर्गत पक्का आवास और बुनियादी सुविधाओं के लिए आवेदन करें।',
    instructions: 'पात्रता मानदंडों के अनुसार आधार-लिंक बैंक खाता आवश्यक है।',
  },
  'income-certificate': {
    displayName: 'आय प्रमाण पत्र',
    shortDescription: 'आधिकारिक आय प्रमाण पत्र',
    richDescription: 'छात्रवृत्ति, सब्सिडी और सरकारी योजनाओं के लिए आय प्रमाण पत्र।',
    instructions: 'आवेदक का पता और पहचान प्रमाण सही होना चाहिए।',
  },
  'pan-card-application': {
    displayName: 'PAN कार्ड आवेदन',
    shortDescription: 'नया PAN या सुधार आवेदन',
    richDescription: 'आयकर विभाग के माध्यम से PAN कार्ड के लिए आवेदन करें।',
    instructions: 'आधार और पहचान प्रमाण अपलोड करें।',
  },
};

export function buildServiceTranslations(seed: SubServiceSeed) {
  const hi = HI_BY_SLUG[seed.slug];
  if (!hi) return {};
  return {
    hi: {
      displayName: hi.displayName,
      shortDescription: hi.shortDescription,
      richDescription: hi.richDescription,
      instructions: hi.instructions,
    },
  };
}
