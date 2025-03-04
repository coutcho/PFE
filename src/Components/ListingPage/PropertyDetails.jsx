import React, { useState, useEffect } from 'react';
import { Bed, Bath, Square, Calendar, Heart, Share } from 'lucide-react';
import { useParams } from 'react-router-dom';

export default function PropertyDetails() {
  const { id } = useParams(); // Get property ID from URL (/listing/:id)
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/properties/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch property details');
        }
        const data = await response.json();
        setProperty(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!property) return <div>Property not found</div>;

  return (
    <div className="card mt-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h1 className="h2 fw-bold">{property.title}</h1>
            <p className="text-muted fs-5">{property.location}</p>
            <p className="fs-3 fw-bold text-primary mt-3">
              {property.price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} DA
            </p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
              <Heart size={20} />
              <span>Save</span>
            </button>
            <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
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
            <div className="d-flex align-items-center">
              <Bath className="text-primary me-2" size={24} />
              <div>
                <small className="text-muted">Bathrooms</small>
                <p className="mb-0 fw-semibold">{property.bathrooms}</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="d-flex align-items-center">
              <Square className="text-primary me-2" size={24} />
              <div>
                <small className="text-muted">Square Feet</small>
                <p className="mb-0 fw-semibold">{property.square_footage.toLocaleString('en-US')}</p>
              </div>
            </div>
          </div>
          {/* Year Built not in database; omitting */}
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