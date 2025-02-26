
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaRegHeart, FaBed, FaBath, FaRuler } from 'react-icons/fa';


const PropertyCard = ({ property }) => {
  const [isFavorite, setIsFavorite] = useState(false);

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
        <img src={property.image} className="card-img-top" alt={property.address} style={{ height: '200px', objectFit: 'cover' }} />
        <span className="position-absolute top-0 start-0 m-2 badge bg-primary">
          {property.status}
        </span>
        <button
          className="position-absolute top-0 end-0 m-2 btn btn-light rounded-circle p-2"
          onClick={() => setIsFavorite(!isFavorite)}
        >
          {isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
        </button>
      </div>
      <div className="card-body">
        <h5 className="card-title fw-bold">${property.price.toLocaleString()}</h5>
        <div className="d-flex gap-3 mb-2">
          <span><FaBed className="me-1" /> {property.beds} beds</span>
          <span><FaBath className="me-1" /> {property.baths} baths</span>
          <span><FaRuler className="me-1" /> {property.sqft.toLocaleString()} sqft</span>
        </div>
        <p className="card-text text-muted">{property.address}</p>
      </div>
    </motion.div>
  );
};

export default PropertyCard;