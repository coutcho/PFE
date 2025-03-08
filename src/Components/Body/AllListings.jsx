import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // Add this to read query params
import 'bootstrap/dist/css/bootstrap.min.css';
import Stacked from './Stacked';
import AllMap from './AllMap';
import SearchBar from '../Navbar/Searchbar';

function AllListings() {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation(); // Add this to access query params

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Get query parameters from URL
        const queryParams = new URLSearchParams(location.search);
        const typeFilter = queryParams.get('type');

        // Build the API URL with optional type filter
        const url = typeFilter 
          ? `http://localhost:3001/api/properties?type=${typeFilter}`
          : 'http://localhost:3001/api/properties';

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched properties:', data);
        setProperties(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [location.search]); // Re-run effect when query params change

  return (
    <div className="container-fluid">
      {/* Center the SearchBar */}
      <div className="d-flex justify-content-center mb-3 pt-3">
        <SearchBar />
      </div>
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-5 col-lg-4 p-0 border-end vh-100 d-flex flex-column">
          <div className="flex-grow-1" style={{ overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center p-3">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="text-danger p-3">Error: {error}</div>
            ) : properties.length === 0 ? (
              <div className="text-muted p-3">No properties found.</div>
            ) : (
              <Stacked
                properties={properties}
                onSelectProperty={setSelectedProperty}
                selectedProperty={selectedProperty}
              />
            )}
          </div>
        </div>

        {/* Map */}
        <div className="col-md-7 col-lg-8 p-3 vh-100">
          <div className="map-container rounded-3 shadow-sm" style={{ height: '100%' }}>
            <AllMap properties={properties} selectedProperty={selectedProperty} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllListings;