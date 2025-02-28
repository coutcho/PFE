import { useState } from "react";

function ForgotPasswordModal({ show, onClose, onBackToSignIn }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (email) =>
    String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true); // Show success UI
      } else {
        setError(data.message || "An error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Error requesting password reset:", error);
      setError("Network error. Please check your connection and try again.");
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title">Reset Password</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body px-4">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <p className="text-muted">
                      Enter your email address and we'll send you instructions to
                      reset your password.
                    </p>
                  </div>
                  <div className="mb-3">
                    <input
                      type="email"
                      className={`form-control ${error ? "is-invalid" : ""}`}
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {error && <div className="invalid-feedback">{error}</div>}
                  </div>
                  <button type="submit" className="btn btn-primary w-100 mb-3">
                    Continue
                  </button>
                  <div className="text-center">
                    <a
                      href="#"
                      className="text-primary text-decoration-none"
                      onClick={(e) => {
                        e.preventDefault();
                        onBackToSignIn();
                      }}
                    >
                      Back to Sign In
                    </a>
                  </div>
                </form>
              ) : (
                <div className="text-center py-4">
                  <div className="mb-4">
                    <svg
                      className="text-success"
                      width="64"
                      height="64"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                    </svg>
                  </div>
                  <h5 className="mb-3">Check your email</h5>
                  <p className="text-muted mb-4">
                    We've sent password reset instructions to:<br />
                    <strong>{email}</strong>
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={onBackToSignIn}
                  >
                    Back to Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </>
  );
}

export default ForgotPasswordModal;