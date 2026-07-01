import React, { useEffect, useRef, useState } from "react";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

function loadGoogleMapsScript(callback) {
  if (window.google && window.google.maps) {
    callback();
    return;
  }
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn("Google Maps API key is missing. Map feature is disabled.");
    callback(new Error("Missing Google Maps API key"));
    return;
  }
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
  script.async = true;
  script.onload = () => callback();
  script.onerror = () => callback(new Error("Failed to load Google Maps script"));
  document.body.appendChild(script);
}

const NearbyClinic = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [location, setLocation] = useState(null);
  const [radius, setRadius] = useState(5);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setError("Location denied."),
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    if (!location) return;
    loadGoogleMapsScript((err) => {
      if (err) {
        setError("Google Maps cannot be loaded. Please ensure API key is configured.");
        return;
      }
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: location,
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      setMap(mapInstance);
      new window.google.maps.Marker({
        position: location,
        map: mapInstance,
        icon: { url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" },
        title: "Your Location",
      });
    });
  }, [location]);

  const handleSearch = () => {
    if (!map || !location) return;
    setLoading(true);
    setError("");
    setHospitals([]);
    markers.forEach((m) => m.setMap(null));
    setMarkers([]);

    const service = new window.google.maps.places.PlacesService(map);
    service.nearbySearch(
      { location, radius: radius * 1000, type: "hospital" },
      (results, status) => {
        setLoading(false);
        if (status !== window.google.maps.places.PlacesServiceStatus.OK || !results.length) {
          setError("No hospitals found.");
          return;
        }
        setHospitals(results);
        const newMarkers = results.map((place) => {
          const marker = new window.google.maps.Marker({
            position: place.geometry.location,
            map,
            title: place.name,
            icon: { url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" },
          });
          const infoWindow = new window.google.maps.InfoWindow({
            content: `<strong>${place.name}</strong><br>${place.vicinity}`,
          });
          marker.addListener("click", () => infoWindow.open(map, marker));
          return marker;
        });
        setMarkers(newMarkers);
        map.setCenter(location);
      }
    );
  };

  function getDistance(lat1, lng1, lat2, lng2) {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
    const c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R*c;
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden selection:bg-purple-500/20 w-full">
        {/* Animated Background System - Light Theme */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-300/40 rounded-full blur-[120px] animate-blob mix-blend-multiply" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-pink-300/30 rounded-full blur-[140px] animate-blob mix-blend-multiply" style={{ animationDelay: '2s' }} />
            <div className="absolute top-[30%] left-[50%] w-[40%] h-[40%] bg-cyan-200/40 rounded-full blur-[100px] animate-blob mix-blend-multiply" style={{ animationDelay: '4s' }} />
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[60px]" />
        </div>

      <div className="flex-1 flex flex-col space-y-6 w-full max-w-4xl mx-auto z-10 relative px-4 md:px-8 py-12 pb-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Nearby <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Clinics</span></h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">Locate nearby medical centers and clinics instantly.</p>
          </div>
        </div>

        {/* Map panel */}
        <div className="rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white/60 bg-white/80 backdrop-blur-xl group">
          <div ref={mapRef} className="w-full h-96 bg-slate-100" />
        </div>

        {/* Control bar */}
        <div className="rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-white/70 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl hover:shadow-[0_20px_40px_rgba(139,92,246,0.1)] hover:border-purple-200 transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
            <span className="text-base font-bold text-slate-900">Search Radius: <span className="text-purple-600">{radius} km</span></span>
            <input
              type="range"
              min={1} max={50}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full sm:w-48 h-2 rounded-lg appearance-none cursor-pointer accent-purple-600 bg-purple-100"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={!location || loading}
            className="w-full md:w-auto text-base font-bold py-3.5 px-8 rounded-xl text-white transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 bg-gradient-to-r from-purple-600 to-pink-500 shadow-md shrink-0"
          >
            {loading ? "Searching..." : "Locate Clinics"}
          </button>
        </div>

        {error && <div className="text-base font-bold text-red-500 text-center bg-red-50 p-4 rounded-xl border border-red-100">{error}</div>}

        {/* Results List */}
        {hospitals.length > 0 && (
          <div className="rounded-[2rem] p-6 md:p-8 space-y-4 bg-white/70 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Found Locations</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {hospitals.map((h) => (
                <div key={h.place_id} className="flex justify-between items-start p-5 rounded-2xl transition-all hover:bg-slate-50 border border-transparent hover:border-purple-100 group">
                  <div>
                    <strong className="text-lg font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors">{h.name}</strong>
                    <div className="text-sm mt-1 text-slate-500 font-medium">{h.vicinity}</div>
                  </div>
                  <div className="text-sm font-mono font-bold px-4 py-1.5 rounded-full flex-shrink-0 bg-purple-50 text-purple-700 border border-purple-100">
                    {location
                      ? `${getDistance(location.lat, location.lng, h.geometry.location.lat(), h.geometry.location.lng()).toFixed(2)} km`
                      : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyClinic;
