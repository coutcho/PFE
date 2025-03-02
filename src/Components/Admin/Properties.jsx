import { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

function Properties() {
  const [properties, setProperties] = useState([]);
  const [editingProperty, setEditingProperty] = useState(null);
  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:3001/api/properties';
  const token = localStorage.getItem('authToken'); // Matches SignInModal's key

  // Fetch properties on mount
  useEffect(() => {
    const fetchProperties = async () => {
      if (!token) {
        setError('Please sign in to view properties');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(API_BASE_URL, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('Authentication failed. Please sign in again.');
          }
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

  const handleEdit = (property) => {
    setEditingProperty(property);
    setFeatures(property.features || []);
    setFeatureInput('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFeatureKeyDown = (e) => {
    if (e.key === 'Enter' && featureInput.trim()) {
      e.preventDefault();
      if (!features.includes(featureInput.trim())) {
        setFeatures([...features, featureInput.trim()]);
      }
      setFeatureInput('');
    }
  };

  const removeFeature = (featureToRemove) => {
    setFeatures(features.filter(feature => feature !== featureToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Please sign in to add or edit properties');
      return;
    }

    const formData = new FormData(e.target);
    const propertyData = {
      title: formData.get('title'),
      price: parseFloat(formData.get('price')),
      location: formData.get('location'),
      type: formData.get('type'),
      bedrooms: parseInt(formData.get('bedrooms')),
      bathrooms: parseFloat(formData.get('bathrooms')),
      square_footage: parseInt(formData.get('squareFootage')),
      description: formData.get('description'),
      features,
      status: editingProperty ? formData.get('status') : 'Active',
    };

    try {
      let response;
      if (editingProperty) {
        response = await fetch(`${API_BASE_URL}/${editingProperty.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(propertyData),
        });
      } else {
        response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(propertyData),
        });
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication failed. Please sign in again.');
        }
        throw new Error(editingProperty ? 'Failed to update property' : 'Failed to add property');
      }
      const savedProperty = await response.json();

      if (editingProperty) {
        setProperties(properties.map(p => (p.id === editingProperty.id ? savedProperty : p)));
        setEditingProperty(null);
      } else {
        setProperties([...properties, savedProperty]);
      }
      setFeatures([]);
      setFeatureInput('');
      e.target.reset();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!token) {
      setError('Please sign in to delete properties');
      return;
    }

    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('Authentication failed. Please sign in again.');
          }
          throw new Error('Failed to delete property');
        }
        setProperties(properties.filter(p => p.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (!token) return <div>Please sign in to manage properties.</div>;
  if (loading) return <div>Loading properties...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container-fluid mt-4">
      <h1 className="mb-4">Properties</h1>
      
      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">
                {editingProperty ? 'Edit Property' : 'Add New Property'}
              </h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    defaultValue={editingProperty?.title}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="price" className="form-label">Price</label>
                  <input
                    type="number"
                    className="form-control"
                    id="price"
                    name="price"
                    defaultValue={editingProperty?.price}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="location" className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-control"
                    id="location"
                    name="location"
                    defaultValue={editingProperty?.location}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="type" className="form-label">Property Type</label>
                  <select
                    className="form-select"
                    id="type"
                    name="type"
                    defaultValue={editingProperty?.type || ''}
                    required
                  >
                    <option value="">Select type...</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                  </select>
                </div>
                <div className="row mb-3">
                  <div className="col">
                    <label htmlFor="bedrooms" className="form-label">Bedrooms</label>
                    <input
                      type="number"
                      className="form-control"
                      id="bedrooms"
                      name="bedrooms"
                      defaultValue={editingProperty?.bedrooms}
                      required
                    />
                  </div>
                  <div className="col">
                    <label htmlFor="bathrooms" className="form-label">Bathrooms</label>
                    <input
                      type="number"
                      className="form-control"
                      id="bathrooms"
                      name="bathrooms"
                      defaultValue={editingProperty?.bathrooms}
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="squareFootage" className="form-label">Square Footage</label>
                  <input
                    type="number"
                    className="form-control"
                    id="squareFootage"
                    name="squareFootage"
                    defaultValue={editingProperty?.square_footage}
                    required
                  />
                </div>
                {editingProperty && (
                  <div className="mb-3">
                    <label htmlFor="status" className="form-label">Status</label>
                    <select
                      className="form-select"
                      id="status"
                      name="status"
                      defaultValue={editingProperty?.status || 'Active'}
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Sold">Sold</option>
                      <option value="For Rent">For Rent</option>
                    </select>
                  </div>
                )}
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="3"
                    defaultValue={editingProperty?.description}
                    required
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="features" className="form-label">Features (press Enter to add)</label>
                  <input
                    type="text"
                    className="form-control"
                    id="features"
                    name="features"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={handleFeatureKeyDown}
                    placeholder="Type a feature and press Enter"
                  />
                  <div className="mt-2 d-flex flex-wrap gap-2">
                    {features.map((feature, index) => (
                      <span
                        key={index}
                        className="badge bg-primary d-flex align-items-center gap-1"
                        style={{ padding: '0.5rem' }}
                      >
                        {feature}
                        <button
                          type="button"
                          className="btn-close btn-close-white ms-1"
                          aria-label="Remove"
                          onClick={() => removeFeature(feature)}
                        />
                      </span>
                    ))}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    {editingProperty ? 'Update Property' : 'Add Property'}
                  </button>
                  {editingProperty && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditingProperty(null);
                        setFeatures([]);
                        setFeatureInput('');
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Property Listings</h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Price</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Type</th> {/* Replaced Features with Type */}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map(property => (
                      <tr key={property.id}>
                        <td style={{ textDecoration: property.status === 'Sold' ? 'line-through' : 'none' }}>
                          {property.title}
                        </td>
                        <td style={{ textDecoration: property.status === 'Sold' ? 'line-through' : 'none' }}>
                          ${property.price.toLocaleString()}
                        </td>
                        <td style={{ textDecoration: property.status === 'Sold' ? 'line-through' : 'none' }}>
                          {property.location}
                        </td>
                        <td style={{ textDecoration: property.status === 'Sold' ? 'line-through' : 'none' }}>
                          <span
                            className={`badge ${
                              property.status === 'Active' ? 'bg-success' :
                              property.status === 'Pending' ? 'bg-warning' :
                              property.status === 'Sold' ? 'bg-secondary' :
                              property.status === 'For Rent' ? 'bg-info' :
                              'bg-light'
                            }`}
                          >
                            {property.status}
                          </span>
                        </td>
                        <td style={{ textDecoration: property.status === 'Sold' ? 'line-through' : 'none' }}>
                          {property.type}
                        </td> {/* Display type instead of features */}
                        <td>
                          <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => handleEdit(property)}
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(property.id)}
                          >
                            <FaTrash /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Properties;