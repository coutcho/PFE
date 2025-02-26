import { useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

function Properties() {
  const [properties, setProperties] = useState([
    { id: 1, title: 'Modern Apartment', price: 250000, location: 'Downtown', status: 'Active' },
    { id: 2, title: 'Family House', price: 450000, location: 'Suburbs', status: 'Active' },
  ]);

  const [editingProperty, setEditingProperty] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newProperty = {
      id: editingProperty ? editingProperty.id : Date.now(),
      title: formData.get('title'),
      price: parseFloat(formData.get('price')),
      location: formData.get('location'),
      type: formData.get('type'),
      bedrooms: parseInt(formData.get('bedrooms')),
      bathrooms: parseInt(formData.get('bathrooms')),
      squareFootage: parseFloat(formData.get('squareFootage')),
      description: formData.get('description'),
      status: 'Active'
    };

    if (editingProperty) {
      setProperties(properties.map(p => p.id === editingProperty.id ? newProperty : p));
      setEditingProperty(null);
    } else {
      setProperties([...properties, newProperty]);
    }
    e.target.reset();
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      setProperties(properties.filter(p => p.id !== id));
    }
  };

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
                  <select className="form-select" id="type" name="type" defaultValue={editingProperty?.type || ''} required>
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
                    defaultValue={editingProperty?.squareFootage}
                    required
                  />
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
                  ></textarea>
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    {editingProperty ? 'Update Property' : 'Add Property'}
                  </button>
                  {editingProperty && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setEditingProperty(null)}
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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map(property => (
                      <tr key={property.id}>
                        <td>{property.title}</td>
                        <td>${property.price.toLocaleString()}</td>
                        <td>{property.location}</td>
                        <td>
                          <span className="badge bg-success">{property.status}</span>
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