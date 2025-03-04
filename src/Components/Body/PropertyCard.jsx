import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaRegHeart, FaBed, FaBath, FaRuler } from 'react-icons/fa';

const PropertyCard = ({ property }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const imageSrc = property.images_path && property.images_path.length > 0 
    ? `http://localhost:3001/${property.images_path[0]}` 
    : 'https://via.placeholder.com/800';

  return (
    <motion.div
      className="card pointer h-100"
      style={{ cursor: 'pointer' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div className="position-relative">
        <img
          src={imageSrc}
          className="card-img-top"
          alt={property.title}
          style={{ height: '200px', objectFit: 'cover' }}
        />
        <span className="position-absolute top-0 start-0 m-2 badge bg-primary">
          {property.status}
        </span>
        <button
          className="position-absolute top-0 end-0 m-2 btn btn-light rounded-circle p-2"
          onClick={handleFavoriteClick}
        >
          {isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
        </button>
      </div>
      <div className="card-body">
        <h5 className="card-title fw-bold">
          {property.price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} DA
        </h5>
        <div className="d-flex gap-3 mb-2">
          <span>
            <FaBed className="me-1" /> {property.bedrooms} beds
          </span>
          <span>
            <FaBath className="me-1" /> {property.bathrooms} baths
          </span>
          <span>
            <FaRuler className="me-1" /> {property.square_footage.toLocaleString('en-US')} sqft
          </span>
        </div>
        <p className="card-text text-muted">{property.location}</p>
      </div>
    </motion.div>
  );
};

export default PropertyCard;