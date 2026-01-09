
import { Business, Category } from './types';

export const BUSINESSES: Business[] = [
  {
    id: "1767828687857",
    name: "Bossa Infor Produtora",
    description: "Gravações de comerciais em áudio e vídeo para carro de som, porta de loja, igrejas e criação de vídeos comerciais para redes sociais.",
    logo: "https://i.postimg.cc/R0TvZcFm/BOSSA.png",
    banner: "https://i.postimg.cc/R0TvZcFm/BOSSA.png",
    category: "SERVIÇOS",
    whatsapp: "5585992862177",
    address: "Cond Machado de Assis 255",
    openingHours: "08:00 - 22:00",
    isFeatured: true
  },
  {
    id: "1",
    name: "Pizzaria Bella Napoli",
    description: "A melhor pizza artesanal da cidade com forno a lenha.",
    logo: "https://picsum.photos/id/42/200/200",
    banner: "https://picsum.photos/id/42/800/400",
    category: "ALIMENTAÇÃO",
    whatsapp: "5511999999999",
    address: "Rua das Flores, 123 - Centro",
    openingHours: "18:00 - 23:30",
    isFeatured: true,
    lat: -3.7319, // Sample coords for demo
    lng: -38.5267
  },
  {
    id: "2",
    name: "Clínica Sorriso Real",
    description: "Excelência em odontologia estética e cuidados preventivos.",
    logo: "https://picsum.photos/id/64/200/200",
    banner: "https://picsum.photos/id/64/800/400",
    category: "SAÚDE",
    whatsapp: "5511888888888",
    address: "Av. Paulista, 1500 - Bela Vista",
    openingHours: "08:00 - 18:00",
    isFeatured: true,
    lat: -3.7419,
    lng: -38.5367
  },
  {
    id: "3",
    name: "Pet Shop Amigão",
    description: "Tudo para o seu melhor amigo: Banho, tosa e rações premium.",
    logo: "https://picsum.photos/id/237/200/200",
    banner: "https://picsum.photos/id/237/800/400",
    category: "PETS",
    whatsapp: "5511777777777",
    address: "Alameda dos Pets, 45",
    openingHours: "09:00 - 19:00",
    isFeatured: true,
    lat: -3.7519,
    lng: -38.5467
  }
];

export const CATEGORIES: Category[] = [
  { type: "ALIMENTAÇÃO", icon: "Utensils", color: "bg-orange-500" },
  { type: "SAÚDE", icon: "HeartPulse", color: "bg-red-500" },
  { type: "COMÉRCIO", icon: "ShoppingBag", color: "bg-blue-500" },
  { type: "SERVIÇOS", icon: "Wrench", color: "bg-green-500" },
  { type: "EDUCAÇÃO", icon: "GraduationCap", color: "bg-purple-500" },
  { type: "PETS", icon: "PawPrint", color: "bg-yellow-600" },
  { type: "CASA & OBRA", icon: "Home", color: "bg-blue-700" },
  { type: "AUTOMOTIVO", icon: "Car", color: "bg-slate-700" },
  { type: "UTILIDADES", icon: "Globe", color: "bg-teal-500" },
  { type: "MERCADOS", icon: "ShoppingCart", color: "bg-pink-500" }
];

export const RADIO_STREAM_URL = "https://stream.zeno.fm/gsstolze3mjtv";
