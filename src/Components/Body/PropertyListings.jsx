import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import PropertyCard from './PropertyCard';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../../App.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const PropertyListings = () => {
  const sliderRef = useRef(null);
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('authToken');

  // Fetch properties from the backend
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/properties', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }
        const data = await response.json();
        setProperties(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [token]);

  // Custom arrow components
  const PrevArrow = ({ onClick }) => (
    <button
      onClick={onClick}
      className="slick-prev custom-arrow"
      style={{ left: "-40px" }}
    >
      <FaChevronLeft />
    </button>
  );

  const NextArrow = ({ onClick }) => (
    <button
      onClick={onClick}
      className="slick-next custom-arrow"
      style={{ right: "-40px" }}
    >
      <FaChevronRight />
    </button>
  );

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  const handleListingClick = (id) => {
    navigate(`/listing/${id}`);
  };

  if (loading) return <div className="container py-5">Loading...</div>;
  if (error) return <div className="container py-5">Error: {error}</div>;

  return (
    <div className="container py-5">
      <h2 className="mb-4">Featured Listings</h2>
      <div className="position-relative">
        <Slider ref={sliderRef} {...settings}>
          {properties.map((property) => (
            <div
              key={property.id}
              className="px-2"
              onClick={() => handleListingClick(property.id)}
              style={{ cursor: 'pointer' }}
            >
              <PropertyCard property={property} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default PropertyListings;
