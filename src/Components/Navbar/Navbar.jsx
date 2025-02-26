import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // ✅ Import Link
import "./Navbar.css";
import SignInModal from "./SignInModal";
import SignUpModal from "./SignUpModal";
import ForgotPasswordModal from "./ForgotPasswordModal";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // Detect scroll and update state
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeModal = () => {
    setShowSignInModal(false);
    setShowSignUpModal(false);
    setShowForgotPasswordModal(false);
  };

  return (
    <nav
      className={`navbar navbar-expand-lg bg-body-tertiary rounded ${
        scrolled ? "scrolled" : ""
      }`}
      aria-label="Eleventh navbar example"
    >
      <div className="container-fluid">
        {/* 🔗 Updated to Link for navigation to home page */}
        <Link className="navbar-brand" to="/">
          Darek
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarsExample09"
          aria-controls="navbarsExample09"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarsExample09">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {/* 🔗 Updated Home button to Link */}
            <li className="nav-item">
              <Link className="nav-link active" aria-current="page" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                Link
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link disabled" aria-disabled="true">
                Disabled
              </a>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Louer
              </a>
              <ul className="dropdown-menu">
                <li>
                  <a className="dropdown-item" href="#">
                    Maison
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Villa
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Something else here
                  </a>
                </li>
              </ul>
            </li>
          </ul>

          {/* Buttons aligned to the right */}
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-primary"
              onClick={() => setShowSignInModal(true)}
            >
              Sign In
            </button>
            <button
              className="btn btn-primary signup"
              onClick={() => setShowSignUpModal(true)}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>

      {/* Sign In Modal */}
      {showSignInModal && (
        <SignInModal
          show={showSignInModal}
          onClose={closeModal}
          onSignUpClick={() => {
            closeModal();
            setShowSignUpModal(true);
          }}
          onForgotPasswordClick={() => {
            closeModal();
            setShowForgotPasswordModal(true);
          }}
        />
      )}

      {/* Sign Up Modal */}
      {showSignUpModal && (
        <SignUpModal
          show={showSignUpModal}
          onClose={closeModal}
          onSignInClick={() => {
            closeModal();
            setShowSignInModal(true);
          }}
        />
      )}

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <ForgotPasswordModal
          show={showForgotPasswordModal}
          onClose={closeModal}
          onBackToSignIn={() => {
            closeModal();
            setShowSignInModal(true);
          }}
        />
      )}
    </nav>
  );
}
