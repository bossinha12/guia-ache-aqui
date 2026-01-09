
export interface Business {
  id: string;
  name: string;
  description: string;
  logo: string;
  banner?: string;
  category: string;
  whatsapp: string;
  address: string;
  openingHours: string;
  isFeatured: boolean;
  lat?: number;
  lng?: number;
  distance?: number;
}

export interface Category {
  type: string;
  icon: string;
  color: string;
}

export interface UserCoords {
  lat: number;
  lng: number;
}
