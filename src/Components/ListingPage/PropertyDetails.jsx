import React from 'react';
import { Bed, Bath, Square, Calendar, Heart, Share } from 'lucide-react';

export default function PropertyDetails() {
  return (
    <div className="card mt-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h1 className="h2 fw-bold">Modern Luxury Villa</h1>
            <p className="text-muted fs-5">123 Ocean View Drive, Malibu, CA 90265</p>
            <p className="fs-3 fw-bold text-primary mt-3">$4,500,000</p>
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
                <p className="mb-0 fw-semibold">5</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="d-flex align-items-center">
              <Bath className="text-primary me-2" size={24} />
              <div>
                <small className="text-muted">Bathrooms</small>
                <p className="mb-0 fw-semibold">4.5</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="d-flex align-items-center">
              <Square className="text-primary me-2" size={24} />
              <div>
                <small className="text-muted">Square Feet</small>
                <p className="mb-0 fw-semibold">6,500</p>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="d-flex align-items-center">
              <Calendar className="text-primary me-2" size={24} />
              <div>
                <small className="text-muted">Year Built</small>
                <p className="mb-0 fw-semibold">2022</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="h4 fw-bold">Description</h2>
          <p className="text-muted">
            This stunning modern villa offers breathtaking ocean views and luxurious living spaces. 
            The property features an open-concept design with floor-to-ceiling windows, a gourmet kitchen 
            with top-of-the-line appliances, and a spacious primary suite with a private balcony. 
            The outdoor space includes an infinity pool, outdoor kitchen, and beautifully landscaped gardens.
          </p>
        </div>

        <div className="mt-4">
          <h2 className="h4 fw-bold">Features & Amenities</h2>
          <div className="row mt-3">
            {[
              'Infinity Pool',
              'Smart Home System',
              'Wine Cellar',
              'Home Theater',
              'Gym',
              'Ocean Views',
              '3-Car Garage',
              'Security System',
              'Solar Panels'
            ].map((feature, index) => (
              <div key={index} className="col-12 col-md-4 mb-2">
                <div className="d-flex align-items-center">
                  <div className="feature-dot"></div>
                  <span>{feature}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}