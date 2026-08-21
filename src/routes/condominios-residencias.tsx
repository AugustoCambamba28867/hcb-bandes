import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize2, 
  X, 
  Search, 
  Filter, 
  ArrowRight, 
  ImageIcon,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Property, PROPERTY_TYPES, PROPERTY_STATUSES, PROVINCES } from '@/lib/properties-store';
import { PageHero, Section } from '@/components/section';

export const Route = createFileRoute('/condominios-residencias')({
  component: CondominiosPage,
  head: () => ({
    meta: [
      { title: 'Condomínios & Residências — HCB-BANDES' },
      { name: 'description', content: 'Explore a nossa oferta de condomínios, moradias e apartamentos de excelência.' },
    ],
  }),
});

function usePublicProperties(): Property[] {
  const [properties, setProperties] = useState<Property[]>([]);
  
  useEffect(() => {
    const KEY = 'hcb_properties_v1';
    function load() {
      try {
        const raw = window.localStorage.getItem(KEY);
        if (!raw) { setProperties([]); return; }
        const all: Property[] = JSON.parse(raw);
        setProperties(all.filter(p => p.is_active && p.status !== 'vendido'));
      } catch { 
        setProperties([]); 
      }
    }
    
    load();
    window.addEventListener('hcb_properties_changed', load);
    window.addEventListener('storage', load);
    
    return () => {
      window.removeEventListener('hcb_properties_changed', load);
      window.removeEventListener('storage', load);
    };
  }, []);
  
  return properties;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('pt-AO', { style: 'decimal' }).format(price) + ' AOA';
};

