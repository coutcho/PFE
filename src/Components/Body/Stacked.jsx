import React from 'react';
import PropertyCard from './PropertyCard'; // Adjust the import path as necessary

const Stacked = ({ properties, onSelectProperty, selectedProperty }) => {
  return (
    <div className="property-list p-3">
      {properties.map((property) => (
        <div
          key={property.id}
          className={`mb-3 property-card ${selectedProperty?.id === property.id ? 'border-primary selected' : ''}`}
          onClick={() => onSelectProperty(property)}
          style={{ cursor: 'pointer' }}
        >
          <PropertyCard property={property} />
        </div>
      ))}
    </div>
  );
};

export default Stacked;