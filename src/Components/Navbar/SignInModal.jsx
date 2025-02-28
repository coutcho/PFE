import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { jwtDecode } from "jwt-decode"; // Updated import

function SignInModal({ show, onClose, onSignUpClick, onForgotPasswordClick, onSignInSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await fetch("http://localhost:3001/api/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, pass: password }),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccessMessage(data.message || "Sign-in successful! Welcome back!");
          if (data.token) {
            // Store the token and decode it to get the user's role
            localStorage.setItem("authToken", data.token);
            const decodedToken = jwtDecode(data.token);
            const userRole = decodedToken.role;

            // Reset form fields and errors
            setEmail("");
            setPassword("");
            setErrors({});
            setServerError("");

            // Redirect based on user role after a 2-second delay
            setTimeout(() => {
              if (userRole === "admin") {
                navigate("/admin"); // Admin redirects to /admin
              } else {
                onSignInSuccess(); // Regular user sign-in success
                navigate("/"); // Regular user redirects to home
              }
              onClose(); // Close the modal
              setSuccessMessage(""); // Clear success message
            }, 2000);
          } else {
            throw new Error("No token received");
          }
        } else {
          setServerError(data.message || "An error occurred during sign-in.");
        }
      } catch (error) {
        console.error("Error during sign-in:", error);
        setServerError("Network error or invalid response. Please try again.");
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
              <h5 className="modal-title">Sign In</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body px-4">
              {successMessage ? (
                <div className="text-center py-4">
                  <div className="alert alert-success">{successMessage}</div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {serverError && (
                    <div className="alert alert-danger">{serverError}</div>
                  )}
                  <div className="mb-3">
                    <input
                      type="email"
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <input
                      type="password"
                      className={`form-control ${errors.password ? "is-invalid" : ""}`}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {errors.password && (
                      <div className="invalid-feedback">{errors.password}</div>
                    )}
                  </div>
                  <div className="mb-3 text-end">
                    <a
                      href="#"
                      className="text-decoration-none"
                      onClick={(e) => {
                        e.preventDefault();
                        onClose();
                        onForgotPasswordClick();
                      }}
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <button type="submit" className="btn btn-primary w-100 mb-3">
                    Sign In
                  </button>
                  <div className="text-center mb-3">
                    <span className="text-muted">or sign in with</span>
                  </div>
                  <div className="d-flex gap-2 mb-3">
                    <button
                      type="button"
                      className="btn btn-outline-secondary flex-grow-1"
                    >
                      <FaGoogle className="me-2" />
                      Google
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary flex-grow-1"
                    >
                      <FaFacebook className="me-2" />
                      Facebook
                    </button>
                  </div>
                  <div className="text-center">
                    <span className="text-muted">Don't have an account? </span>
                    <a
                      href="#"
                      className="text-primary text-decoration-none"
                      onClick={(e) => {
                        e.preventDefault();
                        onClose();
                        onSignUpClick();
                      }}
                    >
                      Create one
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

export default SignInModal;