const getTypeColor = (type: Property["type"]) => {
  switch (type) {
    case "condominio":
      return "bg-primary/10 text-primary border-primary/20";
    case "moradia":
      return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
    case "apartamento":
      return "bg-amber-500/10 text-amber-700 border-amber-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const getStatusColor = (status: Property["status"]) => {
  switch (status) {
    case "disponivel":
      return "bg-green-500/10 text-green-700 border-green-500/20";
    case "em_construcao":
      return "bg-amber-500/10 text-amber-700 border-amber-500/20";
    case "pronto_habitar":
      return "bg-primary/10 text-primary border-primary/20";
    case "vendido":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

function PropertyModal({ property, onClose }: { property: Property; onClose: () => void }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Prevent scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const hasImages = property.images && property.images.length > 0;
  
  const nextImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };
  
  const prevImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm sm:p-6" onClick={onClose}>
      <div 
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header & Images */}
        <div className="relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="relative h-64 sm:h-80 md:h-96 w-full bg-muted flex items-center justify-center">
            {hasImages ? (
              <>
                <img 
                  src={property.images[currentImageIndex]} 
                  alt={`${property.name} - Imagem ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {property.images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    
                    <div className="absolute bottom-4 left-1/2 -translate-y-1/2 flex gap-2">
                      {property.images.map((_, idx) => (
                        <div 
                          key={idx} 
                          className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                <span>Sem imagem disponível</span>
              </div>
            )}
            
            {/* Badges on image */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border shadow-sm ${getTypeColor(property.type)}`}>
                {property.type}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize shadow-sm ${getStatusColor(property.status)}`}>
                {property.status}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{property.name}</h2>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span>{property.zone}, {property.province}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-6 py-4 border-y border-border">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                <BedDouble className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quartos</p>
                <p className="font-semibold">{property.bedrooms}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                <Bath className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Casas de Banho</p>
                <p className="font-semibold">{property.bathrooms}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                <Maximize2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Área</p>
                <p className="font-semibold">{property.area} m²</p>
              </div>
            </div>
            
            <div className="flex items-center ml-auto">
              <div>
                <p className="text-sm text-muted-foreground text-right">Preço</p>
                <p className="text-xl font-bold text-primary">{formatPrice(property.price)}</p>
              </div>
            </div>
          </div>

          {/* Description & Amenities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Descrição</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{property.description}</p>
              </div>
              
              {property.promoter && (
                <div className="bg-muted p-4 rounded-xl">
                  <h3 className="text-sm font-semibold mb-1">Promotor Imobiliário</h3>
                  <p className="text-muted-foreground">{property.promoter}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Características</h3>
                {property.amenities && property.amenities.length > 0 ? (
                  <ul className="space-y-2">
                    {property.amenities.map((amenity, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{amenity}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">Não especificadas</p>
                )}
              </div>
              
              {property.financing && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Condições de Financiamento</h3>
                  <p className="text-muted-foreground text-sm">{property.financing}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 mt-4">
            <Link 
              to="/contactos"
              className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Solicitar Visita
            </Link>
            <Link 
              to="/contactos"
              className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-input text-base font-medium rounded-xl shadow-sm bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Contactar Equipa
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CondominiosPage() {
  const allProperties = usePublicProperties();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [provinceFilter, setProvinceFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const filteredProperties = useMemo(() => {
    return allProperties.filter(p => {
      // Search
      const searchMatch = !search || 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.zone.toLowerCase().includes(search.toLowerCase());
      
      // Type
      const typeMatch = typeFilter === 'Todos' || p.type === typeFilter;
      
      // Province
      const provinceMatch = provinceFilter === 'Todas' || p.province === provinceFilter;
      
      // Status
      const statusMatch = statusFilter === 'Todos' || p.status === statusFilter;
      
      return searchMatch && typeMatch && provinceMatch && statusMatch;
    });
  }, [allProperties, search, typeFilter, provinceFilter, statusFilter]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PageHero
        title="Condomínios & Residências"
        subtitle="Explore a nossa carteira exclusiva de imóveis de alta qualidade, desde luxuosos condomínios a modernos apartamentos."
        imageSrc="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000"
      />

      <Section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Filters Bar */}
          <div className="bg-card border border-border rounded-2xl p-4 md:p-6 mb-10 shadow-sm flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Pesquisar por nome ou zona..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full sm:w-auto appearance-none pl-10 pr-10 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="Todos">Todas as tipologias</option>
                  {Object.entries(PROPERTY_TYPES).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              
              <div className="relative">
                <select
                  value={provinceFilter}
                  onChange={(e) => setProvinceFilter(e.target.value)}
                  className="w-full sm:w-auto appearance-none pl-10 pr-10 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="Todas">Todas as províncias</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-auto appearance-none pl-10 pr-10 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="Todos">Todos os estados</option>
                  {Object.entries(PROPERTY_STATUSES).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">
              {filteredProperties.length} {filteredProperties.length === 1 ? "Imóvel encontrado" : "Imóveis encontrados"}
            </h2>
          </div>

          {/* Properties Grid */}
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property) => (
                <div 
                  key={property.id} 
                  className="group bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col cursor-pointer"
                  onClick={() => setSelectedProperty(property)}
                >
                  <div className="relative h-56 bg-muted overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <img 
                        src={property.images[0]} 
                        alt={property.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                    
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border backdrop-blur-sm bg-white/90 ${getTypeColor(property.type)}`}>
                        {PROPERTY_TYPES[property.type] || property.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {property.name}
                      </h3>
                    </div>
                    
                    <div className="flex items-center text-muted-foreground text-sm mb-4">
                      <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                      <span className="line-clamp-1">{property.zone}, {property.province}</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 py-4 border-y border-border mb-4 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <BedDouble className="w-4 h-4 text-muted-foreground mb-1" />
                        <span className="text-sm font-medium">{property.bedrooms > 0 ? `${property.bedrooms} Quartos` : "—"}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center border-x border-border">
                        <Bath className="w-4 h-4 text-muted-foreground mb-1" />
                        <span className="text-sm font-medium">{property.bathrooms > 0 ? `${property.bathrooms} WC` : "—"}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <Maximize2 className="w-4 h-4 text-muted-foreground mb-1" />
                        <span className="text-sm font-medium">{property.area > 0 ? `${property.area} m²` : "—"}</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Preço</span>
                        <span className="font-bold text-lg text-foreground">{formatPrice(property.price)}</span>
                      </div>
                      
                      <button 
                        className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        aria-label="Ver detalhes"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum imóvel encontrado</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Não encontrámos imóveis que correspondam aos seus critérios de pesquisa. Tente ajustar os filtros ou pesquisar com termos diferentes.
              </p>
              <button 
                onClick={() => {
                  setSearch('');
                  setTypeFilter('Todos');
                  setProvinceFilter('Todas');
                  setStatusFilter('Todos');
                }}
                className="mt-6 px-4 py-2 bg-primary/10 text-primary font-medium rounded-lg hover:bg-primary/20 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </div>
      </Section>

      {/* Property Detail Modal */}
      {selectedProperty && (
        <PropertyModal 
          property={selectedProperty} 
          onClose={() => setSelectedProperty(null)} 
        />
      )}
    </div>
  );
}