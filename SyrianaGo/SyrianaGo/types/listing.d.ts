export interface Listing {
  _id: string;
  name: {
    en: string;
    fr: string;
    ar: string;
  };
  description: {
    en: string;
    fr: string;
    ar: string;
  };
  pricePerDay: number;
  images: string[];
  subcategory: string;
  location?: {
    city?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  isFeatured?: boolean;
  vendor?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}
