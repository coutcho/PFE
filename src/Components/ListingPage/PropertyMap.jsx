import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet'; // Import Leaflet for custom icons
import 'leaflet/dist/leaflet.css';
import './ListingCSS.css'
import { MapPin } from 'lucide-react';

// Define custom icons
const propertyIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', // Default red marker
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const nearbyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', // Blue marker
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

export default function PropertyMap({ location, address }) {
  const [nearbyPlaces, setNearbyPlaces] = useState([]);

  useEffect(() => {
    if (!location || !location.lat || !location.lng) {
      return;
    }

    const fetchData = async () => {
      try {
        const types = ['restaurant', 'school', 'shop', 'beach'];
        const promises = types.map((type) =>
          fetchNearbyPlaces(location.lat, location.lng, type)
        );
        const results = await Promise.all(promises);
        const places = results.flat();
        setNearbyPlaces(places);
      } catch (error) {
        console.error('Error fetching nearby places:', error);
      }
    };

    fetchData();
  }, [location]);

  if (!location || !location.lat || !location.lng) {
    return (
      <div className="card mt-4">
        <div className="card-body">
          <h2 className="h4 fw-bold mb-4">Location</h2>
          <div className="bg-light rounded p-4 text-center">
            <MapPin className="text-primary mb-3" size={32} />
            {address ? (
              <>
                <h3 className="h5 mb-2">{address}</h3>
                <p className="mb-0 text-muted">Location data not available</p>
              </>
            ) : (
              <p className="mb-0 text-muted">Loading location...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card mt-4">
      <div className="card-body">
        <h2 className="h4 fw-bold mb-4">Location & Nearby Places</h2>
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={15}
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[location.lat, location.lng]} icon={propertyIcon}>
            <Popup>{address || 'Property Location'}</Popup>
          </Marker>
          {nearbyPlaces.map((place, index) => (
            <Marker key={index} position={[place.lat, place.lng]} icon={nearbyIcon}>
              <Popup>{place.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
        <div className="mt-3">
          <small className="text-muted">
            * Map shows approximate location and nearby amenities
          </small>
        </div>
      </div>
    </div>
  );
}

// Helper function to fetch nearby places using Overpass API
const fetchNearbyPlaces = async (lat, lng, type) => {
  const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node(around:1500,${lat},${lng})[amenity=${type}];out;`;
  const response = await fetch(overpassUrl);
  const data = await response.json();
  return data.elements.map((element) => ({
    lat: element.lat,
    lng: element.lon,
    name: element.tags.name || 'Unknown',
  }));
};