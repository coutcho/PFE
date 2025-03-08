import { useState, useEffect, useRef } from 'react';
import { FaEdit, FaTrash, FaPlus, FaImage } from 'react-icons/fa';

function Properties() {
  const [properties, setProperties] = useState([]);
  const [editingProperty, setEditingProperty] = useState(null);
  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [propertyType, setPropertyType] = useState('');
  const [isEquipped, setIsEquipped] = useState(false);
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState(''); // New state for agent dropdown
  const fileInputRef = useRef(null);

  const API_BASE_URL = 'http://localhost:3001/api/properties';
  const USERS_API_URL = 'http://localhost:3001/api/users';
  const token = localStorage.getItem('authToken');
  const baseUrl = 'http://localhost:3001';

  // Fetch Properties on Mount
  useEffect(() => {
    const fetchProperties = async () => {
      if (!token) {
        setError('Please sign in to view properties');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(API_BASE_URL, {
          headers: { 'Authorization': `Bearer ${token}` },
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

  // Fetch Agents (users with role "agent") on Mount
  useEffect(() => {
    const fetchAgents = async () => {
      if (!token) return;
      try {
        const response = await fetch(USERS_API_URL, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('Authentication failed. Please sign in again.');
          }
          throw new Error('Failed to fetch agents');
        }
        const data = await response.json();
        const agentList = data.filter(user => user.role === 'agent');
        setAgents(agentList);
      } catch (err) {
        console.error('Error fetching agents:', err);
        setError(err.message);
      }
    };
    fetchAgents();
  }, [token]);

  // Cleanup Preview URLs
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url.url));
    };
  }, [previewUrls]);

  // Sync propertyType, isEquipped, and selectedAgentId with editingProperty
  useEffect(() => {
    if (editingProperty) {
      setPropertyType(editingProperty.type || '');
      setIsEquipped(editingProperty.equipped || false);
      setSelectedAgentId(editingProperty.agent_id ? editingProperty.agent_id.toString() : ''); // Sync agent_id
    } else {
      setPropertyType('');
      setIsEquipped(false);
      setSelectedAgentId(''); // Reset when not editing
    }
  }, [editingProperty]);

  // Handle Edit Button
  const handleEdit = (property) => {
    console.log('Editing property:', property);
    setEditingProperty(property);
    setFeatures(Array.isArray(property.features) ? property.features : []);
    setSelectedImages([]);
    setPreviewUrls([]);
    setFeatureInput('');

    if (property.images_path && Array.isArray(property.images_path)) {
      const existingImagePreviews = property.images_path.map((img, index) => ({
        id: `existing-${index}`,
        url: `${baseUrl}${img}`,
        isExisting: true,
        name: `Image ${index + 1}`
      }));
      setPreviewUrls(existingImagePreviews);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Feature Input Handling
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

  // Image Selection Handling
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(prevImages => [...prevImages, ...files]);
    const newPreviewUrls = files.map(file => ({
      id: `new-${Date.now()}-${file.name}`,
      url: URL.createObjectURL(file),
      isExisting: false,
      name: file.name
    }));
    setPreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
  };

  const removeImage = (imageToRemove) => {
    if (imageToRemove.isExisting) {
      setPreviewUrls(prevUrls => prevUrls.filter(img => img.id !== imageToRemove.id));
    } else {
      setPreviewUrls(prevUrls => prevUrls.filter(img => img.id !== imageToRemove.id));
      const imageName = imageToRemove.name;
      setSelectedImages(prevImages => prevImages.filter(img => img.name !== imageName));
    }
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Please sign in to add or edit properties');
      return;
    }

    const formData = new FormData();
    formData.append('title', e.target.title.value);

    const priceValue = e.target.price.value;
    const parsedPrice = parseInt(priceValue);
    if (isNaN(parsedPrice)) {
      setError('Price must be a valid number');
      return;
    }
    formData.append('price', parsedPrice);

    formData.append('location', e.target.location.value);
    formData.append('type', propertyType);
    
    // Add agent_id to form data
    formData.append('agent_id', selectedAgentId); // Use controlled state value

    const bedroomsValue = e.target.bedrooms.value;
    const parsedBedrooms = parseInt(bedroomsValue);
    if (isNaN(parsedBedrooms)) {
      setError('Bedrooms must be a valid number');
      return;
    }
    formData.append('bedrooms', parsedBedrooms);

    if (propertyType === 'villa') {
      const bathroomsValue = e.target.bathrooms.value;
      if (bathroomsValue) {
        const parsedBathrooms = parseInt(bathroomsValue);
        if (isNaN(parsedBathrooms)) {
          setError('Bathrooms must be a valid number');
          return;
        }
        formData.append('bathrooms', parsedBathrooms);
      }
    } else if (propertyType) {
      const etageValue = e.target.etage.value;
      if (etageValue) {
        const parsedEtage = parseInt(etageValue);
        if (isNaN(parsedEtage)) {
          setError('Etage must be a valid number');
          return;
        }
        formData.append('etage', parsedEtage);
      }
    }

    const squareFootageValue = e.target.squareFootage.value;
    const parsedSquareFootage = parseInt(squareFootageValue);
    if (isNaN(parsedSquareFootage)) {
      setError('Square Footage must be a valid number');
      return;
    }
    formData.append('square_footage', parsedSquareFootage);

    formData.append('description', e.target.description.value);
    formData.append('features', JSON.stringify(features));
    formData.append('equipped', isEquipped);

    if (editingProperty) {
      formData.append('status', e.target.status.value);
      const keptExistingImages = previewUrls
        .filter(img => img.isExisting)
        .map(img => img.url.replace(baseUrl, ''));
      formData.append('images_path', JSON.stringify(keptExistingImages));
    } else {
      formData.append('status', 'Active');
    }

    const latValue = e.target.lat.value;
    if (latValue) {
      const parsedLat = parseFloat(latValue);
      if (isNaN(parsedLat)) {
        setError('Latitude must be a valid number');
        return;
      }
      formData.append('lat', parsedLat);
    }

    const longValue = e.target.long.value;
    if (longValue) {
      const parsedLong = parseFloat(longValue);
      if (isNaN(parsedLong)) {
        setError('Longitude must be a valid number');
        return;
      }
      formData.append('long', parsedLong);
    }

    selectedImages.forEach((file) => {
      formData.append('images', file);
    });

    try {
      let response;
      if (editingProperty) {
        response = await fetch(`${API_BASE_URL}/${editingProperty.id}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
      } else {
        response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication failed. Please sign in again.');
        }
        const errorText = await response.text();
        throw new Error(editingProperty
          ? `Failed to update property: ${errorText}`
          : `Failed to add property: ${errorText}`);
      }

      const savedProperty = await response.json();
      console.log('Saved property:', savedProperty);

      if (editingProperty) {
        setProperties(properties.map(p => (p.id === editingProperty.id ? savedProperty : p)));
        setEditingProperty(null);
      } else {
        setProperties([...properties, savedProperty]);
      }

      setFeatures([]);
      setSelectedImages([]);
      setFeatureInput('');
      setPropertyType('');
      setIsEquipped(false);
      setSelectedAgentId(''); // Reset agent selection
      previewUrls.forEach(preview => {
        if (!preview.isExisting) {
          URL.revokeObjectURL(preview.url);
        }
      });
      setPreviewUrls([]);
      e.target.reset();
    } catch (err) {
      setError(err.message);
      console.error('Submit error:', err);
    }
  };

  // Delete Property
  const handleDelete = async (id) => {
    if (!token) {
      setError('Please sign in to delete properties');
      return;
    }
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
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

  // Get Agent Name from ID
  const getAgentName = (agentId) => {
    if (!agentId) return 'No Agent';
    const agent = agents.find(a => a.id === agentId);
    return agent ? agent.name : 'Unknown Agent';
  };

  // Render
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
                  <label htmlFor="price" className="form-label">Price (DA)</label>
                  <input
                    type="number"
                    step="1"
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
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    required
                  >
                    <option value="">Select type...</option>
                    <option value="appartement">Appartement</option>
                    <option value="villa">Villa</option>
                    <option value="bureau">Bureau</option>
                  </select>
                </div>
                {/* Agent Selection Dropdown */}
                <div className="mb-3">
                  <label htmlFor="agent" className="form-label">Assigned Agent</label>
                  <select
                    className="form-select"
                    id="agent"
                    name="agent"
                    value={selectedAgentId} // Controlled value
                    onChange={(e) => setSelectedAgentId(e.target.value)} // Update state on change
                  >
                    <option value="">No Agent</option>
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Bootstrap Switch Toggle for Equipped Status */}
                <div className="mb-3 form-check form-switch d-flex align-items-center">
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    id="equipped"
                    checked={isEquipped}
                    onChange={() => setIsEquipped(!isEquipped)}
                  />
                  <label className="form-check-label" htmlFor="equipped">
                    Équipé
                  </label>
                </div>
                <div className="row mb-3">
                  <div className="col">
                    <label htmlFor="bedrooms" className="form-label"> Bedrooms</label>
                    <input
                      type="number"
                      step="1"
                      className="form-control"
                      id="bedrooms"
                      name="bedrooms"
                      defaultValue={editingProperty?.bedrooms}
                      required
                    />
                  </div>
                  {propertyType === 'villa' ? (
                    <div className="col">
                      <label htmlFor="bathrooms" className="form-label">Bathrooms</label>
                      <input
                        type="number"
                        step="1"
                        className="form-control"
                        id="bathrooms"
                        name="bathrooms"
                        defaultValue={editingProperty?.bathrooms}
                        required
                      />
                    </div>
                  ) : propertyType ? (
                    <div className="col">
                      <label htmlFor="etage" className="form-label">Etage</label>
                      <input
                        type="number"
                        step="1"
                        className="form-control"
                        id="etage"
                        name="etage"
                        defaultValue={editingProperty?.etage}
                        required
                      />
                    </div>
                  ) : null}
                </div>
                <div className="mb-3">
                  <label htmlFor="squareFootage" className="form-label">Square Footage</label>
                  <input
                    type="number"
                    step="1"
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
                  <label htmlFor="lat" className="form-label">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    className="form-control"
                    id="lat"
                    name="lat"
                    defaultValue={editingProperty?.lat}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="long" className="form-label">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    className="form-control"
                    id="long"
                    name="long"
                    defaultValue={editingProperty?.long}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="images" className="form-label">Property Images</label>
                  <div className="input-group mb-3">
                    <input
                      type="file"
                      className="form-control"
                      id="images"
                      name="images"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary d-flex align-items-center gap-2"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <FaPlus /> Select Images
                    </button>
                  </div>
                  {previewUrls.length > 0 && (
                    <div className="image-preview-container mt-2">
                      <div className="row g-2">
                        {previewUrls.map((preview) => (
                          <div key={preview.id} className="col-md-4 col-6 position-relative">
                            <div className="card h-100">
                              <img
                                src={preview.url}
                                alt={preview.name}
                                className="card-img-top"
                                style={{ height: '120px', objectFit: 'cover' }}
                              />
                              <div className="card-body p-2">
                                <p className="card-text text-truncate small mb-0">{preview.name}</p>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger mt-1"
                                  onClick={() => removeImage(preview)}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="3"
                    defaultValue={editingProperty?.description}
                    required
                  />
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
                        setSelectedImages([]);
                        setFeatureInput('');
                        setPropertyType('');
                        setIsEquipped(false);
                        setSelectedAgentId('');
                        previewUrls.forEach(preview => {
                          if (!preview.isExisting) {
                            URL.revokeObjectURL(preview.url);
                          }
                        });
                        setPreviewUrls([]);
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
                      <th>Type</th>
                      <th>Equipped</th>
                      <th>Agent</th>
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
                          {property.price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} DA
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
                              property.status === 'For Rent' ? 'bg-primary' :
                              'bg-light'
                            }`}
                          >
                            {property.status}
                          </span>
                        </td>
                        <td style={{ textDecoration: property.status === 'Sold' ? 'line-through' : 'none' }}>
                          {property.type}
                        </td>
                        <td style={{ textDecoration: property.status === 'Sold' ? 'line-through' : 'none' }}>
                          {property.equipped ? 'Yes' : 'No'}
                        </td>
                        <td style={{ textDecoration: property.status === 'Sold' ? 'line-through' : 'none' }}>
                          {getAgentName(property.agent_id)}
                        </td>
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