import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Stacked from './components/Stacked';
import PropertiesMap from './components/PropertiesMap';

// Sample data - in a real app, this would come from an API
const sampleProperties = [
  {
    id: 1,
    price: 750000,
    beds: 3,
    baths: 2,
    address: '123 Main St, New York, NY',
    image: 'https://picsum.photos/400/300?random=1',
    lat: 40.7128,
    lng: -74.0060
  },
  {
    id: 2,
    price: 1200000,
    beds: 4,
    baths: 3,
    address: '456 Park Ave, New York, NY',
    image: 'https://picsum.photos/400/300?random=2',
    lat: 40.7218,
    lng: -73.9960
  },
  {
    id: 3,
    price: 950000,
    beds: 3,
    baths: 2.5,
    address: '789 Broadway, New York, NY',
    image: 'https://picsum.photos/400/300?random=3',
    lat: 40.7308,
    lng: -74.0160
  }
];

function AllListings() {
  const [properties] = useState(sampleProperties);
  const [selectedProperty, setSelectedProperty] = useState(null);

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-5 col-lg-4 p-0 border-end vh-100 d-flex flex-column">
          <div className="flex-grow-1" style={{ overflowY: 'auto' }}>
            <Stacked
              properties={properties}
              onSelectProperty={setSelectedProperty}
              selectedProperty={selectedProperty}
            />
          </div>
        </div>
        
        {/* Map */}
        <div className="col-md-7 col-lg-8 p-3 vh-100">
          <div className="map-container rounded-3 shadow-sm">
            <PropertiesMap properties={properties} selectedProperty={selectedProperty} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllListings;