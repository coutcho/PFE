import { useState } from 'react';
import { FaGoogle, FaFacebook } from 'react-icons/fa';

function SignUpModal({ show, onClose, onSignInClick }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // New state for success message

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    } else if (/\d/.test(formData.fullName)) {
      newErrors.fullName = 'Full name cannot contain numbers';
    }

    if (!formData.email) newErrors.email = 'Email is required';

    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const { fullName, email, password } = formData;
      const dataToSend = { 
        nom: fullName,
        prenom: '',
        email, 
        pass: password 
      };

      try {
        const response = await fetch('http://localhost:3001/api/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });

        const data = await response.json();

        if (response.ok) {
          // Set success message instead of closing immediately
          setSuccessMessage(data.message || 'Account created successfully! Welcome aboard!');
          setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
          setErrors({});
          setServerError('');
          // Optional: Close modal after a delay
          setTimeout(() => {
            onClose();
            setSuccessMessage(''); // Clear success message after closing
          }, 2000); // 2-second delay before closing
        } else {
          setServerError(data.message || 'An error occurred during sign-up.');
        }
      } catch (error) {
        console.error('Error during sign-up:', error);
        setServerError('Network error. Please try again.');
      }
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title">Create Account</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>
            <div className="modal-body px-4">
              {successMessage ? (
                <div className="text-center py-4">
                  <div className="alert alert-success">{successMessage}</div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {serverError && <div className="alert alert-danger">{serverError}</div>}
                  
                  <div className="mb-3">
                    <input
                      type="text"
                      name="fullName"
                      className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                    {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                  </div>
                  <div className="mb-3">
                    <input
                      type="email"
                      name="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="Email address"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                  <div className="mb-3">
                    <input
                      type="password"
                      name="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>
                  <div className="mb-3">
                    <input
                      type="password"
                      name="confirmPassword"
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                  </div>
                  <button type="submit" className="btn btn-success w-100 mb-3">
                    Sign Up
                  </button>
                  <div className="text-center mb-3">
                    <span className="text-muted">or sign up with</span>
                  </div>
                  <div className="d-flex gap-2 mb-3">
                    <button type="button" className="btn btn-outline-secondary flex-grow-1">
                      <FaGoogle className="me-2" />
                      Google
                    </button>
                    <button type="button" className="btn btn-outline-secondary flex-grow-1">
                      <FaFacebook className="me-2" />
                      Facebook
                    </button>
                  </div>
                  <div className="text-center">
                    <span className="text-muted">Already have an account? </span>
                    <a
                      href="#"
                      className="text-primary text-decoration-none"
                      onClick={(e) => {
                        e.preventDefault();
                        onClose();
                        onSignInClick();
                      }}
                    >
                      Sign In
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </>
  );
}

export default SignUpModal;