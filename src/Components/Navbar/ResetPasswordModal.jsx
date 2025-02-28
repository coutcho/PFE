import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function ResetPasswordModal({ show, onClose, onSignInClick }) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // Function to check password against HIBP (adapted from backend)
  const checkPasswordWithHIBP = async (password) => {
    try {
      const hash = new TextEncoder().encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-1', hash);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
      const prefix = hashHex.slice(0, 5);
      const suffix = hashHex.slice(5);

      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
        headers: { 'Add-Padding': 'true' },
      });
      const text = await response.text();

      const lines = text.split('\n');
      for (const line of lines) {
        const [hashSuffix, count] = line.split(':');
        if (hashSuffix === suffix) {
          return parseInt(count, 10) > 0; // True if found in breaches
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking password with HIBP:', error);
      return false; // Fallback: allow if HIBP fails
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!newPassword) newErrors.newPassword = 'New password is required';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    // Basic strength checks (synchronous)
    if (newPassword && newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    }
    if (newPassword && newPassword.toLowerCase().startsWith('12345678')) {
      newErrors.newPassword = 'This password is too common. Please choose a stronger one.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Additional HIBP check (async)
      const isPwned = await checkPasswordWithHIBP(newPassword);
      if (isPwned) {
        setErrors({ newPassword: 'This password is too common. Please choose a stronger one.' });
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/api/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword }),
        });

        const data = await response.json();

        if (response.ok) {
          setIsSuccess(true);
          setMessage(data.message);
          setNewPassword('');
          setConfirmPassword('');
          setTimeout(() => {
            setMessage('');
            setIsSuccess(false);
            onSignInClick();
            navigate('/');
          }, 2000);
        } else {
          setIsSuccess(false);
          setMessage(data.message || 'An error occurred.');
        }
      } catch (error) {
        console.error('Error in reset password:', error);
        setIsSuccess(false);
        setMessage('Network error. Please try again.');
      }
    }
  };

  const handleClose = () => {
    onClose();
    navigate('/');
  };

  if (!show) return null;

  return (
    <>
      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title">Set New Password</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>
            <div className="modal-body px-4">
              {message ? (
                <div className={`alert ${isSuccess ? 'alert-success' : 'alert-danger'}`}>
                  {message}
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <input
                      type="password"
                      className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    {errors.newPassword && <div className="invalid-feedback">{errors.newPassword}</div>}
                  </div>
                  <div className="mb-3">
                    <input
                      type="password"
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                  </div>
                  <button type="submit" className="btn btn-primary w-100 mb-3">
                    Reset Password
                  </button>
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

export default ResetPasswordModal;