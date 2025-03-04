import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Added for routing
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PropertyGallery() {
  const { id } = useParams(); // Get the id from the URL (e.g., /listing/10)
  const [images, setImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = 'http://localhost:3001'; // Backend URL

  // Log when the component renders
  console.log('PropertyGallery rendered with id:', id);

  useEffect(() => {
    console.log('useEffect triggered with id:', id);
    const fetchPropertyImages = async () => {
      try {
        setLoading(true);
        console.log('Fetching property ID:', id);
        const response = await fetch(`${BASE_URL}/api/properties/${id}`);
        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text(); // Get detailed error
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const property = await response.json();
        console.log('Property data:', property);

        const imagePaths = Array.isArray(property.images_path) 
          ? property.images_path 
          : JSON.parse(property.images_path || '[]');
        console.log('Image paths:', imagePaths);

        const fullImageUrls = imagePaths.map(path => `${BASE_URL}${path}`);
        console.log('Full URLs:', fullImageUrls);
        setImages(fullImageUrls);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPropertyImages();
    } else {
      console.log('No id provided');
      setLoading(false);
      setError('No property ID provided');
    }
  }, [id]); // Depend on id from useParams

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  if (loading) {
    console.log('In loading state');
    return <div>Loading images...</div>;
  }
  if (error) {
    console.log('In error state:', error);
    return <div>Error: {error}</div>;
  }
  if (images.length === 0) {
    console.log('No images available');
    return <div>No images available for this property</div>;
  }

  console.log('Rendering image:', images[currentImage]);

  // Add a fallback to avoid invalid src issues
  const imageSrc = images[currentImage] || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='; // 1x1 transparent pixel

  return (
    <div className="property-gallery">
      <img src={imageSrc} alt={`Property image ${currentImage + 1}`} className="img-fluid" />
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