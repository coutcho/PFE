import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function HomeValueHero() {
  const [address, setAddress] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));
  const [feedback, setFeedback] = useState({ show: false, message: '', type: '' });
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('authToken'));
  }, []);

  // Auto-hide feedback after 5 seconds
  useEffect(() => {
    let timer;
    if (feedback.show) {
      timer = setTimeout(() => {
        setFeedback({ ...feedback, show: false });
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [feedback]);

  const showFeedback = (message, type = 'error') => {
    setFeedback({
      show: true,
      message,
      type
    });
    
    // Scroll to feedback if necessary
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!isAuthenticated) {
      showFeedback('Please sign in to submit a home value request.');
      setTimeout(() => navigate('/'), 2000); // Delay redirect for 2 seconds
      return;
    }

    // Check if address is provided
    if (!address.trim()) {
      showFeedback('Please enter an address.');
      return;
    }

    // Prepare FormData
    const formData = new FormData();
    formData.append('address', address);
    selectedFiles.forEach((file) => {
      formData.append('images', file); // 'images' matches Multer's expected field name
    });

    try {
      const response = await fetch('http://localhost:3001/api/home-values', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Send auth token
        },
        body: formData, // No Content-Type header needed; FormData sets it automatically
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit home value request');
      }

      const data = await response.json();
      console.log('Server response:', data);
      showFeedback('Home value request submitted successfully! Experts will review it.', 'success');
      
      // Reset form
      setAddress('');
      setSelectedFiles([]);
      fileInputRef.current.value = null; // Clear file input

      // Optional: Navigate to inbox
      // setTimeout(() => navigate('/inbox'), 2000);
    } catch (error) {
      console.error('Error submitting home value:', error);
      showFeedback(`Failed to submit home value request: ${error.message}`);
    }
  };

  const handleImport = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    console.log('Files selected:', files);
  };

  const heroStyle = {
    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/value.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '80vh',
    position: 'relative', // For positioning the feedback
  };

  return (
    <div style={heroStyle} className="d-flex align-items-center">
      {feedback.show && (
        <div 
          className={`position-absolute top-0 start-50 translate-middle-x mt-4 alert ${
            feedback.type === 'success' ? 'alert-success' : 'alert-danger'
          } d-flex align-items-center shadow-lg border-0 fade show`}
          style={{ 
            zIndex: 1050, 
            maxWidth: '90%',
            width: '500px',
            padding: '16px 20px',
            borderRadius: '8px',
            animation: 'fadeIn 0.3s ease-in-out',
          }}
          role="alert"
        >
          <div className="d-flex justify-content-between align-items-center w-100">
            <div>
              <i className={`bi ${feedback.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
              {feedback.message}
            </div>
            <button 
              type="button" 
              className="btn-close"
              onClick={() => setFeedback({ ...feedback, show: false })}
              aria-label="Close"
            ></button>
          </div>
        </div>
      )}
      
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8 text-center text-white">
            <h1 className="display-4 fw-bold mb-4">How much is my home worth?</h1>
            <p className="lead mb-5">
              Enter your address to get your free Zestimate instantly and claim your home,
              or request a no-obligation market value offer from Zillow.
            </p>

            <form onSubmit={handleSubmit} className="mb-4">
              <div className="row g-2 justify-content-center">
                <div className="col-12 col-lg-8">
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Enter your home address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    aria-label="Home address"
                  />
                </div>
                <div className="col-6 col-lg-2">
                  <button
                    type="button"
                    className="btn btn-outline-light btn-lg w-100"
                    onClick={handleImport}
                  >
                    +
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                </div>
                <div className="col-6 col-lg-2">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100"
                  >
                    Envoyer
                  </button>
                </div>
              </div>
            </form>

            {/* Display selected file names if any */}
            {selectedFiles.length > 0 && (
              <div className="text-start bg-dark bg-opacity-50 p-2 rounded mb-3">
                <p className="mb-1 text-white-50 small">Selected files:</p>
                <div className="d-flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <span key={index} className="badge bg-light text-dark">
                      {file.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add some CSS for the fade-in animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}

export default HomeValueHero;