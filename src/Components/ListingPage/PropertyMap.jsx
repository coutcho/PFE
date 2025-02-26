import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin } from 'lucide-react';

const PROPERTY_LOCATION = { lat: 34.0259, lng: -118.7798 }; // Malibu coordinates

export default function PropertyMap() {
  const mapRef = useRef(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setMapError(true);
      return;
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places']
    });

    loader.load().then(() => {
      try {
        const map = new google.maps.Map(mapRef.current, {
          center: PROPERTY_LOCATION,
          zoom: 15,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        new google.maps.Marker({
          position: PROPERTY_LOCATION,
          map: map,
          title: 'Modern Luxury Villa'
        });

        // Add nearby places
        const service = new google.maps.places.PlacesService(map);
        const nearbyPlaces = ['restaurant', 'school', 'shopping_mall', 'beach'];
        
        nearbyPlaces.forEach(type => {
          service.nearbySearch({
            location: PROPERTY_LOCATION,
            radius: 1500,
            type: type
          }, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              results.slice(0, 3).forEach(place => {
                new google.maps.Marker({
                  position: place.geometry.location,
                  map: map,
                  title: place.name,
                  icon: {
                    url: place.icon,
                    scaledSize: new google.maps.Size(24, 24)
                  }
                });
              });
            }
          });
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError(true);
      }
    }).catch(error => {
      console.error('Error loading Google Maps:', error);
      setMapError(true);
    });
  }, []);

  if (mapError) {
    return (
      <div className="card mt-4">
        <div className="card-body">
          <h2 className="h4 fw-bold mb-4">Location</h2>
          <div className="bg-light rounded p-4 text-center">
            <MapPin className="text-primary mb-3" size={32} />
            <h3 className="h5 mb-2">123 Ocean View Drive</h3>
            <p className="mb-0 text-muted">Malibu, CA 90265</p>
            <p className="small text-muted mt-3">
              * Interactive map requires Google Maps API key configuration
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card mt-4">
      <div className="card-body">
        <h2 className="h4 fw-bold mb-4">Location & Nearby Places</h2>
        <div 
          ref={mapRef} 
          className="rounded"
          style={{ height: '400px', width: '100%' }}
        ></div>
        <div className="mt-3">
          <small className="text-muted">
            * Map shows approximate location and nearby amenities
          </small>
        </div>
      </div>
    </div>
  );
}