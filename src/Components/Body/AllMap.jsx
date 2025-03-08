import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Define icons
const defaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to update map view
function MapUpdater({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
}

const AllMap = ({ properties, selectedProperty }) => {
  // Default center (NYC)
  const defaultCenter = [40.7128, -74.0060];

  // Filter properties with valid lat/long
  const validProperties = properties.filter(
    (property) => property.lat != null && property.long != null
  );

  // Determine center: selected property if valid, first valid property, or default
  const center = selectedProperty && selectedProperty.lat != null && selectedProperty.long != null
    ? [selectedProperty.lat, selectedProperty.long]
    : validProperties.length > 0
    ? [validProperties[0].lat, validProperties[0].long]
    : defaultCenter;

  const zoom = selectedProperty && selectedProperty.lat != null && selectedProperty.long != null ? 15 : 13;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
    >
      <MapUpdater center={center} zoom={zoom} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {validProperties.map((property) => (
        <Marker
          key={property.id}
          position={[property.lat, property.long]}
          icon={selectedProperty?.id === property.id ? selectedIcon : defaultIcon}
        >
          <Popup>
            <div>
              <img
                src={
                  property.images_path && property.images_path.length > 0
                    ? `http://localhost:3001${property.images_path[0]}`
                    : 'https://via.placeholder.com/200x150'
                }
                alt={property.title || 'Property Image'}
                style={{ width: '200px', height: '150px', objectFit: 'cover' }}
              />
              <h6 className="mt-2">{property.price.toLocaleString()} DA</h6>
              <p className="mb-0">{property.location}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default AllMap;