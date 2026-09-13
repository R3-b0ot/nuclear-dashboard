export type DashboardRegion = {
  id: string;
  countryCode: string;
  name: string;
  languages: string[];
  discoveryQueries: string[];
};

export const REGIONS: Record<string, DashboardRegion> = {
  india: {
    id: 'india',
    countryCode: 'IN',
    name: 'India',
    languages: ['hi', 'mr', 'pa', 'ta', 'te', 'bn', 'gu', 'kn', 'ml'],
    discoveryQueries: [
      'India trending music',
      'Hindi hits India',
      'Indian pop',
      'Bollywood hits',
      'Marathi hits',
      'Punjabi hits',
      'Tamil hits',
      'Telugu hits',
      'Bengali hits',
      'Gujarati hits',
      'Kannada hits',
      'Malayalam hits',
    ],
  },
};

export const DEFAULT_REGION = REGIONS.india;

export const getRegion = (id: string | undefined): DashboardRegion =>
  (id && REGIONS[id]) || DEFAULT_REGION;
