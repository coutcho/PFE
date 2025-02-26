import React from 'react';
import PropertyGallery from './PropertyGallery';
import PropertyDetails from './PropertyDetails';
import PropertyMap from './PropertyMap';
import ContactAgent from './ContactAgent';
import Footer from '../Footer/Footer.jsx';
import './ListingCSS.css'

function ListingPage() {
  return (
    <>
    <div className="min-vh-100 bg-light">
      
      
      <main className="pt-0">
        <PropertyGallery />
        
        <div className="container py-4">
          <div className="row">
            <div className="col-lg-8">
              <PropertyDetails />
              <PropertyMap />
            </div>
            <div className="col-lg-4">
              <ContactAgent />
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