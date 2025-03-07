import React, { useState } from 'react';
import { Bed, Bath, Square, Heart, Share, Building, Sofa } from 'lucide-react';

export default function PropertyDetails({ property }) {
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveClick = () => {
    setIsSaved(!isSaved);
    // You could add API call here to save to backend if needed
  };

  const handleShareClick = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        alert('Link copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  // Capitalize the first letter of the title
  const capitalizeTitle = (title) => {
    if (!title) return ''; // Handle null or undefined
    return title.charAt(0).toUpperCase() + title.slice(1);
  };

  return (
    <div className="card mt-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h1 className="h2 fw-bold">{capitalizeTitle(property.title)}</h1>
            <p className="text-muted fs-5">{property.location}</p>
            <p className="fs-3 fw-bold text-primary mt-3">
              {property.price.toLocaleString('en-US')} DA
            </p>
          </div>
          <div className="d-flex gap-2">
            <button 
              className={`btn d-flex align-items-center gap-2 ${
                isSaved ? 'btn-danger' : 'btn-outline-secondary'
              }`}
              onClick={handleSaveClick}
            >
              <Heart 
                size={20} 
                fill={isSaved ? 'white' : 'none'} 
                className={isSaved ? 'text-white' : ''}
              />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
            <button 
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              onClick={handleShareClick}
            >
              <Share size={20} />
              <span>Share</span>
            </button>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-6 col-md-3">
            <div className="d-flex align-items-center">
              <Bed className="text-primary me-2" size={24} />
              <div>
                <small className="text-muted">Bedrooms</small>
                <p className="mb-0 fw-semibold">{property.bedrooms}</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            {property.bathrooms !== undefined && property.bathrooms !== null ? (
              <div className="d-flex align-items-center">
                <Bath className="text-primary me-2" size={24} />
                <div>
                  <small className="text-muted">Bathrooms</small>
                  <p className="mb-0 fw-semibold">{property.bathrooms}</p>
                </div>
              </div>
            ) : (
              <div className="d-flex align-items-center">
                <Building className="text-primary me-2" size={24} />
                <div>
                  <small className="text-muted">Etage</small>
                  <p className="mb-0 fw-semibold">
                    {property.etage !== undefined && property.etage !== null 
                      ? `${property.etage}${property.etage === 1 ? "er" : "ème"}` 
                      : "N/A"}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="col-6 col-md-3">
            <div className="d-flex align-items-center">
              <Square className="text-primary me-2" size={24} />
              <div>
                <small className="text-muted">Superfice (m²)</small>
                <p className="mb-0 fw-semibold">{property.square_footage.toLocaleString('fr-DZ')}</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="d-flex align-items-center">
              <Sofa className="text-primary me-2" size={24} />
              <div>
                <small className="text-muted">Équipée</small>
                <p className="mb-0 fw-semibold">{property.equipped ? 'Oui' : 'Non'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="h4 fw-bold">Description</h2>
          <p className="text-muted">{property.description}</p>
        </div>

        <div className="mt-4">
          <h2 className="h4 fw-bold">Features & Amenities</h2>
          <div className="row mt-3">
            {property.features && property.features.length > 0 ? (
              property.features.map((feature, index) => (
                <div key={index} className="col-12 col-md-4 mb-2">
                  <div className="d-flex align-items-center">
                    <div className="feature-dot"></div>
                    <span>{feature}</span>
                  </div>
                </div>
              ))
            ) : (
              <p>No features available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}