import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const images = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1600607687644-aac76f0e23ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
];

export default function PropertyGallery() {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="property-gallery">
      <img
        src={images[currentImage]}
        alt={`Property image ${currentImage + 1}`}
        className="img-fluid"
      />
      
      <div className="position-absolute top-50 start-0 translate-middle-y d-flex justify-content-between w-100 px-4">
        <button onClick={prevImage} className="gallery-nav-button">
          <ChevronLeft size={24} />
        </button>
        <button onClick={nextImage} className="gallery-nav-button">
          <ChevronRight size={24} />
        </button>
      </div>
      
      <div className="position-absolute bottom-0 start-50 translate-middle-x mb-4 d-flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`gallery-dot ${currentImage === index ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}