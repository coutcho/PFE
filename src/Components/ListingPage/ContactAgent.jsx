// src/Components/ListingPage/ContactAgent.jsx
import React, { useState } from 'react';
import { Phone, Mail } from 'lucide-react';
import PropertyInquiryModal from './PropertyInquiryModal'; // Adjust the import path as needed

export default function ContactAgent({ property }) { // Add property prop
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to open the modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="card mt-4 agent">
      <div className="card-body">
        <h2 className="h4 fw-bold">Contact Agent</h2>

        {/* Agent Details */}
        <div className="d-flex align-items-center gap-3 mt-3">
          <img
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
            alt="Agent"
            className="rounded-circle"
            style={{ width: '64px', height: '64px', objectFit: 'cover' }}
          />
          <div>
            <h3 className="h5 fw-semibold mb-1">Sarah Johnson</h3>
            <p className="text-muted mb-0">Luxury Real Estate Specialist</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-4">
          <div className="d-flex align-items-center gap-2 mb-2">
            <Phone className="text-primary" size={20} />
            <span>(310) 555-0123</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Mail className="text-primary" size={20} />
            <span>sarah.johnson@luxuryhomes.com</span>
          </div>
        </div>

        {/* Form to Trigger Modal */}
        <form className="mt-4">
          {/* Button to Open Modal */}
          <button type="button" className="btn btn-primary w-100" onClick={openModal}>
            Contacter
          </button>
        </form>

        {/* Embed the Modal Component with property prop */}
        <PropertyInquiryModal 
          show={isModalOpen} 
          onClose={closeModal} 
          property={property} // Pass property to modal
        />
      </div>
    </div>
  );
}