import React, { useEffect, useRef, useState } from "react";

const GOOGLE_MAPS_API_KEY = "AIzaSyBWlQJ4eS39OcFmpuP_M142ayLdpv84SZw";

function loadGoogleMapsScript(callback) {
  if (window.google && window.google.maps) {
    callback();
    return;
  }
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
  script.async = true;
  script.onload = callback;
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
    loadGoogleMapsScript(() => {
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
    <div className="flex flex-col w-full p-4 bg-gray-850 rounded-lg shadow space-y-4">
      <h2 className="text-2xl font-bold text-white">Nearby Clinic</h2>
      <div ref={mapRef} className="w-full h-64 rounded-lg border shadow" />
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex flex-col md:flex-row items-center gap-2">
          <label className="text-white font-medium">Search Radius: {radius} km</label>
          <input
            type="range"
            min={1} max={50}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full md:w-48"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={!location || loading}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
      {error && <div className="text-red-400">{error}</div>}
      {hospitals.length > 0 && (
        <div className="bg-gray-800 p-4 rounded-lg shadow space-y-2">
          {hospitals.map((h) => (
            <div key={h.place_id} className="flex justify-between text-white">
              <div>
                <strong>{h.name}</strong>
                <div className="text-gray-400 text-sm">{h.vicinity}</div>
              </div>
              <div className="text-gray-300 text-sm">
                {location
                  ? `${getDistance(location.lat, location.lng, h.geometry.location.lat(), h.geometry.location.lng()).toFixed(2)} km`
                  : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NearbyClinic;
