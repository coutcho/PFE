import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import SignInModal from "./SignInModal";
import SignUpModal from "./SignUpModal";
import ForgotPasswordModal from "./ForgotPasswordModal";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(!!localStorage.getItem("authToken"));
  const navigate = useNavigate();

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

  const handleSignInSuccess = () => {
    setIsSignedIn(true);
    closeModal();
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        await fetch("http://localhost:3001/api/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
      }
      localStorage.removeItem("authToken");
      setIsSignedIn(false);
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
      localStorage.removeItem("authToken");
      setIsSignedIn(false);
      navigate("/");
    }
  };

  return (
    <nav
      className={`navbar navbar-expand-lg bg-body-tertiary rounded ${
        scrolled ? "scrolled" : ""
      }`}
      aria-label="Eleventh navbar example"
    >
      <div className="container-fluid">
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
                <li><a className="dropdown-item" href="#">Maison</a></li>
                <li><a className="dropdown-item" href="#">Villa</a></li>
                <li><a className="dropdown-item" href="#">Something else here</a></li>
              </ul>
            </li>
          </ul>
          <div className="d-flex align-items-center gap-2">
            {isSignedIn ? (
              <div className="dropdown">
                <button
                  className="btn btn-primary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Account
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
                  <li><Link className="dropdown-item" to="/favorites">Favorite Listings</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
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
          onSignInSuccess={handleSignInSuccess}
        />
      )}
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