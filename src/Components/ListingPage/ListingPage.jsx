// src/Components/ListingPage/ListingPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PropertyGallery from './PropertyGallery';
import PropertyDetails from './PropertyDetails';
import PropertyMap from './PropertyMap';
import ContactAgent from './ContactAgent';
import Footer from '../Footer/Footer.jsx';
import './ListingCSS.css';

function ListingPage() {
  const { id } = useParams();
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

  if (loading) return <div className="min-vh-100 bg-light">Loading...</div>;
  if (error) return <div className="min-vh-100 bg-light">Error: {error}</div>;
  if (!property) return <div className="min-vh-100 bg-light">Property not found</div>;

  return (
    <>
      <div className="min-vh-100 bg-light">
        <main className="pt-0">
          <PropertyGallery /> {/* Add property prop if needed */}
          
          <div className="container py-4">
            <div className="row">
              <div className="col-lg-8">
                <PropertyDetails property={property} />
                <PropertyMap /> {/* Add property prop if needed */}
              </div>
              <div className="col-lg-4">
                <ContactAgent property={property} />
              </div>
            </div>
          </div>
        </main>
      </div>
      <div>
        <Footer />
      </div>
    </>
  );
}

export default ListingPage;