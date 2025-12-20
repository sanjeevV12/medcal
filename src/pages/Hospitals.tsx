import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  MapPin, 
  Phone, 
  Star, 
  Navigation, 
  Search, 
  Building2,
  Ambulance,
  Filter
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  specializations: string[] | null;
  rating: number | null;
  total_reviews: number | null;
  latitude: number | null;
  longitude: number | null;
  emergency_available: boolean | null;
}

const Hospitals = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("all");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [allSpecializations, setAllSpecializations] = useState<string[]>([]);

  // Default Bhopal coordinates
  const BHOPAL_CENTER = { lat: 23.2599, lng: 77.4126 };

  useEffect(() => {
    fetchHospitals();
    getUserLocation();
  }, []);

  useEffect(() => {
    filterHospitals();
  }, [hospitals, searchQuery, selectedSpecialization]);

  const fetchHospitals = async () => {
    try {
      const { data, error } = await supabase
        .from("hospitals")
        .select("*")
        .eq("is_partner", true)
        .order("rating", { ascending: false });

      if (error) throw error;

      setHospitals(data || []);
      
      // Extract unique specializations
      const specs = new Set<string>();
      data?.forEach(hospital => {
        hospital.specializations?.forEach(spec => specs.add(spec));
      });
      setAllSpecializations(Array.from(specs).sort());
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // If permission denied, use Bhopal center
          setUserLocation(BHOPAL_CENTER);
        }
      );
    } else {
      setUserLocation(BHOPAL_CENTER);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getDistanceFromUser = (hospital: Hospital): number | null => {
    if (!userLocation || !hospital.latitude || !hospital.longitude) return null;
    return calculateDistance(
      userLocation.lat,
      userLocation.lng,
      Number(hospital.latitude),
      Number(hospital.longitude)
    );
  };

  const filterHospitals = () => {
    let filtered = [...hospitals];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        hospital =>
          hospital.name.toLowerCase().includes(query) ||
          hospital.address.toLowerCase().includes(query) ||
          hospital.specializations?.some(spec => 
            spec.toLowerCase().includes(query)
          )
      );
    }

    if (selectedSpecialization && selectedSpecialization !== "all") {
      filtered = filtered.filter(hospital =>
        hospital.specializations?.includes(selectedSpecialization)
      );
    }

    // Sort by distance if user location is available
    if (userLocation) {
      filtered.sort((a, b) => {
        const distA = getDistanceFromUser(a) || Infinity;
        const distB = getDistanceFromUser(b) || Infinity;
        return distA - distB;
      });
    }

    setFilteredHospitals(filtered);
  };

  const openInMaps = (hospital: Hospital) => {
    if (hospital.latitude && hospital.longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`,
        "_blank"
      );
    } else {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name + " " + hospital.address)}`,
        "_blank"
      );
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />
        );
      } else {
        stars.push(
          <Star key={i} className="h-4 w-4 text-muted-foreground/30" />
        );
      }
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-6">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Partner Hospitals</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Hospital Directory
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find the best partner hospitals in Bhopal with instant ambulance service. 
            View specializations, ratings, and get directions.
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-6 px-4 border-b bg-card/50 backdrop-blur-sm sticky top-16 z-40">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search hospitals, specializations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Specializations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  {allSpecializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Showing {filteredHospitals.length} of {hospitals.length} hospitals
            {userLocation && " • Sorted by distance from your location"}
          </p>
        </div>
      </section>

      {/* Hospital Cards */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredHospitals.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No hospitals found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHospitals.map((hospital) => {
                const distance = getDistanceFromUser(hospital);
                return (
                  <Card key={hospital.id} className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                          {hospital.name}
                        </CardTitle>
                        {hospital.emergency_available && (
                          <Badge variant="destructive" className="shrink-0 flex items-center gap-1">
                            <Ambulance className="h-3 w-3" />
                            24/7
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5">
                          {renderStars(hospital.rating)}
                        </div>
                        <span className="text-sm font-medium">
                          {hospital.rating?.toFixed(1)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({hospital.total_reviews?.toLocaleString()} reviews)
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{hospital.address}</span>
                      </div>
                      
                      {hospital.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={`tel:${hospital.phone}`}
                            className="text-primary hover:underline"
                          >
                            {hospital.phone}
                          </a>
                        </div>
                      )}

                      {distance !== null && (
                        <div className="flex items-center gap-2 text-sm">
                          <Navigation className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-primary">
                            {distance < 1 
                              ? `${Math.round(distance * 1000)}m away`
                              : `${distance.toFixed(1)} km away`
                            }
                          </span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1.5">
                        {hospital.specializations?.slice(0, 4).map((spec) => (
                          <Badge key={spec} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {hospital.specializations && hospital.specializations.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{hospital.specializations.length - 4} more
                          </Badge>
                        )}
                      </div>

                      <Button 
                        onClick={() => openInMaps(hospital)}
                        className="w-full mt-2"
                        variant="outline"
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Get Directions
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Hospitals;
