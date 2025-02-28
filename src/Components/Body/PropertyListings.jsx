import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import Slider from 'react-slick';
import PropertyCard from './PropertyCard';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const properties = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800',
    status: 'Newly Listed',
    price: 750000,
    beds: 4,
    baths: 3,
    sqft: 2500,
    address: '123 Main St, Anytown, USA',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=800',
    status: 'Coming Soon',
    price: 899000,
    beds: 5,
    baths: 4,
    sqft: 3200,
    address: '456 Oak Ave, Somewhere, USA',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800',
    status: 'Price Reduced',
    price: 625000,
    beds: 3,
    baths: 2,
    sqft: 1800,
    address: '789 Pine Rd, Elsewhere, USA',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800',
    status: 'Newly Listed',
    price: 950000,
    beds: 4,
    baths: 3.5,
    sqft: 2800,
    address: '321 Maple Dr, Nowhere, USA',
  },
];

const PropertyListings = () => {
  const sliderRef = useRef(null);
  const navigate = useNavigate();

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
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