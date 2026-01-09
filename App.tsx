
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  Navigation, 
  Radio, 
  Play, 
  Pause, 
  Volume2, 
  MessageCircle,
  Utensils,
  HeartPulse,
  ShoppingBag,
  Wrench,
  GraduationCap,
  PawPrint,
  Home,
  Car,
  Globe,
  ShoppingCart,
  Plus,
  Settings,
  X,
  Download,
  Upload,
  Database,
  MapPin,
  ExternalLink,
  Code,
  LocateFixed,
  Clock,
  ChevronRight,
  ChevronLeft,
  Layers
} from 'lucide-react';
import { BUSINESSES as INITIAL_BUSINESSES, CATEGORIES as INITIAL_CATEGORIES, RADIO_STREAM_URL } from './constants';
import { Business, UserCoords, Category } from './types';
import { getDistance } from './utils';

const IconMap: Record<string, any> = {
  Utensils, HeartPulse, ShoppingBag, Wrench, GraduationCap, 
  PawPrint, Home, Car, Globe, ShoppingCart, Layers
};

const checkIsProduction = () => (window as any).ACHE_AQUI_PROD === true;

const App: React.FC = () => {
  const [isProduction, setIsProduction] = useState(checkIsProduction());
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const [businessesList, setBusinessesList] = useState<Business[]>(() => {
    const injectedData = (window as any).ACHE_AQUI_DATA;
    if (injectedData) return injectedData;
    const saved = localStorage.getItem('ache_aqui_db');
    return saved ? JSON.parse(saved) : INITIAL_BUSINESSES;
  });

  const [categoriesList, setCategoriesList] = useState<Category[]>(() => {
    const injectedCats = (window as any).ACHE_AQUI_CATS;
    if (injectedCats) return injectedCats;
    const saved = localStorage.getItem('ache_aqui_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<UserCoords | null>(null);
  const [isGpsBannerVisible, setIsGpsBannerVisible] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const featuredBusinesses = useMemo(() => businessesList.filter(b => b.isFeatured), [businessesList]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [newBiz, setNewBiz] = useState<Partial<Business>>({
    name: '', description: '', logo: '', banner: '', category: '', 
    whatsapp: '', address: '', openingHours: '', isFeatured: false, lat: 0, lng: 0
  });

  useEffect(() => {
    if (!newBiz.category && categoriesList.length > 0) {
      setNewBiz(prev => ({ ...prev, category: categoriesList[0].type }));
    }
  }, [categoriesList]);

  const [newCat, setNewCat] = useState<Category>({
    type: '', icon: 'Layers', color: 'bg-blue-600'
  });

  useEffect(() => {
    setIsProduction(checkIsProduction());
    if (!checkIsProduction()) {
      localStorage.setItem('ache_aqui_db', JSON.stringify(businessesList));
      localStorage.setItem('ache_aqui_categories', JSON.stringify(categoriesList));
    }
  }, [businessesList, categoriesList]);

  // Timer para o Banner do Topo
  useEffect(() => {
    const timer = setInterval(() => {
      if (featuredBusinesses.length > 0) {
        setCurrentSlide(prev => (prev + 1) % featuredBusinesses.length);
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredBusinesses.length]);

  // Efeito de Autoscroll para o Carrossel Premium
  useEffect(() => {
    if (!searchQuery && !activeCategory && !isHovered && carouselRef.current) {
      const autoScrollTimer = setInterval(() => {
        if (carouselRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
          const maxScroll = scrollWidth - clientWidth;
          
          if (scrollLeft >= maxScroll - 10) {
            carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            // Desloca para o próximo card (largura aproximada do card + gap)
            carouselRef.current.scrollTo({ left: scrollLeft + 320, behavior: 'smooth' });
          }
        }
      }, 4000);
      return () => clearInterval(autoScrollTimer);
    }
  }, [searchQuery, activeCategory, isHovered, businessesList]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      setIsGpsBannerVisible(true);
    }
  }, []);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      carouselRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const handleRequestGeo = () => {
    if (isLocating) return;
    setIsLocating(true);
    const geoOptions = { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 };
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsGpsBannerVisible(false);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        alert("Não conseguimos acessar sua localização.");
      },
      geoOptions
    );
  };

  const toggleRadio = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else {
        audioRef.current.volume = volume;
        audioRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const exportForGoogleSites = () => {
    const dataString = JSON.stringify(businessesList);
    const catString = JSON.stringify(categoriesList);
    const dataScript = `<script>window.ACHE_AQUI_PROD = true; window.ACHE_AQUI_DATA = ${dataString}; window.ACHE_AQUI_CATS = ${catString};</script>`;
    const currentHtml = document.documentElement.outerHTML;
    let finalHtml = currentHtml.includes('</head>') ? currentHtml.replace('</head>', `${dataScript}</head>`) : currentHtml.replace('</body>', `${dataScript}</body>`);
    navigator.clipboard.writeText(`<!DOCTYPE html>\n${finalHtml}`).then(() => alert("CÓDIGO COPIADO! ✅"));
  };

  const handleExportBackup = () => {
    const blob = new Blob([JSON.stringify({ businesses: businessesList, categories: categoriesList }, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `backup_guia_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.businesses) { setBusinessesList(json.businesses); if (json.categories) setCategoriesList(json.categories); alert("Sucesso! ✅"); }
      } catch (err) { alert("Erro ao ler backup."); }
    };
    reader.readAsText(file);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.type) return;
    setCategoriesList([...categoriesList, { ...newCat }]);
    setNewCat({ type: '', icon: 'Layers', color: 'bg-blue-600' });
  };

  const filteredBusinesses = useMemo(() => {
    let list = [...businessesList];
    const query = searchQuery.toLowerCase();
    
    if (!searchQuery && !activeCategory) {
      list = list.filter(b => b.isFeatured);
    } else {
      list = list.filter(b => {
        const matchesSearch = b.name.toLowerCase().includes(query) || b.category.toLowerCase().includes(query);
        const matchesCategory = !activeCategory || b.category === activeCategory;
        return matchesSearch && matchesCategory;
      });
    }

    if (userCoords) {
      list = list.map(b => ({ ...b, distance: (b.lat && b.lng) ? getDistance(userCoords.lat, userCoords.lng, b.lat, b.lng) : 9999 }))
                 .sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }
    return list;
  }, [searchQuery, activeCategory, userCoords, businessesList]);

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      <nav className="bg-blue-600 sticky top-0 z-50 p-4 shadow-lg flex items-center gap-3">
        <div className="bg-white px-2 py-1 rounded-lg font-black text-blue-600 text-xl shadow-sm">A</div>
        <div className="relative flex-1 flex items-center bg-white rounded-xl shadow-inner px-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" placeholder="O que você busca hoje?" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-transparent px-2 py-2 text-sm outline-none border-none" />
          <button onClick={handleRequestGeo} className={`p-1.5 rounded-lg ${userCoords ? 'text-blue-600' : 'text-slate-300'}`}><LocateFixed className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''}`} /></button>
        </div>
        {!isProduction && <button onClick={() => setIsAdminOpen(true)} className="text-white p-2"><Settings className="w-6 h-6" /></button>}
      </nav>

      <main className="max-w-4xl mx-auto px-4">
        {isGpsBannerVisible && !userCoords && (
          <div className="mt-4 mb-4 bg-blue-600 rounded-3xl p-4 flex items-center justify-between text-white shadow-xl">
            <div className="flex items-center gap-3"><Navigation className="w-5 h-5 animate-pulse" /><p className="text-[10px] font-black uppercase">Encontrar o mais próximo?</p></div>
            <button onClick={handleRequestGeo} className="bg-white text-blue-600 px-5 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg">Ativar Radar</button>
          </div>
        )}

        {featuredBusinesses.length > 0 && (
          <div className="mt-4 mb-4 relative overflow-hidden rounded-[2.5rem] aspect-video sm:aspect-[21/9] bg-slate-900 shadow-2xl border-4 border-white">
            {featuredBusinesses.map((b, idx) => (
              <div key={b.id} className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                <img src={b.banner || b.logo} className="w-full h-full object-cover opacity-60" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent flex flex-col justify-end p-8">
                  <h2 className="text-white font-black uppercase text-2xl sm:text-3xl tracking-tighter leading-none">{b.name}</h2>
                  <p className="text-blue-400 text-[10px] font-bold uppercase mt-1 tracking-widest">Destaque da Semana</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mb-6 bg-slate-950 rounded-[1.8rem] p-4 flex items-center justify-between shadow-2xl border border-white/5 gap-3">
          <div className="flex items-center gap-3 shrink-0">
            <div className={`w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white ${isPlaying ? 'animate-pulse' : ''}`}><Radio className="w-5 h-5" /></div>
            <div className="flex flex-col"><div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span><span className="text-red-500 text-[10px] font-black uppercase">Ao Vivo</span></div><span className="text-slate-300 text-[11px] font-bold uppercase">Rádio Ache Aqui</span></div>
          </div>
          <div className="flex-1 flex items-center gap-2 bg-white/5 px-3 py-2 rounded-full max-w-[120px]">
            <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => { const v = parseFloat(e.target.value); setVolume(v); if (audioRef.current) audioRef.current.volume = v; }} className="w-full h-1 bg-slate-700 rounded-lg appearance-none" />
          </div>
          <button onClick={toggleRadio} className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-slate-900">{isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}</button>
          <audio ref={audioRef} src={RADIO_STREAM_URL} crossOrigin="anonymous" />
        </div>

        <div className="flex gap-4 py-4 mb-4 overflow-x-auto no-scrollbar scroll-smooth">
          {categoriesList.map((cat) => (
            <button key={cat.type} onClick={() => setActiveCategory(activeCategory === cat.type ? null : cat.type)} className="flex flex-col items-center gap-2 shrink-0">
              <div className={`${cat.color} ${activeCategory === cat.type ? 'ring-4 ring-blue-400 scale-110' : 'opacity-90'} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all`}>
                {React.createElement(IconMap[cat.icon] || Layers, { className: "w-5 h-5" })}
              </div>
              <span className={`text-[8px] font-black uppercase ${activeCategory === cat.type ? 'text-blue-600' : 'text-slate-400'}`}>{cat.type.slice(0, 8)}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">
            {!searchQuery && !activeCategory ? 'Parceiros Premium' : 'Resultado da Busca'}
          </h2>
          {!searchQuery && !activeCategory && filteredBusinesses.length > 1 && (
             <div className="flex gap-2">
                <button onClick={() => scrollCarousel('left')} className="p-1 bg-white rounded-full shadow border text-slate-400"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => scrollCarousel('right')} className="p-1 bg-white rounded-full shadow border text-slate-400"><ChevronRight className="w-4 h-4" /></button>
             </div>
          )}
        </div>

        {!searchQuery && !activeCategory ? (
          <div 
            className="relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setIsHovered(false)}
          >
            <div 
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-1 pb-8 snap-x snap-mandatory scroll-smooth"
            >
              {filteredBusinesses.map((biz) => (
                <div 
                  key={biz.id} 
                  onClick={() => setSelectedBusiness(biz)}
                  className="bg-white p-5 rounded-[2.5rem] min-w-[300px] sm:min-w-[350px] flex flex-col gap-4 shadow-md border border-slate-100 transition-all hover:shadow-xl cursor-pointer snap-center group relative overflow-hidden"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <img src={biz.logo} className="w-20 h-20 rounded-2xl object-cover shadow-inner" alt="" />
                      <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 p-1 rounded-full shadow-lg border-2 border-white">
                        <Plus className="w-3 h-3 fill-current" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-sm uppercase truncate text-slate-800 group-hover:text-blue-600 transition-colors">{biz.name}</h3>
                      <span className="inline-block bg-slate-100 px-2 py-0.5 rounded-lg text-[8px] font-bold text-slate-400 uppercase tracking-widest">{biz.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
                    <div className="flex flex-col">
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Atendimento</span>
                      <p className="text-[10px] font-bold text-slate-700">{biz.openingHours}</p>
                    </div>
                    {biz.distance && biz.distance < 9999 && (
                      <div className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-[9px] font-black flex items-center gap-1 shadow-sm">
                        <Navigation className="w-2 h-2" /> {biz.distance.toFixed(1)} km
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] font-black text-blue-600 uppercase flex items-center justify-between group-hover:px-1 transition-all">
                    <span>Ver Informações</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBusinesses.map((biz, index) => {
              const isClosest = userCoords && index === 0;
              return (
                <div key={biz.id} onClick={() => setSelectedBusiness(biz)} className={`bg-white p-4 rounded-[2rem] flex items-center gap-4 shadow-sm border cursor-pointer group active:scale-[0.98] ${isClosest ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/10' : 'border-slate-100'}`}>
                  <div className="relative shrink-0">
                    <img src={biz.logo} className="w-16 h-16 rounded-2xl object-cover shadow-inner" alt="" />
                    {biz.isFeatured && <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 p-1 rounded-full border border-white"><Plus className="w-2 h-2 fill-current" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-xs sm:text-sm uppercase truncate text-slate-800 mb-1 group-hover:text-blue-600">{biz.name}</h3>
                    <div className="flex items-center gap-2 mb-1">
                      {biz.distance && biz.distance < 9999 && <span className={`text-[8px] font-black ${biz.distance < 2 ? 'bg-green-600' : 'bg-blue-600'} text-white px-2 py-0.5 rounded-md uppercase flex items-center gap-1`}><Navigation className="w-2 h-2" /> {biz.distance.toFixed(1)} km</span>}
                      <span className="text-[8px] font-bold text-slate-400 uppercase">{biz.category}</span>
                    </div>
                    <p className="text-[9px] text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {biz.openingHours}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </div>
              );
            })}
          </div>
        )}

        {selectedBusiness && (
          <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500">
              <div className="relative h-48 sm:h-56">
                <img src={selectedBusiness.banner || selectedBusiness.logo} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent"></div>
                <button onClick={() => setSelectedBusiness(null)} className="absolute top-6 right-6 bg-black/30 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/50 transition-all shadow-lg"><X className="w-6 h-6" /></button>
              </div>
              <div className="px-8 pb-10 -mt-14 relative z-10 text-center sm:text-left">
                <div className="bg-white p-2 rounded-[2rem] shadow-2xl w-28 h-28 mb-4 border-4 border-white mx-auto sm:mx-0"><img src={selectedBusiness.logo} className="w-full h-full object-cover rounded-[1.5rem]" /></div>
                <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tighter leading-none mb-2">{selectedBusiness.name}</h2>
                <div className="flex justify-center sm:justify-start">
                  <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase mb-6 tracking-widest">{selectedBusiness.category}</span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">{selectedBusiness.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left"><MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" /><div className="flex flex-col"><span className="text-[9px] font-black text-slate-400 uppercase">Local</span><p className="text-[11px] font-bold text-slate-700 leading-tight">{selectedBusiness.address}</p></div></div>
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left"><Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" /><div className="flex flex-col"><span className="text-[9px] font-black text-slate-400 uppercase">Horário</span><p className="text-[11px] font-bold text-slate-700 leading-tight">{selectedBusiness.openingHours}</p></div></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <a href={`https://wa.me/${selectedBusiness.whatsapp}`} target="_blank" className="bg-green-500 text-white p-5 rounded-[1.5rem] font-black uppercase text-xs flex items-center justify-center gap-3 shadow-xl shadow-green-100 hover:scale-105 active:scale-95 transition-all"><MessageCircle className="w-5 h-5 fill-current" /> WhatsApp</a>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedBusiness.address)}`} target="_blank" className="bg-blue-600 text-white p-5 rounded-[1.5rem] font-black uppercase text-xs flex items-center justify-center gap-3 shadow-xl shadow-blue-100 hover:scale-105 active:scale-95 transition-all"><Navigation className="w-5 h-5" /> Abrir GPS</a>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 mb-8 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[3rem] p-10 text-center text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <h2 className="text-3xl font-black uppercase mb-3 tracking-tighter relative z-10">Sua Marca Aqui!</h2>
          <p className="text-sm font-medium mb-8 text-blue-100 max-w-md mx-auto relative z-10">Destaque seu negócio no maior guia da região.</p>
          <a href="https://wa.me/5585992908713" target="_blank" className="bg-white text-blue-700 px-10 py-5 rounded-[1.5rem] font-black uppercase text-sm shadow-2xl flex items-center justify-center gap-4 mx-auto max-w-xs relative z-10 hover:shadow-white/20 hover:scale-105 active:scale-95 transition-all">
            <MessageCircle className="w-6 h-6 fill-current" /> Quero Anunciar
          </a>
        </div>
      </main>

      {!isProduction && isAdminOpen && (
        <div className="fixed inset-0 z-[150] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
              <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tighter">Gestão do Guia</h2>
              <button onClick={() => setIsAdminOpen(false)} className="bg-slate-100 p-3 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-3 mb-10 bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Publicação</p>
              <button onClick={exportForGoogleSites} className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white p-5 rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-blue-700 transition-all">
                <Code className="w-5 h-5" /> GERAR CÓDIGO GOOGLE SITES
              </button>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button onClick={handleExportBackup} className="bg-slate-800 text-white p-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3"><Download className="w-4 h-4" /> SALVAR DADOS</button>
                <label className="bg-white text-slate-600 p-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3 cursor-pointer border-2 border-dashed border-slate-200 hover:border-blue-400 transition-all">
                  <Upload className="w-4 h-4" /> CARREGAR DADOS
                  <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                </label>
              </div>
            </div>
            <div className="mb-12">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Categorias do Guia</p>
              <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 bg-slate-50 p-6 rounded-[2rem]">
                <input type="text" placeholder="Nome" className="bg-white p-4 rounded-xl text-sm border-none shadow-sm" required value={newCat.type} onChange={e=>setNewCat({...newCat, type:e.target.value})} />
                <input type="text" placeholder="Ícone Lucide" className="bg-white p-4 rounded-xl text-sm border-none shadow-sm" value={newCat.icon} onChange={e=>setNewCat({...newCat, icon:e.target.value})} />
                <input type="text" placeholder="Classe Tailwind" className="bg-white p-4 rounded-xl text-sm border-none shadow-sm" value={newCat.color} onChange={e=>setNewCat({...newCat, color:e.target.value})} />
                <button type="submit" className="sm:col-span-3 bg-slate-900 text-white p-4 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-3 hover:bg-black transition-all">
                  <Plus className="w-4 h-4" /> Adicionar Categoria
                </button>
              </form>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              setBusinessesList([...businessesList, { ...newBiz, id: Date.now().toString() } as Business]);
              setNewBiz({ name: '', description: '', logo: '', banner: '', category: categoriesList[0]?.type || '', whatsapp: '', address: '', openingHours: '', isFeatured: false, lat: 0, lng: 0 });
              alert('Parceiro adicionado com sucesso! ✅');
            }} className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Adicionar Novo Parceiro</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-[2rem]">
                <div className="flex flex-col gap-1.5"><span className="text-[9px] font-black uppercase text-slate-400 ml-2">Nome Comercial</span><input type="text" className="bg-white p-4 rounded-xl text-sm border-none shadow-sm" required value={newBiz.name} onChange={e=>setNewBiz({...newBiz, name:e.target.value})} /></div>
                <div className="flex flex-col gap-1.5"><span className="text-[9px] font-black uppercase text-slate-400 ml-2">Categoria</span><select className="bg-white p-4 rounded-xl text-sm border-none shadow-sm" value={newBiz.category} onChange={e=>setNewBiz({...newBiz, category:e.target.value})}>{categoriesList.map(c=><option key={c.type} value={c.type}>{c.type}</option>)}</select></div>
                <div className="flex flex-col gap-1.5"><span className="text-[9px] font-black uppercase text-slate-400 ml-2">Logo (URL)</span><input type="text" className="bg-white p-4 rounded-xl text-sm border-none shadow-sm" value={newBiz.logo} onChange={e=>setNewBiz({...newBiz, logo:e.target.value})} /></div>
                <div className="flex flex-col gap-1.5"><span className="text-[9px] font-black uppercase text-slate-400 ml-2">Funcionamento</span><input type="text" className="bg-white p-4 rounded-xl text-sm border-none shadow-sm" value={newBiz.openingHours} onChange={e=>setNewBiz({...newBiz, openingHours:e.target.value})} /></div>
                <div className="flex flex-col gap-1.5 col-span-full"><span className="text-[9px] font-black uppercase text-slate-400 ml-2">Endereço Completo</span><input type="text" className="bg-white p-4 rounded-xl text-sm border-none shadow-sm" value={newBiz.address} onChange={e=>setNewBiz({...newBiz, address:e.target.value})} /></div>
                <label className="flex items-center gap-3 p-4 bg-white rounded-xl col-span-full cursor-pointer shadow-sm">
                  <input type="checkbox" checked={newBiz.isFeatured} onChange={e=>setNewBiz({...newBiz, isFeatured:e.target.checked})} className="w-5 h-5 rounded border-none bg-slate-100 text-blue-600" />
                  <span className="text-xs font-black uppercase text-slate-500">Destaque Premium (Aparece na Home)</span>
                </label>
                <div className="col-span-full">
                   <button type="submit" className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-3 shadow-lg hover:bg-blue-700 transition-all">
                    <Plus className="w-6 h-6" /> CADASTRAR PARCEIRO
                  </button>
                </div>
              </div>
            </form>
            <div className="mt-12">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Empresas Cadastradas</p>
              <div className="space-y-2">
                {businessesList.map(b => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-white border rounded-xl">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                      <img src={b.logo} className="w-8 h-8 rounded shadow-sm object-cover" />
                      {b.name}
                    </div>
                    <button onClick={() => confirm(`Excluir ${b.name}?`) && setBusinessesList(businessesList.filter(x => x.id !== b.id))} className="text-red-400 p-2 hover:bg-red-50 rounded-full"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="py-12 bg-white border-t text-center flex flex-col gap-3">
        <div className="flex justify-center"><div className="bg-blue-600 px-6 py-2 rounded-full text-white font-black text-[11px] shadow-xl uppercase tracking-[2px]">Guia Ache Aqui</div></div>
        <p className="text-slate-900 font-black uppercase text-[12px] tracking-[4px]">Desenvolvido por Bossa Infor</p>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[5px]">Crescendo junto com o comércio local</p>
      </footer>
    </div>
  );
};

export default App;
